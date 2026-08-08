import logoImg from "../assets/logo.png";

// Decorative right-hand panel on the auth pages. Login.jsx / Signup.jsx
// import this directly - it did not exist yet, built here to match their
// styling (black bg, #F5820C accent) rather than reusing in-app components.
const POINTS = [
  "Deterministic ATS, recruiter and quality scoring",
  "Job matching against your real detected skills",
  "Six-category Skill Builder with continuous progress",
  "Company-specific Mock Assessment and AI Interview",
];

export default function AuthSidePanel() {
  return (
    <div
      style={{
        width: "420px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "44px",
        padding: "40px",
        borderLeft: "1px solid rgba(245,130,12,0.15)",
        background: "#050505",
      }}
    >
      <div style={{ position: "relative", width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,130,12,0.25) 0%, rgba(245,130,12,0) 70%)"
          }}
        />
        <img
          src={logoImg}
          alt="PrepWise AI"
          width={180}
          height={180}
          style={{ objectFit: "contain", filter: "drop-shadow(0 0 18px rgba(245,130,12,0.45))", position: "relative" }}
        />
      </div>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: 700, margin: 0 }}>
          Your AI Mentor for Placement Prep
        </h2>
        <p style={{ color: "#9CA3AF", fontSize: "13px", marginTop: "8px", lineHeight: 1.6 }}>
          One connected platform from resume to offer.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
        {POINTS.map((p) => (
          <div key={p} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <span style={{ color: "#F5820C", fontSize: "14px", lineHeight: "20px" }}>✓</span>
            <span style={{ color: "#D1D5DB", fontSize: "13px", lineHeight: "20px" }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
