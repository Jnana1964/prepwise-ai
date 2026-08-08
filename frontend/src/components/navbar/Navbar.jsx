import { Link } from "react-router-dom";
import logoImg from "../../assets/logo.png";

// Fixed top bar used only on the public/auth pages (Homepage, Login, Signup).
// Login.jsx / Signup.jsx import this directly - it did not exist yet in the
// project, so it's built here to match their inline styling (black bg,
// #F5820C accent) rather than the in-app Topbar/Sidebar, which are separate
// and only render inside DashboardLayout.
export default function Navbar() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "84px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        background: "#0A0A0A",
        borderBottom: "1px solid rgba(245,130,12,0.15)",
        zIndex: 50,
        boxSizing: "border-box",
      }}
    >
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <img src={logoImg} alt="PrepWise AI" width={34} height={34} style={{ objectFit: "contain" }} />
        <span style={{ color: "#fff", fontWeight: 700, fontSize: "17px" }}>PrepWise AI</span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Link to="/login" style={{ color: "#9CA3AF", fontSize: "14px", textDecoration: "none" }}>
          Sign In
        </Link>
        <Link
          to="/signup"
          style={{
            background: "#F5820C",
            color: "#fff",
            padding: "9px 18px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
