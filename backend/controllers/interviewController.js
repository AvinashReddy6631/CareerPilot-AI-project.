const ai = require("../config/ai");
const Interview = require("../models/Interview");

const INDIAN_ENGLISH_RULES = `
- Use simple Indian English (like how Indian HR interviewers speak).
- Keep sentences short and friendly — suitable for college students and freshers.
- Avoid heavy jargon; explain simply if needed.
- Sound encouraging, not intimidating.
- Use phrases like "Tell me", "Can you explain", "What do you know about" naturally.
`;

const parseAiJson = (content, fallback) => {
  try {
    if (!content) return fallback;
    const cleaned = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse AI JSON response:", error);
    return fallback;
  }
};

const getOpenRouterError = (error) => {
  const status = Number(error.status || error.response?.status);

  const knownErrors = {
    401: {
      message: "The OpenRouter API key is invalid or belongs to an unknown account.",
      code: "OPENROUTER_INVALID_API_KEY",
      responseStatus: 502,
    },
    403: {
      message: "OpenRouter access was denied for this API key.",
      code: "OPENROUTER_ACCESS_DENIED",
      responseStatus: 502,
    },
    404: {
      message: "The configured OpenRouter model is invalid or unavailable.",
      code: "OPENROUTER_INVALID_MODEL",
      responseStatus: 502,
    },
    429: {
      message: "OpenRouter rate limit exceeded. Please try again shortly.",
      code: "OPENROUTER_RATE_LIMITED",
      responseStatus: 429,
    },
    500: {
      message: "OpenRouter server error. Please try again shortly.",
      code: "OPENROUTER_SERVER_ERROR",
      responseStatus: 503,
    },
  };

  if (knownErrors[status]) {
    const { responseStatus, ...details } = knownErrors[status];
    return { status: responseStatus, providerStatus: status, ...details };
  }

  if (status >= 500 && status < 600) {
    return {
      status: 503,
      providerStatus: status,
      code: "OPENROUTER_SERVER_ERROR",
      message: "OpenRouter server error. Please try again shortly.",
    };
  }

  if (
    error.name === "APIConnectionError" ||
    error.code === "ECONNREFUSED" ||
    error.code === "ENOTFOUND" ||
    error.code === "ETIMEDOUT"
  ) {
    return {
      status: 503,
      code: "OPENROUTER_UNREACHABLE",
      message: "Unable to reach OpenRouter. Please try again shortly.",
    };
  }

  return {
    status: status >= 400 && status < 500 ? 502 : 500,
    code: "OPENROUTER_REQUEST_FAILED",
    message:
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      "OpenRouter request failed. Please try again shortly.",
  };
};

const sendOpenRouterError = (res, error) => {
  const { status, code, message, providerStatus } = getOpenRouterError(error);
  return res.status(status).json({
    success: false,
    code,
    message,
    ...(providerStatus && { providerStatus }),
  });
};

const validateQuestions = (questions) =>
  Array.isArray(questions) &&
  questions.length > 0 &&
  questions.every((question) => typeof question === "string" && question.trim());

