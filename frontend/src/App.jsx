import { BrowserRouter, Routes, Route } from "react-router-dom";
import ATSAnalyzer from "./pages/dashboard/ATSAnalyzer";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";

import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ResumeBuilder from "./pages/resumebuilder/ResumeBuilder";
import InterviewCoach from "./pages/interview/InterviewCoach";
import CareerRoadmap from "./pages/roadmap/CareerRoadmap";
import MockInterview from "./pages/interview/MockInterview";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/ats" element={<ATSAnalyzer />} />

          <Route
            path="/register"
            element={<Register />}
          />
          <Route
  path="/resume-builder"
  element={<ResumeBuilder />}
/>
<Route
  path="/interview"
  element={<InterviewCoach />}
/>
<Route
  path="/roadmap"
  element={<CareerRoadmap />}
/>
<Route
  path="/mock-interview"
  element={<MockInterview />}
/>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;