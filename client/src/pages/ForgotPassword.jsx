import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Request code, 2 = Verify & reset
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  // Step 1: Request Code
  const handleRequestCode = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setPreviewUrl("");

      const response = await api.post("/auth/forgot-password", { email });

      if (response.data.success) {
        setSuccess(response.data.message);
        if (response.data.previewUrl) {
          setPreviewUrl(response.data.previewUrl);
        } else {
          // If no Ethereal link is returned, fall back to displaying code
          setSuccess(`Verification code sent! For testing, use code: ${response.data.code}`);
        }
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to find account with that email");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await api.post("/auth/reset-password", {
        email,
        code,
        newPassword,
      });

      if (response.data.success) {
        setSuccess("Password has been reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Reset failed. Check your verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-20 text-left">
      <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
        <p className="text-xs text-gray-500 mb-6 font-medium">
          {step === 1
            ? "Enter your email to receive a recovery verification code."
            : "Enter the code sent to your email and your new password."}
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200 leading-relaxed">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl bg-green-50 p-4 text-xs font-semibold text-green-700 border border-green-200 leading-normal space-y-2.5">
            <p className="m-0">{success}</p>
            {previewUrl && (
              <div className="pt-2 border-t border-green-200/50 flex flex-col gap-1 text-[10px]">
                <span className="text-gray-500 uppercase tracking-wider font-bold">Local Test Mailbox Link</span>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 inline-block text-center transition tracking-wider uppercase text-[9px]"
                >
                  📬 Click to view Test Email
                </a>
              </div>
            )}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black py-4 font-bold text-white hover:bg-gray-800 transition shadow active:scale-98 disabled:bg-gray-400 text-xs uppercase tracking-wider"
            >
              {loading ? "Requesting..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Verification Code */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Verification Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black font-mono text-center tracking-widest"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black py-4 font-bold text-white hover:bg-gray-800 transition shadow active:scale-98 disabled:bg-gray-400 text-xs uppercase tracking-wider"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setSuccess("");
                setError("");
                setPreviewUrl("");
              }}
              className="w-full text-center text-[10px] text-gray-400 hover:text-black font-bold uppercase tracking-wider hover:underline block pt-2"
            >
              ← Request a new code
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs font-semibold text-gray-500">
          Remember your password?{" "}
          <Link to="/login" className="font-bold text-black hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
