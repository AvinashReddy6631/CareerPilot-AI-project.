import { useState } from "react";
import { generateQuestions as requestQuestions } from "../../services/interviewService";

export default function InterviewCoach() {
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateQuestions = async () => {
    if (!role.trim()) {
      setError("Please enter a role");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await requestQuestions(role.trim());

      setQuestions(res.data.questions || []);
    } catch (error) {
      console.error(error);
      setQuestions([]);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate questions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "900px",
        margin: "auto",
      }}
    >
      <h1>AI Interview Coach</h1>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Enter Role (Frontend Developer, AI Engineer, etc.)"
          value={role}
          onChange={(e) =>
            setRole(e.target.value)
          }
          style={{
            flex: 1,
            padding: "10px",
          }}
        />

        <button
          onClick={generateQuestions}
          disabled={loading}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          {loading
            ? "Generating..."
            : "Generate Questions"}
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "12px",
            marginBottom: "16px",
            borderRadius: "8px",
          }}
        >
          {error}
        </div>
      )}

      {questions.length > 0 && (
        <div>
          <h2>Interview Questions</h2>

          {questions.map(
            (question, index) => (
              <div
                key={index}
                style={{
                  background: "#f5f5f5",
                  padding: "15px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                }}
              >
                <strong>
                  Question {index + 1}
                </strong>

                <p>{question}</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
