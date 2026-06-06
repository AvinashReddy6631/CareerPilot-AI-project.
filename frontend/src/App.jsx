import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./components/dashboard/DashboardLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import Dashboard from "./pages/dashboard/Dashboard";
import ATSAnalyzer from "./pages/dashboard/ATSAnalyzer";
import ResumeBuilder from "./pages/resumebuilder/ResumeBuilder";
import InterviewCoach from "./pages/interview/InterviewCoach";
import CareerRoadmap from "./pages/roadmap/CareerRoadmap";
import MockInterview from "./pages/interview/MockInterview";
import JobFinder from "./pages/jobs/JobFinder";
import ApplicationTracker from "./pages/applications/ApplicationTracker";
import Profile from "./pages/profile/Profile";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/ats" element={<ATSAnalyzer />} />
              <Route path="/interview" element={<InterviewCoach />} />
              <Route path="/mock-interview" element={<MockInterview />} />
              <Route path="/roadmap" element={<CareerRoadmap />} />
              <Route path="/jobs" element={<JobFinder />} />
              <Route path="/applications" element={<ApplicationTracker />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
