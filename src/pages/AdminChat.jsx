import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Send, Search, Check, CheckCheck, Loader } from 'lucide-react';

const AdminChat = ({ adminToken, isSubAdmin, permissions = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const filter = new URLSearchParams(location.search).get('filter');
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMobileChatWindow, setShowMobileChatWindow] = useState(false);
  const messagesEndRef = React.useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredSessions = sessions.filter(session => {
    const isHelpline = session.sessionId ? session.sessionId.endsWith('_helpline') : false;
    return filter === 'helpline' ? isHelpline : !isHelpline;
  });

  useEffect(() => {
    if (filteredSessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(filteredSessions[0].sessionId);
    }
  }, [sessions, filter]);

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
    
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    if (isToday) return timeStr;
    if (isYesterday) return `Yesterday ${timeStr}`;
    
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  useEffect(() => {
    if (!adminToken) {
      navigate(isSubAdmin ? '/admin' : '/super-admin');
      return;
    }
    // Sub-admin: verify session every 5s
    if (isSubAdmin) {
      const checkSession = async () => {
        try {
          const r = await fetch('http://localhost:5000/api/sub-admin/verify', {
            headers: { Authorization: 'Bearer ' + adminToken }
          });
          if (!r.ok) {
            sessionStorage.removeItem('subAdminToken');
            sessionStorage.removeItem('subAdminPermissions');
            setShowLogoutModal(true);
            setTimeout(() => navigate('/admin'), 3000);
            return;
          }
        } catch {}
      };
      checkSession();
      const interval = setInterval(checkSession, 60000); // reduced from 5s to 60s
      return () => clearInterval(interval);
    }
  }, [adminToken, navigate, isSubAdmin]);

  const fetchSessions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/chat/sessions', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchMessages = async (sessionId, silent = false) => {
    if (!silent) setIsChatLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/chat/messages/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (!silent) setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchSessions();
      const interval = setInterval(fetchSessions, 10000); // reduced from 5s to 10s
      return () => clearInterval(interval);
    }
  }, [adminToken]);

  useEffect(() => {
    if (selectedSessionId) {
      setMessages([]); // clear old messages when switching session
      const fetchAndMarkRead = async (silent) => {
        await fetchMessages(selectedSessionId, silent);
        // Mark as read
        fetch(`http://localhost:5000/api/chat/sessions/${selectedSessionId}/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${adminToken}` }
        }).then(() => fetchSessions());
      };

      fetchAndMarkRead(false);
      const interval = setInterval(() => fetchAndMarkRead(true), 5000); // reduced from 3s to 5s
      return () => clearInterval(interval);
    }
  }, [selectedSessionId, adminToken]);

  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedSessionId) return;

    // Optimistic update
    const tempMsg = {
      _id: Date.now(),
      sender: 'admin',
      text: replyText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);
    setReplyText('');

    try {
      const res = await fetch('http://localhost:5000/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          sender: 'admin',
          text: tempMsg.text
        })
      });
      if (res.ok) {
        fetchMessages(selectedSessionId);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!adminToken) return null;
  if (isSubAdmin && filter === 'helpline' && !permissions.includes('helpline')) {
    return <div className="glass-panel" style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><h2>You do not have permission to view help chat.</h2></div>;
  }
  if (isSubAdmin && filter !== 'helpline' && !permissions.includes('chat')) {
    return <div className="glass-panel" style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><h2>You do not have permission to view chat.</h2></div>;
  }

  return (
    <div className="glass-panel" style={{ width: '100%', minHeight: '100vh', borderRadius: '0', padding: isMobile ? '15px' : '40px', boxSizing: 'border-box', position: 'relative' }}>

      {/* Custom Logout Modal */}
      {showLogoutModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(30,30,50,0.98), rgba(20,20,40,0.98))', border: '1px solid rgba(255,71,87,0.4)', borderRadius: '20px', padding: '50px 60px', textAlign: 'center', maxWidth: '420px', boxShadow: '0 25px 80px rgba(255,71,87,0.25)' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,71,87,0.15)', border: '2px solid rgba(255,71,87,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px' }}>🚫</div>
            <h2 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: '700', color: '#ff4757' }}>Access Revoked</h2>
            <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: '1.6' }}>Your admin account has been removed by the Super Admin.</p>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Redirecting to login page...</p>
            <div style={{ marginTop: '24px', height: '4px', borderRadius: '2px', background: 'rgba(255,71,87,0.2)', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#ff4757', borderRadius: '2px', animation: 'slideProgress 3s linear forwards' }} />
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes slideProgress { from { width: 0% } to { width: 100% } }`}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            flexShrink: 0,
            transition: 'background 0.2s, transform 0.2s',
          }}
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="section-title" style={{ margin: 0 }}>{filter === 'helpline' ? 'Helpline Chat' : 'Customer Chat'}</h1>
      </div>

      <div style={{ display: 'flex', height: isMobile ? 'calc(100vh - 80px)' : 'calc(100vh - 150px)', gap: '20px' }}>
        {/* Chat List */}
        {(!isMobile || !showMobileChatWindow) && (
        <div className="glass" style={{ width: isMobile ? '100%' : '300px', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
          <h3 style={{ margin: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Active Chats</h3>
          
          {filteredSessions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>No active chats</p>
          ) : (
            filteredSessions.map(session => (
              <div 
                key={session.sessionId}
                onClick={() => {
                  setSelectedSessionId(session.sessionId);
                  if (isMobile) setShowMobileChatWindow(true);
                }}
                style={{ 
                  position: 'relative',
                  padding: '15px', 
                  background: selectedSessionId === session.sessionId ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {session.unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--primary)', color: 'black', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                    {session.unreadCount}
                  </span>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {session.sessionId.substring(0, 15)}...
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {formatMessageTime(session.timestamp)}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {session.lastMessage}
                </p>
              </div>
            ))
          )}
        </div>
        )}

        {/* Chat Window */}
        {(!isMobile || showMobileChatWindow) && (
        <div className="glass" style={{ flex: 1, borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
          {selectedSessionId ? (
            <>
              <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isMobile && (
                  <button onClick={() => setShowMobileChatWindow(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <ChevronLeft size={20} />
                  </button>
                )}
                <h3 style={{ margin: 0 }}>{selectedSessionId}</h3>
              </div>
              
              <div className="chat-scroll" style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {isChatLoading && messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : (
                  <>
                  {messages.map(msg => (
                  <div key={msg._id} style={{ alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    <div style={{ 
                      background: msg.sender === 'admin' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      color: msg.sender === 'admin' ? 'black' : 'white',
                      padding: '12px 18px', 
                      borderRadius: '18px', 
                      borderBottomRightRadius: msg.sender === 'admin' ? '4px' : '18px',
                      borderBottomLeftRadius: msg.sender === 'customer' ? '4px' : '18px',
                      border: msg.sender === 'customer' ? '1px solid rgba(255,255,255,0.2)' : 'none'
                    }}>
                      {msg.product && (
                        <div style={{ background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '8px', marginBottom: msg.text ? '10px' : '0', display: 'flex', gap: '10px', alignItems: 'center' }}>
                          {msg.product.image && <img src={msg.product.image} alt="product" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', lineHeight: 1.2 }}>{msg.product.title}</div>
                            <div style={{ fontSize: '11px', opacity: 0.8 }}>Rs. {msg.product.price}</div>
                          </div>
                        </div>
                      )}
                      {msg.text && <div>{msg.text}</div>}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', textAlign: msg.sender === 'admin' ? 'right' : 'left', display: 'flex', alignItems: 'center', justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start', gap: '4px' }}>
                      {formatMessageTime(msg.createdAt)}
                      {msg.sender === 'admin' && (
                        <span style={{ fontStyle: 'italic', opacity: 0.8 }}>{msg.read ? "Read" : "Unread"}</span>
                      )}
                    </div>
                  </div>
                ))}
                </>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ flex: 1, padding: '12px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                  />
                  <button type="submit" className="btn-primary" style={{ borderRadius: '50%', width: '45px', height: '45px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Send size={18} color="black" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <Search size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
              <p>Select a chat from the left sidebar to start messaging.</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
