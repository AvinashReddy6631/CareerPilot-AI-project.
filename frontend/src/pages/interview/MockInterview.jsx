
import { useState } from "react";
import axios from "axios";
import Webcam from "react-webcam";

export default function MockInterview() {
  const [role, setRole] = useState("");
  const [interviewStarted, setInterviewStarted] =
    useState(false);


    const [isRecording, setIsRecording] =
  useState(false);

const [confidenceScore, setConfidenceScore] =
  useState(0);

  const [question, setQuestion] = useState(
    "Tell me about yourself."
  );

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const [questionNumber, setQuestionNumber] =
    useState(1);

const [scores, setScores] = useState([]);

const [strengths, setStrengths] =
  useState([]);

const [weaknesses, setWeaknesses] =
  useState([]);

const [
  recommendation,
  setRecommendation,
] = useState("");



  const [
    previousQuestions,
    setPreviousQuestions,
  ] = useState([]);

  const [
    interviewFinished,
    setInterviewFinished,
  ] = useState(false);

  const speakQuestion = (text) => {
    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 1;

    window.speechSynthesis.speak(speech);
  };

  const startInterview = () => {
    if (!role) {
      alert("Please select a role");
      return;
    }

    setInterviewStarted(true);

    speakQuestion(
      `Hello. Welcome to CareerPilot AI Interview. Today I will conduct your ${role} interview. We will go through ten questions. Let's begin. Tell me about yourself.`
    );
  };

const startRecording = () => {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert(
      "Speech Recognition is not supported"
    );
    return;
  }

  const recognition =
    new SpeechRecognition();

  recognition.lang = "en-US";

  setIsRecording(true);

  recognition.onresult = (event) => {
    const transcript =
      event.results[0][0].transcript;

    setAnswer(transcript);

    const words =
      transcript.split(" ").length;

    const score = Math.min(
      100,
      words * 2
    );

    setConfidenceScore(score);
  };

  recognition.onend = () => {
    setIsRecording(false);
  };

  recognition.start();
};

  const submitAnswer = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/interview/evaluate",
        {
          role,
          question,
          answer,
          previousQuestions,
        }
      );


setFeedback(res.data.feedback);

setStrengths(
  res.data.strengths || []
);

setWeaknesses(
  res.data.weaknesses || []
);

setRecommendation(
  res.data.recommendation || ""
);



      setScores((prev) => [
        ...prev,
        res.data.score || 0,
      ]);

      if (questionNumber >= 10) {
        setInterviewFinished(true);
        return;
      }

      setPreviousQuestions((prev) => [
        ...prev,
        question,
      ]);

      if (res.data.nextQuestion) {
        setQuestion(
          res.data.nextQuestion
        );

        speakQuestion(
          res.data.nextQuestion
        );

        setQuestionNumber(
          (prev) => prev + 1
        );
      }

      setAnswer("");
    } catch (error) {
      console.log(error);

      alert(
        "Failed to evaluate answer"
      );
    } finally {
      setLoading(false);
    }
  };

  const averageScore =
    scores.length > 0
      ? (
          scores.reduce(
            (a, b) => a + b,
            0
          ) / scores.length
        ).toFixed(1)
      : 0;

  if (!interviewStarted) {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "100px auto",
          textAlign: "center",
        }}
      >
        <h1>CareerPilot AI</h1>

        <h2>
          Select Interview Role
        </h2>

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value)
          }
          style={{
            padding: "12px",
            width: "320px",
          }}
        >
          <option value="">
            Select Role
          </option>

          <option>
            Frontend Developer
          </option>

          <option>
            Backend Developer
          </option>

          <option>
            Full Stack Developer
          </option>

          <option>
            Python Developer
          </option>

          <option>
            Java Developer
          </option>

          <option>
            Data Analyst
          </option>

          <option>
            Data Scientist
          </option>

          <option>
            AI Engineer
          </option>
        </select>

        <br />
        <br />

        <button
          onClick={startInterview}
        >
          Start Interview
        </button>
      </div>
    );
  }

if (interviewFinished) {
  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "50px auto",
        padding: "30px",
        textAlign: "center",
      }}
    >
      <h1>
        🎉 Interview Completed
      </h1>

      <h2>
        Role: {role}
      </h2>

      <h2>
        Average Score:
        {averageScore}/10
      </h2>

      <h3>
        Questions Answered:
        {scores.length}
      </h3>

      <br />

      <div
        style={{
          background: "#f5f5f5",
          padding: "25px",
          borderRadius: "12px",
          textAlign: "left",
        }}
      >
        <h3>✅ Strengths</h3>

        <ul>
          {strengths.map(
            (item, index) => (
              <li key={index}>
                {item}
              </li>
            )
          )}
        </ul>

        <h3>
          ⚠ Areas To Improve
        </h3>

        <ul>
          {weaknesses.map(
            (item, index) => (
              <li key={index}>
                {item}
              </li>
            )
          )}
        </ul>

        <h3>
          🎯 Recommendation
        </h3>

        <p>
          {recommendation}
        </p>
      </div>

      <br />

      <button
        onClick={() =>
          window.location.reload()
        }
      >
        Start New Interview
      </button>
    </div>
  );
}


  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "auto",
        padding: "30px",
      }}
    >
      <h1>AI Mock Interview</h1>

      <h3>
        Question {questionNumber}/10
      </h3>

      <div
        style={{
          width: "100%",
          height: "12px",
          background: "#ddd",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: `${
              Math.min(
                questionNumber,
                10
              ) * 10
            }%`,
            height: "100%",
            background: "#4CAF50",
            borderRadius: "10px",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
        }}
      >
        <div style={{ flex: 2 }}>
          <button
            onClick={() =>
              speakQuestion(question)
            }
          >
            🔊 Hear Question
          </button>

          <br />
          <br />

          <div
            style={{
              background: "#f5f5f5",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h3>Question</h3>
            <p>{question}</p>
          </div>

          <br />

          <button
            onClick={startRecording}
          >
            <button
  onClick={startRecording}
>
  {isRecording
    ? "🔴 Recording..."
    : "🎤 Start Speaking"}
</button>          </button>

          <br />
          <br />

          <textarea
            rows="6"
            value={answer}
            onChange={(e) =>
              setAnswer(
                e.target.value
              )
            }
            placeholder="Your answer..."
            style={{
              width: "100%",
              padding: "10px",
            }}
          />
          <div
  style={{
    marginTop: "10px",
    background: "#f5f5f5",
    padding: "10px",
    borderRadius: "10px",
  }}
>
  <strong>
    Confidence Score:
  </strong>{" "}
  {confidenceScore}%
</div>

          <br />
          <br />

          <button
            onClick={submitAnswer}
            disabled={loading}
          >
            {loading
              ? "Evaluating..."
              : "Submit Answer"}
          </button>

          {feedback && (
            <div
              style={{
                marginTop: "20px",
                background: "#eef7ff",
                padding: "20px",
                borderRadius: "10px",
              }}
            >
              <h3>AI Feedback</h3>

              <pre
                style={{
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {feedback}
              </pre>
            </div>
          )}
        </div>

        <div
          style={{
            flex: 1,
            textAlign: "center",
          }}
        >
          <h3>Your Camera</h3>

          <Webcam
            audio={false}
            width={320}
            height={240}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: "user",
            }}
            style={{
              borderRadius: "12px",
              border:
                "3px solid #4CAF50",
            }}
          />

          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              background: "#f5f5f5",
              borderRadius: "10px",
            }}
          >
            <strong>
              Interview Status
            </strong>

            <p>
              Question{" "}
              {questionNumber} of 10
            </p>

            <p>Role: {role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
