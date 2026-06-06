import { useState } from "react";
import axios from "axios";

export default function ATSAnalyzer() {
  const [file, setFile] = useState(null);

  const [jobDescription, setJobDescription] =
    useState("");

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a resume");
      return;
    }

    if (!jobDescription.trim()) {
      alert(
        "Please paste a Job Description"
      );
      return;
    }

    try {
      setLoading(true);

      const formData =
        new FormData();

      formData.append(
        "resume",
        file
      );

      formData.append(
        "jobDescription",
        jobDescription
      );

      const res =
        await axios.post(
          "http://localhost:5000/api/resume/upload",
          formData
        );

      setResult(res.data);
    } catch (error) {
      console.log(error);

      alert("Analysis Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "auto",
        padding: "30px",
      }}
    >
      <h1>
        ATS Resume Analyzer
      </h1>

      <textarea
        rows="12"
        placeholder="Paste Job Description Here..."
        value={jobDescription}
        onChange={(e) =>
          setJobDescription(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: "15px",
          marginBottom: "20px",
        }}
      />

      <input
        type="file"
        accept=".pdf"
        onChange={(e) =>
          setFile(
            e.target.files[0]
          )
        }
      />

      <br />
      <br />

      <button
        onClick={handleUpload}
        disabled={loading}
      >
        {loading
          ? "Analyzing..."
          : "Analyze Resume"}
      </button>

      {result && (
        <div
          style={{
            marginTop: "30px",
          }}
        >
          <h2>
            ATS Score:
            {" "}
            {result.atsScore}%
          </h2>

          <h3>
            Matched Skills (
            {
              result.matchedCount
            }
            /
            {
              result.totalKeywords
            }
            )
          </h3>

          <ul>
            {result.matchedSkills.map(
              (skill) => (
                <li key={skill}>
                  ✅ {skill}
                </li>
              )
            )}
          </ul>

          <h3>
            Missing Skills
          </h3>

          <ul>
            {result.missingSkills.map(
              (skill) => (
                <li key={skill}>
                  ❌ {skill}
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}