import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import Navbar from "../components/navbar/Navbar";
import AuthSidePanel from "../layouts/AuthSidePanel";

const cardStyle = {
  width: "100%",
  maxWidth: "440px",
  borderRadius: "20px",
  border: "1px solid rgba(245,130,12,0.15)",
  background: "#0A0A0A",
  padding: "28px 32px",
  margin: "0 auto",
};

const fieldWrapperStyle = { marginBottom: "14px" };
const labelStyle = { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 500, color: "#fff" };
const inputWrapperStyle = { position: "relative" };
const iconStyle = { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6B7280", pointerEvents: "none" };
const eyeButtonStyle = { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#6B7280", background: "none", border: "none", cursor: "pointer" };
const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: "10px",
  border: "1px solid rgba(245,130,12,0.15)",
  background: "#111111",
  color: "#fff",
  padding: "10px 40px",
  fontSize: "14px",
  outline: "none",
};

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const el = document.getElementById("auth-scroll-area");
    if (el) el.scrollTop = 0;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validate form
    if (!fullName || !email || !password || !confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (!agreed) {
      setError("Please agree to Terms of Service and Privacy Policy");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // Call backend signup endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }

      // Store token and user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Account created successfully! Redirecting...");

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      setError("Network error. Make sure backend is running on port 3000");
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    alert("Google Sign-up coming soon! For now, please use email & password.");
    // TODO: Implement Google OAuth when ready
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: "black", color: "white" }}>
      <style>{`
  #auth-scroll-area::-webkit-scrollbar { display: none; }
  #auth-scroll-area { scrollbar-width: none; -ms-overflow-style: none; }
`}</style>
      <Navbar />

      <div style={{ display: "flex", height: "calc(100vh - 84px)", marginTop: "84px" }}>

        <div
          id="auth-scroll-area"
          style={{ flex: 1, overflowY: "auto", padding: "32px 24px" }}
        >
          <div style={{ minHeight: "100%", display: "flex", alignItems: "center" }}>
            <div style={cardStyle}>

              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: 0 }}>
                Create Your Account
              </h1>
              <p style={{ marginTop: "6px", marginBottom: "18px", color: "#9CA3AF", fontSize: "13px" }}>
                Start your AI-powered career journey today
              </p>

              {error && (
                <div style={{ marginBottom: "14px", padding: "10px", borderRadius: "8px", background: "#7F1D1D", color: "#FCA5A5", fontSize: "12px" }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{ marginBottom: "14px", padding: "10px", borderRadius: "8px", background: "#065F46", color: "#86EFAC", fontSize: "12px" }}>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                <div style={fieldWrapperStyle}>
                  <label style={labelStyle}>Full Name</label>
                  <div style={inputWrapperStyle}>
                    <FiUser style={iconStyle} size={16} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>

                <div style={fieldWrapperStyle}>
                  <label style={labelStyle}>Email Address</label>
                  <div style={inputWrapperStyle}>
                    <FiMail style={iconStyle} size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>

                <div style={fieldWrapperStyle}>
                  <label style={labelStyle}>Password</label>
                  <div style={inputWrapperStyle}>
                    <FiLock style={iconStyle} size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      style={inputStyle}
                      required
                    />
                    <button type="button" style={eyeButtonStyle} onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={fieldWrapperStyle}>
                  <label style={labelStyle}>Confirm Password</label>
                  <div style={inputWrapperStyle}>
                    <FiLock style={iconStyle} size={16} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      style={inputStyle}
                      required
                    />
                    <button type="button" style={eyeButtonStyle} onClick={() => setShowConfirmPassword((v) => !v)}>
                      {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", color: "#9CA3AF", marginBottom: "14px" }}>
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    style={{ marginTop: "2px", width: "14px", height: "14px", accentColor: "#F5820C" }}
                  />
                  <span>
                    I agree to the{" "}
                    <a href="#" style={{ color: "#F5820C" }}>Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" style={{ color: "#F5820C" }}>Privacy Policy</a>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    background: loading ? "#999" : "#F5820C",
                    color: "#fff",
                    padding: "10px",
                    fontSize: "14px",
                    fontWeight: 600,
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    marginBottom: "14px",
                  }}
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ height: "1px", flex: 1, background: "rgba(255,255,255,0.1)" }} />
                  <span style={{ fontSize: "11px", color: "#6B7280" }}>OR</span>
                  <div style={{ height: "1px", flex: 1, background: "rgba(255,255,255,0.1)" }} />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    borderRadius: "10px",
                    border: "1px solid rgba(245,130,12,0.15)",
                    background: "#111111",
                    color: "#fff",
                    padding: "10px",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    marginBottom: "16px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
                    <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
                    <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
                  </svg>
                  Sign up with Google
                </button>

                <p style={{ textAlign: "center", fontSize: "13px", color: "#9CA3AF", margin: 0 }}>
                  Already have an account?{" "}
                  <Link to="/login" style={{ fontWeight: 600, color: "#F5820C" }}>
                    Log In
                  </Link>
                </p>

              </form>

            </div>
          </div>
        </div>

        <AuthSidePanel />

      </div>

    </div>
  );
}
