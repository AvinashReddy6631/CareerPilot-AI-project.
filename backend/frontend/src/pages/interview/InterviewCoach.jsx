import { useState } from "react";
import axios from "axios";

export default function InterviewCoach() {
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateQuestions = async () => {
    if (!role.trim()) {
      alert("Please enter a role");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
  `${import.meta.env.VITE_API_URL}/api/interview/generate-questions`,
  {
    role,
  }
);

      setQuestions(res.data.questions);
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to generate questions"
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