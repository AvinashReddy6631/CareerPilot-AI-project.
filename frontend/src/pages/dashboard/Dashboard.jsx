import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Dashboard() {
const { logout } = useAuth();
const navigate = useNavigate();

const [analytics, setAnalytics] = useState({
resumesBuilt: 0,
interviewsTaken: 0,
averageScore: 0,
bestScore: 0,
});

useEffect(() => {
fetchAnalytics();
}, []);

const fetchAnalytics = async () => {
try {
const res = await axios.get(
"http://localhost:5000/api/dashboard/analytics"
);


  setAnalytics(res.data);
} catch (error) {
  console.log(error);
}


};

const handleLogout = () => {
logout();
navigate("/");
};

const cardStyle = {
background: "#fff",
padding: "20px",
borderRadius: "12px",
boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

return (
<div
style={{
minHeight: "100vh",
background: "#f4f7fc",
padding: "30px",
}}
>
<div
style={{
maxWidth: "1200px",
margin: "auto",
}}
> <h1>🚀 CareerPilot AI Dashboard</h1>

```
    <p>
      Welcome to your AI Career Assistant Platform.
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(250px,1fr))",
        gap: "20px",
        marginTop: "30px",
      }}
    >
      <div style={cardStyle}>
        <h3>📄 Resume Builder</h3>
        <p>
          Build ATS-friendly resumes with templates.
        </p>
        <Link to="/resume-builder">
          Open
        </Link>
      </div>

      <div style={cardStyle}>
        <h3>📊 ATS Analyzer</h3>
        <p>
          Check ATS score and improve your resume.
        </p>
        <Link to="/ats">
          Open
        </Link>
      </div>

      <div style={cardStyle}>
        <h3>🎤 Interview Coach</h3>
        <p>
          Generate interview questions instantly.
        </p>
        <Link to="/interview">
          Open
        </Link>
      </div>

      <div style={cardStyle}>
        <h3>🤖 Mock Interview</h3>
        <p>
          Practice AI-powered mock interviews with scoring.
        </p>
        <Link to="/mock-interview">
          Open
        </Link>
      </div>

      <div style={cardStyle}>
        <h3>🛣 Career Roadmap</h3>
        <p>
          Generate career learning paths and roadmaps.
        </p>
        <Link to="/roadmap">
          Open
        </Link>
      </div>
    </div>

    <h2
      style={{
        marginTop: "50px",
      }}
    >
      📈 Analytics
    </h2>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap: "20px",
        marginTop: "20px",
      }}
    >
      <div style={cardStyle}>
        <h3>Resumes Built</h3>
        <h1>{analytics.resumesBuilt}</h1>
      </div>

      <div style={cardStyle}>
        <h3>Interviews Taken</h3>
        <h1>{analytics.interviewsTaken}</h1>
      </div>

      <div style={cardStyle}>
        <h3>Average Score</h3>
        <h1>{analytics.averageScore}</h1>
      </div>

      <div style={cardStyle}>
        <h3>Best Score</h3>
        <h1>{analytics.bestScore}</h1>
      </div>
    </div>

    <button
      onClick={handleLogout}
      style={{
        marginTop: "40px",
        padding: "12px 20px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      Logout
    </button>
  </div>
</div>

);
}
