import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import Login from "./pages/auth/Login";

const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const ATSAnalyzer = lazy(() => import("./pages/dashboard/ATSAnalyzer"));
const ResumeBuilder = lazy(() => import("./pages/resumebuilder/ResumeBuilder"));
const InterviewCoach = lazy(() => import("./pages/interview/InterviewCoach"));
const CareerRoadmap = lazy(() => import("./pages/roadmap/CareerRoadmap"));
const MockInterview = lazy(() => import("./pages/interview/MockInterview"));
const JobFinder = lazy(() => import("./pages/jobs/JobFinder"));
const ApplicationTracker = lazy(() => import("./pages/applications/ApplicationTracker"));
const Profile = lazy(() => import("./pages/profile/Profile"));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/reset-password" element={<ResetPassword />} />

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
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
