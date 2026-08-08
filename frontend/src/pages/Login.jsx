import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import AuthSidePanel from "../layouts/AuthSidePanel";

const cardStyle = {
  width: "100%",
  maxWidth: "440px",
  borderRadius: "20px",
  border: "1px solid rgba(245,130,12,0.15)",
  background: "#0A0A0A",
  padding: "36px 32px",
  margin: "0 auto",
};

const fieldWrapperStyle = { marginBottom: "18px" };
const labelStyle = { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 500, color: "#fff" };
const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: "10px",
  border: "1px solid rgba(245,130,12,0.15)",
  background: "#111111",
  color: "#fff",
  padding: "10px 14px",
  fontSize: "14px",
  outline: "none",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const el = document.getElementById("auth-scroll-area");
    if (el) el.scrollTop = 0;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call your backend login endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Store token and user in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Network error. Make sure backend is running on port 3000");
      setLoading(false);
    }
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

              <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#fff", margin: 0 }}>
                Welcome Back!
              </h1>
              <p style={{ marginTop: "8px", marginBottom: "22px", color: "#9CA3AF", fontSize: "14px" }}>
                Sign in to continue your placement journey
              </p>

              {error && (
                <div style={{ marginBottom: "18px", padding: "10px", borderRadius: "8px", background: "#7F1D1D", color: "#FCA5A5", fontSize: "13px" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                <div style={fieldWrapperStyle}>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    style={inputStyle}
                    required
                  />
                </div>

                <div style={fieldWrapperStyle}>
                  <label style={labelStyle}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={inputStyle}
                    required
                  />
                  <div style={{ marginTop: "6px", textAlign: "right" }}>
                    <a href="#" style={{ fontSize: "13px", fontWeight: 500, color: "#F5820C" }}>
                      Forgot Password?
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    background: loading ? "#999" : "#F5820C",
                    color: "#fff",
                    padding: "11px",
                    fontSize: "14px",
                    fontWeight: 600,
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    marginBottom: "18px",
                  }}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>

                <p style={{ textAlign: "center", fontSize: "13px", color: "#9CA3AF", margin: 0 }}>
                  Don't have an account?{" "}
                  <Link to="/signup" style={{ fontWeight: 600, color: "#F5820C" }}>
                    Sign Up
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
