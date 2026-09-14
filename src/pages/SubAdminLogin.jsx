import { API_URL } from '../config';
﻿import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Shield } from "lucide-react";

const SubAdminLogin = ({ setSubAdminToken, setSubAdminPermissions }) => {
  const navigate  = useNavigate();
  const [email,   setEmail]    = useState("");
  const [pass,    setPass]     = useState("");
  const [error,   setError]    = useState("");
  const [loading, setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/sub-admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (res.ok) {
        setSubAdminToken(data.token);
        setSubAdminPermissions(data.permissions || []);
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("Server error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", boxSizing:"border-box" }}>
      <div className="glass-panel" style={{ width:"100%", maxWidth:"420px", borderRadius:"20px", padding:"50px 40px", display:"flex", flexDirection:"column", gap:"28px", boxSizing:"border-box" }}>
        {/* Logo */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px" }}>
          <div style={{ width:"60px", height:"60px", borderRadius:"16px", background:"rgba(49,205,106,0.15)", border:"1px solid rgba(49,205,106,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Shield size={30} color="var(--primary)"/>
          </div>
          <div style={{ textAlign:"center" }}>
            <h1 style={{ margin:0, fontSize:"26px", fontWeight:"800" }}>Admin Login</h1>
            <p style={{ margin:"6px 0 0", color:"var(--text-muted)", fontSize:"14px" }}>MOR Natural Care — Admin Portal</p>
          </div>
        </div>

        {error && (
          <div style={{ padding:"12px 16px", background:"rgba(255,71,87,0.1)", border:"1px solid rgba(255,71,87,0.3)", borderRadius:"10px", color:"#ff4757", fontSize:"14px", textAlign:"center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          <div>
            <label style={{ display:"block", marginBottom:"8px", fontSize:"13px", color:"var(--text-muted)", fontWeight:"600", letterSpacing:"0.5px", textTransform:"uppercase" }}>Email</label>
            <input
              type="text" required value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="admin@morcare.pk or username"
              style={{ width:"100%", padding:"13px 16px", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.05)", color:"white", outline:"none", fontSize:"15px", boxSizing:"border-box" }}
            />
          </div>
          <div>
            <label style={{ display:"block", marginBottom:"8px", fontSize:"13px", color:"var(--text-muted)", fontWeight:"600", letterSpacing:"0.5px", textTransform:"uppercase" }}>Password</label>
            <input
              type="password" required value={pass} onChange={e=>setPass(e.target.value)}
              placeholder="••••••••••••"
              style={{ width:"100%", padding:"13px 16px", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.05)", color:"white", outline:"none", fontSize:"15px", boxSizing:"border-box" }}
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="btn-primary"
            style={{ justifyContent:"center", padding:"14px", fontSize:"16px", marginTop:"8px", opacity:loading?0.7:1, display:"flex", alignItems:"center", gap:"10px" }}
          >
            <LogIn size={20}/> {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubAdminLogin;
