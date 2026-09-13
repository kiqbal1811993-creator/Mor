import { API_URL } from '../config';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, ChevronLeft, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



const HelplineChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

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

  const deviceId = useMemo(() => {
    let id = localStorage.getItem('deviceId');
    if (!id) {
      id = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', id);
    }
    return id;
  }, []);

  const sessionId = `${deviceId}_helpline`;

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/chat/messages/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchAndMarkRead = async () => {
      await fetchMessages();
      fetch(`${API_URL}/chat/sessions/${sessionId}/read-customer`, { method: 'PUT' });
    };

    fetchAndMarkRead();
    const interval = setInterval(fetchAndMarkRead, 5000); // reduced from 3s to 5s
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Optimistic update
    const tempMsg = {
      _id: Date.now(),
      sender: 'customer',
      text: newMessage,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');

    try {
      const res = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          sender: 'customer',
          text: tempMsg.text
        })
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="glass-panel helpline-container" style={{ height: '100vh', maxHeight: '100vh', width: '100%', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 0, boxSizing: 'border-box', position: 'relative' }}>
      <div className="helpline-content" style={{ width: '100%', height: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'white', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '4px', flexShrink: 0 }} className="hover-text-primary">
            <ChevronLeft size={22} />
          </button>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)', flexShrink: 0 }}></div>
          <h2 style={{ margin: 0, fontSize: '20px' }}>MOR Helpline</h2>
        </div>

        {/* Messages Area */}
        <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {isLoading && messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>
                  Welcome to MOR Helpline! How can we assist you today?
                </div>
              )}
          
          {messages.map(msg => (
            <div key={msg._id} style={{ alignSelf: msg.sender === 'customer' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div className="message-bubble" style={{ 
                background: msg.sender === 'customer' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                color: msg.sender === 'customer' ? 'black' : 'white',
                padding: '12px 16px',
                borderRadius: '16px',
                borderBottomRightRadius: msg.sender === 'customer' ? '4px' : '16px',
                borderBottomLeftRadius: msg.sender === 'admin' ? '4px' : '16px',
                border: msg.sender === 'admin' ? '1px solid rgba(255,255,255,0.2)' : 'none'
              }}>
                <div>{msg.text}</div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', textAlign: msg.sender === 'customer' ? 'right' : 'left', display: 'flex', alignItems: 'center', justifyContent: msg.sender === 'customer' ? 'flex-end' : 'flex-start', gap: '6px' }}>
                {formatMessageTime(msg.createdAt)}
                {msg.sender === 'customer' && (
                  <span style={{ fontStyle: 'italic', opacity: 0.8 }}>{msg.read ? "Read" : "Unread"}</span>
                )}
              </div>
            </div>
          ))}
          </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{ 
                flex: 1, 
                padding: '15px 20px', 
                borderRadius: '30px', 
                border: '1px solid rgba(255,255,255,0.2)', 
                background: 'rgba(255,255,255,0.05)', 
                color: 'white',
                outline: 'none',
                fontSize: '15px'
              }} 
            />
            <button type="submit" className="btn-primary" style={{ borderRadius: '50%', width: '52px', height: '52px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={20} color="black" style={{ marginLeft: '-2px' }} />
            </button>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
};

export default HelplineChat;
