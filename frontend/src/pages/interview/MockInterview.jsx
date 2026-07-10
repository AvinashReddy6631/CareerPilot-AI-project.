import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import PageShell from "../../components/dashboard/PageShell";
import StepIndicator from "../../components/interview/StepIndicator";
import ScoreRing from "../../components/interview/ScoreRing";
import InterviewTimer from "../../components/interview/InterviewTimer";
import {
  generateQuestions,
  evaluateAnswer,
  generateFinalReport,
  getInterviewErrorMessage,
  saveInterviewHistory,
} from "../../services/interviewService";

const TOTAL_QUESTIONS = 10;

const ROLES = [
  { id: "frontend", label: "Frontend Developer", icon: "🎨", desc: "React, UI, web apps" },
  { id: "backend", label: "Backend Developer", icon: "⚙️", desc: "APIs, databases, servers" },
  { id: "fullstack", label: "Full Stack Developer", icon: "🚀", desc: "End-to-end development" },
  { id: "python", label: "Python Developer", icon: "🐍", desc: "Python, Django, automation" },
  { id: "java", label: "Java Developer", icon: "☕", desc: "Java, Spring Boot" },
  { id: "data-analyst", label: "Data Analyst", icon: "📊", desc: "SQL, Excel, dashboards" },
  { id: "data-scientist", label: "Data Scientist", icon: "🧠", desc: "ML, statistics, Python" },
  { id: "ai-engineer", label: "AI Engineer", icon: "🤖", desc: "LLMs, AI systems" },
];

const INSTRUCTIONS = [
  {
    icon: "🎯",
    title: "10 Short Questions",
    text: "Realistic campus placement style — one question at a time, just like a real HR round.",
  },
  {
    icon: "🎤",
    title: "Speak or Type",
    text: "Use your mic to answer naturally, or type if you prefer. Both work fine.",
  },
  {
    icon: "📹",
    title: "Camera On",
    text: "Keep your webcam on to practise body language and eye contact.",
  },
  {
    icon: "⏱️",
    title: "Take Your Time",
    text: "No rush — think, structure your answer, then submit when ready.",
  },
  {
    icon: "📋",
    title: "Live Feedback",
    text: "Get confidence & communication scores plus a full report at the end.",
  },
];

function computeConfidenceScore(text, speechConfidence = 0) {
  if (!text?.trim()) return 0;
  const words = text.trim().split(/\s+/).length;
  const fillers = (text.match(/\b(um|uh|like|basically|actually|you know)\b/gi) || []).length;
  const wordScore = Math.min(70, words * 2.5);
  const fillerPenalty = fillers * 5;
  const speechBoost = speechConfidence * 30;
  return Math.round(Math.max(0, Math.min(100, wordScore - fillerPenalty + speechBoost)));
}

function speakText(text) {
  try {
    if (!text || !text.toString().trim()) return;

    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      console.warn("SpeechSynthesis API not available");
      return;
    }

    // Stop anything currently speaking, so replay always works.
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      // Prefer en-IN, but fall back to default.
      const voice =
        voices.find((v) => (v.lang || "").toLowerCase().startsWith("en-in")) ||
        voices.find((v) => (v.lang || "").toLowerCase().startsWith("en")) ||
        voices[0];

      if (voice) utterance.voice = voice;
      return voices.length;
    };

    const voiceCount = pickVoice();

    // If voices are not loaded yet (common on first call), retry shortly.
    if (voiceCount === 0) {
      console.warn("No voices available yet. Retrying speak...");

      // Avoid losing the user-initiated click; schedule a retry.
      setTimeout(() => {
        try {
          window.speechSynthesis.cancel();
          pickVoice();
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.error("Speech retry failed:", e);
        }
      }, 250);
    } else {
      window.speechSynthesis.speak(utterance);
    }

    // Debug logging for production issues.
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis utterance error:", e);
    };

    utterance.onend = () => {
      // no-op; helps ensure no silent failures during debugging
    };
  } catch (e) {
    console.error("speakText failed:", e);
  }
}


const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25 },
};

