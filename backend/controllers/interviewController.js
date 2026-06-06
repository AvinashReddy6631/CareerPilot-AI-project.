const ai = require("../config/ai");
const Interview = require("../models/Interview");

const generateQuestions = async (req, res) => {
  try {
    const { role } = req.body;

    const response =
      await ai.chat.completions.create({
        model: "openrouter/auto",

        messages: [
          {
            role: "user",
            content: `
Generate EXACTLY 10 SHORT interview questions for a ${role}.

Rules:
- Use simple English
- Keep questions short
- Suitable for freshers
- Suitable for Indian students
- Avoid lengthy questions

Return ONLY valid JSON.

{
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3",
    "Question 4",
    "Question 5",
    "Question 6",
    "Question 7",
    "Question 8",
    "Question 9",
    "Question 10"
  ]
}
`,
          },
        ],
      });

    const content =
      response.choices[0].message.content;

    const cleanedContent = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(cleanedContent);

    res.status(200).json({
      success: true,
      questions: data.questions,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const evaluateAnswer = async (req, res) => {
  try {
    const {
      question,
      answer,
      role,
      previousQuestions = [],
    } = req.body;

    const feedbackResponse =
      await ai.chat.completions.create({
        model: "openrouter/auto",

        messages: [
          {
            role: "user",
            content: `
You are a friendly HR interviewer.

Rules:
- Use simple English.
- Give feedback suitable for students.
- Keep feedback short.
- Avoid technical terms.
- Give practical suggestions.
- Score between 1 and 10.

Question:
${question}

Answer:
${answer}

Give easy feedback.

Return ONLY valid JSON.

{
  "score": 8,
  "feedback": "Feedback here",
  "strengths": [
    "Strength 1",
    "Strength 2"
  ],
  "weaknesses": [
    "Weakness 1",
    "Weakness 2"
  ],
  "recommendation": "Recommendation here"
}
`,
          },
        ],
      });

    const feedbackContent =
      feedbackResponse.choices[0].message.content;

    let feedbackData;

    try {
      const cleanedFeedback =
        feedbackContent
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

      feedbackData =
        JSON.parse(cleanedFeedback);
    } catch (err) {
      console.log(
        "JSON Parse Failed:",
        feedbackContent
      );

      feedbackData = {
        score: 5,
        feedback:
          "Good attempt. Keep practicing.",
        strengths: [
          "Attempted the answer",
        ],
        weaknesses: [
          "Need more details",
        ],
        recommendation:
          "Practice answering with examples.",
      };
    }

    const nextQuestionResponse =
      await ai.chat.completions.create({
        model: "openrouter/auto",

        messages: [
          {
            role: "user",
            content: `
Generate ONE SHORT interview question.

Role:
${role}

Already Asked:
${previousQuestions.join("\n")}

Rules:
- Short question
- Easy English
- Fresher level
- Do not repeat
- Indian interview style

Return ONLY the question.
`,
          },
        ],
      });

    const nextQuestion =
      nextQuestionResponse
        .choices[0]
        .message.content.trim();

    await Interview.create({
      role,
      score: Number(
        feedbackData.score || 0
      ),
    });

    res.status(200).json({
      success: true,
      score: feedbackData.score,
      feedback:
        feedbackData.feedback,
      strengths:
        feedbackData.strengths,
      weaknesses:
        feedbackData.weaknesses,
      recommendation:
        feedbackData.recommendation,
      nextQuestion,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  generateQuestions,
  evaluateAnswer,
};