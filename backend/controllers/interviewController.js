const ai = require("../config/ai");
const { OPENROUTER_MODEL, OPENROUTER_FREE_MODEL } = ai;
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
    const json = cleaned.match(/\{[\s\S]*\}/)?.[0] || cleaned;
    return JSON.parse(json);
  } catch (error) {
    console.error("Failed to parse AI JSON response:", error);
    return fallback;
  }
};

const logProviderError = (context, error) => {
  console.error(`[AI Interview] ${context}`, {
    "error.status": error.status,
    "error.response?.status": error.response?.status,
    "error.response?.data": error.response?.data,
    "error.message": error.message,
    "error.stack": error.stack,
  });
};

const localInterviewQuestions = (role) => [
  "Tell me about yourself.",
  `Why did you choose ${role}?`,
  `What core skills does a ${role} need?`,
  `Explain one project related to ${role}.`,
  `How would you solve a basic ${role} problem?`,
  "Tell me about working in a team.",
  "How do you handle feedback from teammates?",
  "How would you manage a tight deadline?",
  "What would you do after making a mistake?",
  "Why should we hire you?",
];

const isTemporaryProviderFailure = (error) => {
  const status = Number(error.status || error.response?.status);
  return (
    !status ||
    status === 408 ||
    status === 429 ||
    (status >= 500 && status < 600) ||
    ["APIConnectionError", "APIConnectionTimeoutError"].includes(error.name) ||
    ["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "ECONNRESET"].includes(error.code)
  );
};

const getOpenRouterError = (error) => {
  const status = Number(error.status || error.response?.status);

  const providerMessage =
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.message;

  if (status >= 400 && status < 500) {
    return {
      status,
      providerStatus: status,
      code: `OPENROUTER_${status}`,
      message: providerMessage || "OpenRouter rejected the request.",
    };
  }

  if (status >= 500 && status < 600) {
    return {
      status,
      providerStatus: status,
      code: `OPENROUTER_${status}`,
      message: providerMessage || "OpenRouter server error. Please try again shortly.",
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
    status: 503,
    ...(status && { providerStatus: status }),
    code: "OPENROUTER_REQUEST_FAILED",
    message: providerMessage || "OpenRouter request failed. Please try again shortly.",
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
    console.info("[AI Interview] STEP 3: Request body", req.body);
    const { role } = req.body;

    if (!role?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role is required to generate interview questions",
      });
    }

    console.info("[AI Interview] STEP 4: Role received", { role });
    console.info("[AI Interview] STEP 5: OpenRouter API key loaded", {
      loaded: Boolean(process.env.OPENROUTER_API_KEY),
    });

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "OpenRouter API key is not configured on the server",
      });
    }

    let model = OPENROUTER_MODEL;
    console.info("[AI Interview] STEP 6: Selected model", { model });
    console.info("[AI Interview] STEP 7: Sending request to OpenRouter", { model });

    let response;
    try {
      response = await ai.chat.completions.create({
        model,
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
        // Free routers can choose a reasoning model. This small structured
        // response does not need reasoning, so reserve output tokens for JSON.
        reasoning: { effort: "none", exclude: true },
        response_format: { type: "json_object" },
        max_tokens: 900,
    });
    } catch (error) {
      // A custom model can disappear or lose its free variant. Retry once using
      // the supported free router, without ever falling back for auth failures.
      const providerStatus = Number(error.status || error.response?.status);
      if (model !== OPENROUTER_FREE_MODEL && [400, 404].includes(providerStatus)) {
        logProviderError("Configured model failed; retrying with free router", error);
        model = OPENROUTER_FREE_MODEL;
        console.info("[AI Interview] STEP 6: Selected fallback model", { model });
        console.info("[AI Interview] STEP 7: Sending fallback request to OpenRouter", { model });
        response = await ai.chat.completions.create({
          model,
          messages: [
            {
              role: "user",
              content: `Generate exactly 10 short campus-placement interview questions for a ${role} role. ${INDIAN_ENGLISH_RULES} Return only valid JSON: {"questions":["Q1","Q2","Q3","Q4","Q5","Q6","Q7","Q8","Q9","Q10"]}`,
            },
          ],
          reasoning: { effort: "none", exclude: true },
          response_format: { type: "json_object" },
          max_tokens: 900,
        });
      } else {
        throw error;
      }
    }

    console.info("[AI Interview] STEP 8: OpenRouter response", {
      model: response.model,
      finishReason: response.choices?.[0]?.finish_reason,
      hasContent: Boolean(response.choices?.[0]?.message?.content),
      contentPreview: response.choices?.[0]?.message?.content?.slice(0, 500),
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      const questions = localInterviewQuestions(role);
      console.warn("[AI Interview] OpenRouter returned an empty response; using local fallback");
      console.info("[AI Interview] STEP 10: Returning success", {
        source: "local-fallback",
        questionCount: questions.length,
      });
      return res.status(200).json({
        success: true,
        questions,
        source: "local-fallback",
        warning: "OpenRouter returned an empty response; locally generated questions are being used.",
      });
    }

    const data = parseAiJson(
      content,
      { questions: [] }
    );
    console.info("[AI Interview] STEP 9: Parsed JSON", {
      questionCount: Array.isArray(data.questions) ? data.questions.length : 0,
    });

    if (!validateQuestions(data.questions)) {
      const questions = localInterviewQuestions(role);
      console.warn("[AI Interview] OpenRouter returned invalid question JSON; using local fallback", {
        finishReason: response.choices?.[0]?.finish_reason,
        contentPreview: content.slice(0, 500),
      });
      console.info("[AI Interview] STEP 10: Returning success", {
        source: "local-fallback",
        questionCount: questions.length,
      });
      return res.status(200).json({
        success: true,
        questions,
        source: "local-fallback",
        warning: "OpenRouter returned invalid question JSON; locally generated questions are being used.",
      });
    }

    console.info("[AI Interview] STEP 10: Returning success", {
      source: "openrouter",
      questionCount: data.questions.length,
    });
    return res.status(200).json({
      success: true,
      questions: data.questions.map((question) => question.trim()),
      source: "openrouter",
    });
  } catch (error) {
    logProviderError("Question generation failed", error);
    if (isTemporaryProviderFailure(error)) {
      const questions = localInterviewQuestions(req.body?.role?.trim() || "this role");
      console.warn("[AI Interview] OpenRouter unavailable; returning local questions", {
        questionCount: questions.length,
      });
      console.info("[AI Interview] STEP 10: Returning success", {
        source: "local-fallback",
        questionCount: questions.length,
      });
      return res.status(200).json({
        success: true,
        questions,
        source: "local-fallback",
        warning: "OpenRouter is temporarily unavailable; locally generated questions are being used.",
      });
    }
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
      model: OPENROUTER_MODEL,
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
        model: OPENROUTER_MODEL,
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
    logProviderError("Answer evaluation failed", error);
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
      model: OPENROUTER_MODEL,
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
    logProviderError("Final report generation failed", error);
    return sendOpenRouterError(res, error);
  }
};

module.exports = {
  generateQuestions,
  evaluateAnswer,
  generateFinalReport,
};