const generateQuestions = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role is required to generate interview questions",
      });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "OpenRouter API key is not configured on the server",
      });
    }

    const response = await ai.chat.completions.create({
      model: "openrouter/auto",
      messages: [
        {
          role: "user",
          content: `
You are an Indian HR interviewer conducting a campus placement interview for a ${role} role.

Generate EXACTLY 10 SHORT interview questions.

${INDIAN_ENGLISH_RULES}

Question mix:
- 2 introduction / background questions
- 3 role-specific technical basics (fresher level)
- 2 behavioural / teamwork questions
- 2 situational questions
- 1 closing question ("Any questions for us?" or "Why should we hire you?")

Each question must be under 15 words. Return ONLY valid JSON:

{
  "questions": ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10"]
}
`, 
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({
        success: false,
        message: "OpenRouter returned an empty response",
      });
    }

    const data = parseAiJson(
      content,
      { questions: [] }
    );

    if (!validateQuestions(data.questions)) {
      return res.status(502).json({
        success: false,
        message: "OpenRouter returned an invalid questions format",
      });
    }

    res.status(200).json({
      success: true,
      questions: data.questions.map((question) => question.trim()),
    });
  } catch (error) {
    console.error(error);
    return sendOpenRouterError(res, error);
  }
};

const evaluateAnswer = async (req, res) => {
  try {
    const {
      question,
      answer,
      role,
      previousQuestions = [],
      isLastQuestion = false,
    } = req.body;

    const feedbackResponse = await ai.chat.completions.create({
      model: "openrouter/auto",
      messages: [
        {
          role: "user",
          content: `
You are a friendly Indian HR interviewer evaluating a student's mock interview answer.

${INDIAN_ENGLISH_RULES}

Role: ${role}
Question: ${question}
Answer: ${answer || "(No answer provided)"}

Evaluate fairly for a fresher/student level.

Return ONLY valid JSON:
{
  "score": 7,
  "communicationScore": 7,
  "feedback": "2-3 short sentences of encouraging feedback",
  "strengths": ["One specific strength", "Another strength"],
  "weaknesses": ["One area to improve", "Another area"],
  "recommendation": "One practical tip for next time"
}

Scoring guide (1-10):
- score: overall answer quality (content, relevance, examples)
- communicationScore: clarity, structure, confidence in delivery
`,
        },
      ],
    });

    const feedbackData = parseAiJson(
      feedbackResponse.choices[0].message.content,
      {
        score: 5,
        communicationScore: 5,
        feedback: "Good attempt! Keep practising with more examples from your projects.",
        strengths: ["You attempted the question"],
        weaknesses: ["Add more specific examples"],
        recommendation: "Practice the STAR method for behavioural questions.",
      }
    );

    let nextQuestion = null;

    if (!isLastQuestion) {
      const nextQuestionResponse = await ai.chat.completions.create({
        model: "openrouter/auto",
        messages: [
          {
            role: "user",
            content: `
Generate ONE SHORT interview question for a ${role} fresher interview.

Already asked:
${[question, ...previousQuestions].join("\n")}

${INDIAN_ENGLISH_RULES}
- Under 15 words
- Do not repeat any previous question
- Fresher / campus placement level

Return ONLY the question text, nothing else.
`,
          },
        ],
      });

      nextQuestion = nextQuestionResponse.choices[0].message.content.trim();
    }

    await Interview.create({
      user: req.user.id,
      role,
      score: Number(feedbackData.score || 0),
    });

    res.status(200).json({
      success: true,
      score: feedbackData.score,
      communicationScore: feedbackData.communicationScore,
      feedback: feedbackData.feedback,
      strengths: feedbackData.strengths || [],
      weaknesses: feedbackData.weaknesses || [],
      recommendation: feedbackData.recommendation || "",
      nextQuestion,
    });
  } catch (error) {
    console.error(error);
    return sendOpenRouterError(res, error);
  }
};

const generateFinalReport = async (req, res) => {
  try {
    const { role, transcript = [] } = req.body;

    const transcriptText = transcript
      .map(
        (entry, i) =>
          `Q${i + 1}: ${entry.question}\nA: ${entry.answer}\nScore: ${entry.score}/10 | Communication: ${entry.communicationScore}/10`
      )
      .join("\n\n");

    const response = await ai.chat.completions.create({
      model: "openrouter/auto",
      messages: [
        {
          role: "user",
          content: `
You are an Indian career coach reviewing a student's complete mock interview for a ${role} role.

${INDIAN_ENGLISH_RULES}

Full interview transcript:
${transcriptText}

Create a final performance report. Return ONLY valid JSON:
{
  "averageScore": 7.5,
  "averageCommunication": 7.0,
  "averageConfidence": 7.0,
  "grade": "Good",
  "strengths": ["Top strength 1", "Top strength 2", "Top strength 3"],
  "weaknesses": ["Key weakness 1", "Key weakness 2", "Key weakness 3"],
  "recommendations": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"],
  "summary": "2-3 sentence overall summary in encouraging Indian English"
}

grade options: Excellent, Good, Average, Needs Practice
`,
        },
      ],
    });

    const report = parseAiJson(response.choices[0].message.content, {
      averageScore: 5,
      averageCommunication: 5,
      averageConfidence: 5,
      grade: "Average",
      strengths: ["Completed the full interview"],
      weaknesses: ["Practice more structured answers"],
      recommendations: ["Review common interview questions daily"],
      summary: "Good effort! Keep practising to build confidence.",
    });

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error(error);
    return sendOpenRouterError(res, error);
  }
};

module.exports = {
  generateQuestions,
  evaluateAnswer,
  generateFinalReport,
};
