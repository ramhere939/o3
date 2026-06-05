import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Mail, CheckCircle, RefreshCw } from "lucide-react";

export default function OtpVerify() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      refs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits");
      return;
    }
    if (code !== "123456") {
      setError("Invalid OTP. Use 123456 for demo.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setVerified(true);
    await new Promise((r) => setTimeout(r, 1500));
    navigate("/kyc");
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Verified!</h2>
          <p className="text-slate-500 mt-1">Redirecting to KYC setup...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">O3 Procurement</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail className="w-7 h-7 text-indigo-600" />
          </div>

          <h1 className="text-xl font-bold text-slate-900 text-center mb-1">
            Verify your email
          </h1>
          <p className="text-sm text-slate-500 text-center mb-8">
            We sent a 6-digit code to <strong>demo@company.com</strong>
          </p>

          {/* OTP inputs */}
          <div className="flex gap-3 justify-center mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={refs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-all ${
                  error
                    ? "border-rose-400 bg-rose-50"
                    : digit
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 focus:border-indigo-500"
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-rose-500 text-center mb-4">{error}</p>
          )}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6">
            <p className="text-xs text-amber-700 text-center">
              Demo OTP: <strong className="font-mono">123456</strong>
            </p>
          </div>

          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Verify OTP"
            )}
          </button>

          <div className="text-center mt-4">
            {resendTimer > 0 ? (
              <p className="text-sm text-slate-500">
                Resend in <span className="font-medium text-slate-700">{resendTimer}s</span>
              </p>
            ) : (
              <button
                onClick={() => setResendTimer(30)}
                className="text-sm text-indigo-600 font-medium flex items-center gap-1.5 mx-auto hover:text-indigo-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Resend OTP
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
