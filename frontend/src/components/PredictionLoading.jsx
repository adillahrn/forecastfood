import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const steps = [
  { percent: 0, text: "Initializing AI engine..." },
  { percent: 15, text: "Reading your data..." },
  { percent: 30, text: "Analyzing historical patterns..." },
  { percent: 45, text: "Processing seasonal trends..." },
  { percent: 60, text: "Training prediction model..." },
  { percent: 72, text: "Calculating demand forecast..." },
  { percent: 85, text: "Optimizing stock recommendations..." },
  { percent: 95, text: "Almost done..." },
  { percent: 100, text: "Prediction completed!" },
];

export default function PredictionLoading({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentStep >= steps.length - 1) {
      setDone(true);
      setTimeout(() => {
        if (onComplete) onComplete();
        else navigate("/predictions");
      }, 1200);
      return;
    }

    const timeout = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, currentStep === 0 ? 500 : Math.random() * 800 + 600);

    return () => clearTimeout(timeout);
  }, [currentStep]);

  useEffect(() => {
    const target = steps[currentStep].percent;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= target) {
          clearInterval(interval);
          return target;
        }
        return prev + 1;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [currentStep]);

  return (
    <div className="fixed inset-0 z-50 bg-primary-900 flex items-center justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-700 rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-600 rounded-full opacity-10 blur-3xl" />
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Card */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full px-8">
        {/* Logo with pulse animation */}
        <div className={`relative mb-8 ${done ? "" : "animate-pulse"}`}>
          <div className="w-20 h-20 bg-primary-700 rounded-2xl flex items-center justify-center shadow-2xl">
            <img src={logo} alt="ForecastFood" className="w-12 h-12 rounded-xl" />
          </div>
          {/* Ripple rings */}
          {!done && (
            <>
              <div className="absolute inset-0 rounded-2xl border-2 border-primary-500 opacity-40 animate-ping" />
              <div className="absolute -inset-2 rounded-2xl border border-primary-600 opacity-20 animate-ping" style={{ animationDelay: "0.3s" }} />
            </>
          )}
          {/* Done checkmark */}
          {done && (
            <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-white text-2xl font-bold mb-2">
          {done ? "Prediction Ready!" : "AI is Working..."}
        </h2>
        <p className="text-primary-300 text-sm mb-10 leading-relaxed">
          {done
            ? "Your 7-day demand forecast has been generated successfully."
            : "Our deep learning model is analyzing your data to generate accurate demand forecasts."}
        </p>

        {/* Progress Bar */}
        <div className="w-full mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-primary-300 text-xs font-medium">
              {steps[currentStep].text}
            </span>
            <span className="text-primary-300 text-xs font-bold">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-primary-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: done
                  ? "linear-gradient(to right, #4ade80, #22c55e)"
                  : "linear-gradient(to right, #166534, #4ade80)",
              }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i < currentStep
                  ? "w-2 h-2 bg-primary-400"
                  : i === currentStep
                  ? "w-4 h-2 bg-green-400"
                  : "w-2 h-2 bg-primary-700"
              }`}
            />
          ))}
        </div>

        {/* Stats being calculated */}
        {!done && (
          <div className="grid grid-cols-3 gap-4 w-full">
            {[
              { label: "Data Points", value: progress < 30 ? "—" : `${Math.floor(progress * 12)}` },
              { label: "Items", value: progress < 50 ? "—" : `${Math.floor(progress * 0.08)}` },
              { label: "Accuracy", value: progress < 80 ? "—" : `${Math.floor(85 + progress * 0.13)}%` },
            ].map((s, i) => (
              <div key={i} className="bg-primary-800 rounded-xl p-3 text-center">
                <p className="text-primary-300 text-xs mb-1">{s.label}</p>
                <p className={`text-white text-sm font-bold ${s.value === "—" ? "opacity-30" : ""}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Done state */}
        {done && (
          <div className="w-full bg-primary-800 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white text-sm">✓</span>
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-semibold">98% Confidence Score</p>
              <p className="text-primary-300 text-xs">Redirecting to results...</p>
            </div>
          </div>
        )}
      </div>

      {/* CSS for float animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
