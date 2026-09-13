import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Package, ShoppingBag, MessageCircle, HelpCircle, LogOut, Trash2, Copy, Check, Menu, X } from "lucide-react";

const PERMISSIONS = [
  { key: "products", label: "Products",  icon: Package,        desc: "Add, edit & delete products" },
  { key: "orders",   label: "Orders",    icon: ShoppingBag,    desc: "View & manage orders" },
  { key: "chat",     label: "Chat",      icon: MessageCircle,  desc: "Access customer chats" },
  { key: "helpline", label: "Help Chat", icon: HelpCircle,     desc: "Access helpline chats" },
];

const generateEmail    = () => `mor.admin.${Math.random().toString(36).substr(2,7)}@morcare.pk`;
const generatePassword = () => {
  const c = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  return Array.from({length:12}, () => c[Math.floor(Math.random()*c.length)]).join("");
};

const AddAdmin = ({ adminToken, setAdminToken }) => {
  const navigate        = useNavigate();
  const [perms, setPerms]       = useState([]);
  const [admins, setAdmins]     = useState([]);
  const [busy, setBusy]         = useState(false);
  const [created, setCreated]   = useState(null);
  const [copied, setCopied]     = useState("");
  const [error, setError]       = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!adminToken) { navigate("/super-admin"); return; }
    fetchAdmins();
  }, [adminToken]);

  const fetchAdmins = async () => {
    try {
      const r = await fetch("http://localhost:5000/api/super-admin/subadmins", {
        headers: { Authorization: "Bearer " + adminToken }
      });
      if (r.ok) setAdmins(await r.json());
    } catch {}
  };

  const toggle = (k) => setPerms(p => p.includes(k) ? p.filter(x=>x!==k) : [...p,k]);

  const handleCreate = async () => {
    if (!perms.length) { setError("Please select at least one permission."); return; }
    setError(""); setBusy(true);
    const email = generateEmail(), password = generatePassword();
    const r = await fetch("http://localhost:5000/api/super-admin/create-subadmin", {
      method:"POST",
      headers:{ "Content-Type":"application/json", Authorization:"Bearer "+adminToken },
      body: JSON.stringify({ email, password, permissions: perms })
    });
    const d = await r.json();
    if (r.ok) { setCreated({ email, password }); setPerms([]); fetchAdmins(); }
    else setError(d.message || "Failed to create admin.");
    setBusy(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admin?")) return;
    await fetch(`http://localhost:5000/api/super-admin/subadmins/${id}`, {
      method:"DELETE", headers:{ Authorization:"Bearer "+adminToken }
    });
    fetchAdmins();
  };

  const copy = (val, key) => { navigator.clipboard.writeText(val); setCopied(key); setTimeout(()=>setCopied(""), 2000); };

  const SideBtn = ({ label, Icon, onClick, active }) => (
    <button onClick={onClick} style={{ background: active?"var(--primary)":"transparent", color: active?"black":"white", border: active?"none":"1px solid rgba(255,255,255,0.2)", padding:"12px 15px", borderRadius:"8px", cursor:"pointer", display:"flex", alignItems:"center", gap:"10px", fontWeight: active?"bold":"normal", transition:"background 0.2s" }}
      onMouseEnter={e=>{ if(!active) e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}
      onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
      <Icon size={20}/> {label}
    </button>
  );

  return (
    <div className="glass-panel admin-layout" style={{ display:"flex", width:"100%", minHeight:"100vh", borderRadius:"0", padding:0, boxSizing:"border-box" }}>
      {/* Mobile Menu Button */}
      <button 
        className="admin-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{
          display: isMobile ? 'flex' : 'none',
          position: 'fixed',
          top: '18px',
          left: '18px',
          zIndex: 1100,
          background: 'rgba(30, 30, 50, 0.95)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white',
          padding: '10px',
          borderRadius: '8px',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <h2 style={{ margin:"0 0 40px 0", fontSize:"22px", textAlign:"center" }}>Super Admin</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:"15px", flex:1 }}>
          <SideBtn label="Add Admin"  Icon={UserPlus}      onClick={null}                                            active={true}  />
          <SideBtn label="Products"   Icon={Package}       onClick={() => navigate("/super-admin/dashboard")}        active={false} />
          <SideBtn label="Orders"     Icon={ShoppingBag}   onClick={() => navigate("/super-admin/orders")}           active={false} />
          <SideBtn label="Chat"       Icon={MessageCircle} onClick={() => navigate("/super-admin/chat")}             active={false} />
          <SideBtn label="Help Chat"  Icon={HelpCircle}    onClick={() => navigate("/super-admin/chat?filter=helpline")} active={false} />
        </div>
        <button onClick={() => { setAdminToken(null); navigate("/super-admin"); }}
          style={{ background:"rgba(255,71,87,0.1)", color:"#ff4757", border:"1px solid rgba(255,71,87,0.3)", padding:"12px 15px", borderRadius:"8px", cursor:"pointer", display:"flex", alignItems:"center", gap:"10px" }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,71,87,0.2)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,71,87,0.1)"}>
          <LogOut size={20}/> Logout
        </button>
      </div>
      <div className="admin-sidebar-overlay" onClick={() => setMobileMenuOpen(false)}></div>

      {/* Main */}
      <div className="admin-main">
        <h1 className="section-title" style={{ marginBottom:"30px" }}>Add Admin</h1>

        {/* Create Form */}
        <div className="glass" style={{ borderRadius:"16px", padding:"30px", marginBottom:"30px", border:"1px solid rgba(255,255,255,0.1)" }}>
          <h3 style={{ margin:"0 0 20px 0" }}>Select Permissions</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:"14px", marginBottom:"24px" }}>
            {PERMISSIONS.map(({ key, label, icon: Icon, desc }) => {
              const on = perms.includes(key);
              return (
                <div key={key} onClick={() => toggle(key)} style={{ padding:"16px", borderRadius:"12px", cursor:"pointer", border: on?"2px solid var(--primary)":"2px solid rgba(255,255,255,0.1)", background: on?"rgba(49,205,106,0.1)":"rgba(255,255,255,0.03)", transition:"all 0.2s", userSelect:"none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px" }}>
                    <div style={{ width:"22px", height:"22px", borderRadius:"5px", border: on?"none":"2px solid rgba(255,255,255,0.3)", background: on?"var(--primary)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {on && <Check size={14} color="black" strokeWidth={3}/>}
                    </div>
                    <Icon size={18} color={on?"var(--primary)":"rgba(255,255,255,0.7)"}/>
                    <span style={{ fontWeight:"700", color: on?"var(--primary)":"white" }}>{label}</span>
                  </div>
                  <p style={{ margin:0, fontSize:"12px", color:"var(--text-muted)", paddingLeft:"32px" }}>{desc}</p>
                </div>
              );
            })}
          </div>
          {error && <p style={{ color:"#ff4757", marginBottom:"12px" }}>{error}</p>}
          <button onClick={handleCreate} disabled={busy} className="btn-primary" style={{ padding:"13px 30px", fontSize:"15px", opacity:busy?0.7:1 }}>
            {busy ? "Creating..." : "+ Create Admin"}
          </button>
        </div>

        {/* Generated Credentials */}
        {created && (
          <div style={{ marginBottom:"30px", padding:"24px", background:"rgba(49,205,106,0.08)", border:"1px solid rgba(49,205,106,0.4)", borderRadius:"16px" }}>
            <h3 style={{ margin:"0 0 8px 0", color:"var(--primary)" }}>? Admin Created!</h3>
            <p style={{ margin:"0 0 16px", fontSize:"13px", color:"var(--text-muted)" }}>Share these credentials. Login page: <strong style={{ color:"white" }}>/admin</strong></p>
            {[{ label:"Email", val:created.email, key:"email" },{ label:"Password", val:created.password, key:"pass" }].map(({ label, val, key }) => (
              <div key={key} style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px", padding:"12px 16px", background:"rgba(0,0,0,0.3)", borderRadius:"10px" }}>
                <span style={{ color:"var(--text-muted)", minWidth:"75px", fontSize:"13px" }}>{label}:</span>
                <span style={{ flex:1, fontWeight:"600", wordBreak:"break-all" }}>{val}</span>
                <button onClick={() => copy(val, key)} style={{ background:"transparent", border:"none", cursor:"pointer", color: copied===key?"var(--primary)":"rgba(255,255,255,0.4)", display:"flex" }}>
                  {copied===key ? <Check size={18}/> : <Copy size={18}/>}
                </button>
              </div>
            ))}
            <button onClick={() => setCreated(null)} style={{ background:"transparent", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:"12px", marginTop:"4px" }}>Dismiss</button>
          </div>
        )}

        {/* Existing Admins List */}
        <div className="glass" style={{ borderRadius:"16px", border:"1px solid rgba(255,255,255,0.1)", overflow:"hidden" }}>
          <div style={{ padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ margin:0 }}>Existing Admins ({admins.length})</h3>
          </div>
          {admins.length === 0 ? (
            <div style={{ padding:"40px", textAlign:"center", color:"var(--text-muted)" }}>No sub-admins created yet.</div>
          ) : admins.map(sa => (
            <div key={sa._id} style={{ display:"flex", alignItems:"center", padding:"16px 24px", borderBottom:"1px solid rgba(255,255,255,0.05)", gap:"16px", flexWrap:"wrap" }}>
              <div style={{ width:"38px", height:"38px", borderRadius:"50%", background:"rgba(49,205,106,0.15)", border:"1px solid rgba(49,205,106,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <UserPlus size={18} color="var(--primary)"/>
              </div>
              <div style={{ flex:1, minWidth:"0" }}>
                <div style={{ fontWeight:"600", fontSize:"14px", marginBottom:"6px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sa.email}</div>
                <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                  {sa.permissions.map(p => {
                    const perm = PERMISSIONS.find(x=>x.key===p);
                    return <span key={p} style={{ fontSize:"11px", background:"rgba(49,205,106,0.12)", color:"var(--primary)", border:"1px solid rgba(49,205,106,0.3)", borderRadius:"20px", padding:"2px 9px", fontWeight:"600" }}>{perm?perm.label:p}</span>;
                  })}
                  {!sa.permissions.length && <span style={{ fontSize:"11px", color:"var(--text-muted)" }}>No permissions</span>}
                </div>
              </div>
              <span style={{ fontSize:"12px", color:"var(--text-muted)" }}>{new Date(sa.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
              <button onClick={() => handleDelete(sa._id)}
                style={{ background:"rgba(255,71,87,0.15)", color:"#ff4757", border:"none", padding:"8px", borderRadius:"8px", cursor:"pointer", display:"flex", alignItems:"center" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,71,87,0.3)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,71,87,0.15)"}>
                <Trash2 size={16}/>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddAdmin;