export default function MockInterview() {
  const [step, setStep] = useState("role");
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [communicationScore, setCommunicationScore] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [currentFeedback, setCurrentFeedback] = useState("");
  const [finalReport, setFinalReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState("");

  const [micStatus, setMicStatus] = useState("idle");
  const [micTranscript, setMicTranscript] = useState("");
  const [cameraReady, setCameraReady] = useState(false);

  const recognitionRef = useRef(null);
  const webcamRef = useRef(null);

  const currentQuestion = questions[questionIndex] || "";
  const progress = ((questionIndex + (transcript.length > questionIndex ? 1 : 0)) / TOTAL_QUESTIONS) * 100;

  useEffect(() => {
    if (step !== "session") return;
    const id = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (step !== "session") return;
    setQuestionSeconds(0);
    const id = setInterval(() => setQuestionSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [step, questionIndex]);

  const startSpeechRecognition = useCallback((onResult, onEnd) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let text = "";
      let confidence = 0;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
        confidence = Math.max(confidence, event.results[i][0].confidence || 0);
      }
      onResult(text, confidence);
    };

    recognition.onend = () => onEnd?.();
    recognition.onerror = () => onEnd?.();

    recognition.start();
    return recognition;
  }, []);

  const handleMicTest = () => {
    setMicStatus("testing");
    setMicTranscript("");
    recognitionRef.current = startSpeechRecognition(
      (text) => {
        setMicTranscript(text);
        if (text.trim().length > 5) setMicStatus("passed");
      },
      () => {
        setMicStatus((prev) => (prev === "testing" ? "failed" : prev));
        setIsRecording(false);
      }
    );
    setIsRecording(true);
  };

  const handleSessionRecord = () => {
    setIsRecording(true);
    recognitionRef.current = startSpeechRecognition(
      (text, confidence) => {
        setAnswer(text);
        setConfidenceScore(computeConfidenceScore(text, confidence));
      },
      () => setIsRecording(false)
    );
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const loadQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await generateQuestions(role);
      const qs = res.data.questions || [];
      if (qs.length < 1) throw new Error("Could not generate questions");
      setQuestions(qs.slice(0, TOTAL_QUESTIONS));
      setStep("session");
      speakText(
        `Hello! Welcome to your ${role} mock interview with CareerPilot AI. We will go through ${TOTAL_QUESTIONS} questions. All the best! Here is your first question. ${qs[0]}`
      );
    } catch (error) {
      setError(
        getInterviewErrorMessage(error, "Unable to generate interview questions.")
      );
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      setError("Please provide an answer before submitting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isLast = questionIndex >= TOTAL_QUESTIONS - 1;
      const res = await evaluateAnswer({
        role,
        question: currentQuestion,
        answer,
        previousQuestions: questions.slice(0, questionIndex),
        isLastQuestion: isLast,
      });

      const entry = {
        question: currentQuestion,
        answer,
        score: res.data.score || 0,
        communicationScore: res.data.communicationScore || 0,
        confidenceScore,
        feedback: res.data.feedback || "",
        timestamp: new Date().toISOString(),
      };

      setTranscript((prev) => [...prev, entry]);
      setCommunicationScore(res.data.communicationScore || 0);
      setCurrentFeedback(res.data.feedback || "");

      if (isLast) {
        await finishInterview([...transcript, entry]);
        return;
      }

      const nextIdx = questionIndex + 1;
      const nextQ = questions[nextIdx] || res.data.nextQuestion;
      if (nextQ && !questions[nextIdx]) {
        setQuestions((prev) => {
          const updated = [...prev];
          updated[nextIdx] = nextQ;
          return updated;
        });
      }

      setQuestionIndex(nextIdx);
      setAnswer("");
      setConfidenceScore(0);
      setCommunicationScore(0);
      setCurrentFeedback("");

      if (nextQ) {
        speakText(nextQ);
      }
    } catch (error) {
      setError(getInterviewErrorMessage(error, "Unable to evaluate your answer."));
    } finally {
      setLoading(false);
    }
  };

  const finishInterview = async (fullTranscript) => {
    setReportLoading(true);
    setStep("report");

    try {
      const res = await generateFinalReport(role, fullTranscript);
      const report = res.data.report;

      const avgScore =
        fullTranscript.reduce((s, t) => s + t.score, 0) / fullTranscript.length;
      const avgComm =
        fullTranscript.reduce((s, t) => s + t.communicationScore, 0) / fullTranscript.length;
      const avgConf =
        fullTranscript.reduce((s, t) => s + t.confidenceScore, 0) / fullTranscript.length;

      const enriched = {
        ...report,
        averageScore: report.averageScore || avgScore,
        averageCommunication: report.averageCommunication || avgComm,
        averageConfidence: report.averageConfidence || avgConf / 10,
      };

      setFinalReport(enriched);

      await saveInterviewHistory({
        role,
        averageScore: enriched.averageScore,
        strengths: enriched.strengths,
        weaknesses: enriched.weaknesses,
        recommendations: enriched.recommendations,
        averageCommunication: enriched.averageCommunication,
        averageConfidence: enriched.averageConfidence,
        grade: enriched.grade,
        summary: enriched.summary,
      });
    } catch (error) {
      setError(getInterviewErrorMessage(error, "Unable to generate the final report."));
      const avgScore =
        fullTranscript.reduce((s, t) => s + t.score, 0) / fullTranscript.length;
      setFinalReport({
        averageScore: avgScore,
        averageCommunication:
          fullTranscript.reduce((s, t) => s + t.communicationScore, 0) / fullTranscript.length,
        averageConfidence:
          fullTranscript.reduce((s, t) => s + t.confidenceScore, 0) / fullTranscript.length / 10,
        grade: avgScore >= 8 ? "Excellent" : avgScore >= 6 ? "Good" : "Needs Practice",
        strengths: ["Completed all questions", "Showed willingness to answer"],
        weaknesses: ["Add more project examples", "Structure answers better"],
        recommendations: ["Practice STAR method", "Record yourself and review", "Study common HR questions"],
        summary: "Good effort! Keep practising to improve your interview confidence.",
      });
    } finally {
      setReportLoading(false);
    }
  };

  const resetInterview = () => {
    setStep("role");
    setRole("");
    setQuestions([]);
    setQuestionIndex(0);
    setAnswer("");
    setTranscript([]);
    setFinalReport(null);
    setSessionSeconds(0);
    setQuestionSeconds(0);
    setConfidenceScore(0);
    setCommunicationScore(0);
    setCurrentFeedback("");
    setMicStatus("idle");
    setMicTranscript("");
    setCameraReady(false);
    setError("");
  };

  return (
    <PageShell
      title="AI Interview Simulator"
      description="Premium mock interview with live scoring, transcript, and personalised feedback — built for Indian students."
    >
      <StepIndicator currentStep={step} />

      <AnimatePresence mode="wait">
        {/* ── Step 1: Role Selection ── */}
        {step === "role" && (
          <motion.div key="role" {...fade}>
            <div className="mb-6 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
                AI-Powered · Campus Placement Style
              </span>
              <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                Choose Your Interview Role
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pick the role you are preparing for. Questions will be tailored accordingly.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.label)}
                  className={`dash-card group p-4 text-left transition-all hover:shadow-md sm:p-5 ${
                    role === r.label
                      ? "border-brand-500 ring-2 ring-brand-500/30 dark:border-brand-500"
                      : "hover:border-brand-300 dark:hover:border-brand-700"
                  }`}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                    {r.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{r.desc}</p>
                </button>
              ))}
            </div>

            {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                disabled={!role}
                onClick={() => setStep("instructions")}
                className="rounded-xl bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Instructions ── */}
        {step === "instructions" && (
          <motion.div key="instructions" {...fade} className="mx-auto max-w-2xl">
            <div className="dash-card overflow-hidden">
              <div className="border-b border-slate-200/80 bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-5 dark:border-slate-800">
                <h2 className="text-lg font-bold text-white">Before We Begin</h2>
                <p className="mt-1 text-sm text-brand-100">
                  Here is what to expect in your {role} mock interview
                </p>
              </div>
              <div className="space-y-4 p-6">
                {INSTRUCTIONS.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg dark:bg-slate-800">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-500">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setStep("role")}
                className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep("mic")}
                className="rounded-xl bg-brand-600 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700"
              >
                I am Ready →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Microphone Check ── */}
        {step === "mic" && (
          <motion.div key="mic" {...fade} className="mx-auto max-w-lg">
            <div className="dash-card p-8 text-center">
              <div
                className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full transition-all ${
                  micStatus === "passed"
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10"
                    : micStatus === "testing"
                      ? "bg-red-100 text-red-500 animate-pulse dark:bg-red-500/10"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10">
                  <path d="M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z" />
                  <path d="M19 10v1a7 7 0 01-14 0v-1M12 18v4M8 22h8" strokeLinecap="round" />
                </svg>
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                Microphone Check
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Say <strong>&quot;I am ready for my interview&quot;</strong> to test your mic.
              </p>

              {micTranscript && (
                <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  &quot;{micTranscript}&quot;
                </div>
              )}

              {micStatus === "passed" && (
                <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ Microphone working perfectly!
                </p>
              )}
              {micStatus === "failed" && (
                <p className="mt-3 text-sm text-amber-600">
                  Could not detect speech. You can still type answers during the interview.
                </p>
              )}

              <button
                type="button"
                onClick={micStatus === "testing" ? stopRecording : handleMicTest}
                className={`mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
                  micStatus === "testing"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-brand-600 text-white hover:bg-brand-700"
                }`}
              >
                {micStatus === "testing" ? "Stop Test" : "Test Microphone"}
              </button>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setStep("instructions")}
                className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep("camera")}
                className="rounded-xl bg-brand-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Continue →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 4: Camera Check ── */}
        {step === "camera" && (
          <motion.div key="camera" {...fade} className="mx-auto max-w-lg">
            <div className="dash-card p-8 text-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Camera Check</h2>
              <p className="mt-2 text-sm text-slate-500">
                Make sure your face is clearly visible and the lighting is good.
              </p>

              <div className="relative mx-auto mt-6 w-fit overflow-hidden rounded-2xl ring-4 ring-brand-500/20">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  width={400}
                  height={300}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  onUserMedia={() => setCameraReady(true)}
                  onUserMediaError={() => setCameraReady(false)}
                  className="rounded-2xl"
                />
                {cameraReady && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-medium text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    Camera Active
                  </div>
                )}
              </div>

              {!cameraReady && (
                <p className="mt-3 text-sm text-amber-600">
                  Allow camera access in your browser, or continue without it.
                </p>
              )}
            </div>

            {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setStep("mic")}
                className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={loadQuestions}
                className="rounded-xl bg-brand-600 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700 disabled:opacity-50"
              >
                {loading ? "Preparing Interview…" : "Start Interview →"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 5: Interview Session ── */}
        {step === "session" && (
          <motion.div key="session" {...fade}>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {role} · Question {questionIndex + 1} of {TOTAL_QUESTIONS}
                </p>
                <div className="mt-2 h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
              <InterviewTimer sessionSeconds={sessionSeconds} questionSeconds={questionSeconds} />
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* Main panel */}
              <div className="space-y-4 lg:col-span-8">
                <div className="dash-card overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/40">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Interviewer Question
                    </h3>
                    <button
                      type="button"
                      onClick={() => speakText(currentQuestion)}
                      className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                        <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.5 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.5l3.883-3.217a1 1 0 011.617.793zM14.657 5.343a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414z" />
                      </svg>
                      Hear Question
                    </button>
                  </div>
                  <p className="px-5 py-4 text-base font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                    {currentQuestion}
                  </p>
                </div>

                <div className="dash-card p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Your Answer
                    </label>
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : handleSessionRecord}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        isRecording
                          ? "bg-red-500 text-white animate-pulse"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {isRecording ? "● Recording…" : "🎤 Speak Answer"}
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={answer}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                      setConfidenceScore(computeConfidenceScore(e.target.value));
                    }}
                    placeholder="Type your answer here or use the microphone…"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                  />

                  {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <ScoreRing score={confidenceScore} label="Confidence" size={80} max={100} />
                    <ScoreRing
                      score={communicationScore || 0}
                      label="Communication"
                      size={80}
                      max={10}
                    />
                    <button
                      type="button"
                      disabled={loading || !answer.trim()}
                      onClick={submitAnswer}
                      className="ml-auto rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {loading
                        ? "Evaluating…"
                        : questionIndex >= TOTAL_QUESTIONS - 1
                          ? "Finish Interview"
                          : "Submit & Next →"}
                    </button>
                  </div>
                </div>

                {currentFeedback && (
                  <div className="dash-card border-l-4 border-l-brand-500 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      AI Feedback
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {currentFeedback}
                    </p>
                  </div>
                )}
              </div>

              {/* Side panel */}
              <div className="space-y-4 lg:col-span-4">
                <div className="dash-card overflow-hidden">
                  <div className="border-b border-slate-200/80 px-4 py-3 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Live Camera
                    </h3>
                  </div>
                  <Webcam
                    audio={false}
                    width="100%"
                    height={180}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "user" }}
                    className="w-full object-cover"
                  />
                </div>

                <div className="dash-card max-h-80 overflow-hidden">
                  <div className="border-b border-slate-200/80 px-4 py-3 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Transcript
                    </h3>
                    <p className="text-xs text-slate-400">{transcript.length} answered</p>
                  </div>
                  <div className="max-h-60 space-y-3 overflow-y-auto p-4">
                    {transcript.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-4">
                        Your Q&A will appear here as you answer
                      </p>
                    ) : (
                      transcript.map((entry, i) => (
                        <div key={i} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                          <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                            Q{i + 1}: {entry.question}
                          </p>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            {entry.answer}
                          </p>
                          <div className="mt-1.5 flex gap-2 text-[10px] font-medium text-slate-400">
                            <span>Score: {entry.score}/10</span>
                            <span>·</span>
                            <span>Comm: {entry.communicationScore}/10</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 6: Final Report ── */}
        {step === "report" && (
          <motion.div key="report" {...fade}>
            {reportLoading ? (
              <div className="dash-card flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
                <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                  Generating your personalised report…
                </p>
              </div>
            ) : finalReport ? (
              <div className="space-y-6">
                <div className="dash-card overflow-hidden">
                  <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 px-6 py-8 text-center text-white sm:px-10">
                    <p className="text-sm font-medium text-brand-100">Interview Complete</p>
                    <h2 className="mt-1 text-2xl font-bold">{role}</h2>
                    <span className="mt-3 inline-flex rounded-full bg-white/20 px-4 py-1 text-sm font-semibold backdrop-blur">
                      {finalReport.grade}
                    </span>
                    {finalReport.summary && (
                      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-brand-100">
                        {finalReport.summary}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-6 sm:gap-8">
                    <div className="flex justify-center">
                      <ScoreRing
                        score={finalReport.averageScore}
                        label="Average Score"
                        size={120}
                        max={10}
                      />
                    </div>
                    <div className="flex justify-center">
                      <ScoreRing
                        score={finalReport.averageCommunication}
                        label="Communication"
                        size={120}
                        max={10}
                      />
                    </div>
                    <div className="flex justify-center">
                      <ScoreRing
                        score={finalReport.averageConfidence}
                        label="Confidence"
                        size={120}
                        max={10}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div className="dash-card overflow-hidden">
                    <div className="border-b border-emerald-200/80 bg-emerald-50/80 px-5 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                      <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        Strengths
                      </h3>
                    </div>
                    <ul className="space-y-2 p-5">
                      {(finalReport.strengths || []).map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <span className="text-emerald-500">✓</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="dash-card overflow-hidden">
                    <div className="border-b border-amber-200/80 bg-amber-50/80 px-5 py-3 dark:border-amber-500/20 dark:bg-amber-500/5">
                      <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                        Weaknesses
                      </h3>
                    </div>
                    <ul className="space-y-2 p-5">
                      {(finalReport.weaknesses || []).map((w, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <span className="text-amber-500">△</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="dash-card overflow-hidden">
                    <div className="border-b border-brand-200/80 bg-brand-50/80 px-5 py-3 dark:border-brand-500/20 dark:bg-brand-500/5">
                      <h3 className="text-sm font-semibold text-brand-700 dark:text-brand-400">
                        Recommendations
                      </h3>
                    </div>
                    <ul className="space-y-2 p-5">
                      {(finalReport.recommendations || []).map((r, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <span className="text-brand-500">→</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {transcript.length > 0 && (
                  <div className="dash-card overflow-hidden">
                    <div className="border-b border-slate-200/80 px-5 py-3 dark:border-slate-800">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Full Transcript
                      </h3>
                    </div>
                    <div className="max-h-96 space-y-4 overflow-y-auto p-5">
                      {transcript.map((entry, i) => (
                        <div key={i} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            Q{i + 1}: {entry.question}
                          </p>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {entry.answer}
                          </p>
                          <div className="mt-2 flex gap-3 text-xs text-slate-400">
                            <span>Score: {entry.score}/10</span>
                            <span>Communication: {entry.communicationScore}/10</span>
                            <span>Confidence: {entry.confidenceScore}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-3 pb-4">
                  <button
                    type="button"
                    onClick={resetInterview}
                    className="rounded-xl bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700"
                  >
                    Start New Interview
                  </button>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
