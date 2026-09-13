import { API_URL } from '../config';
import React, { useState } from 'react';
import { X, Send, Maximize2, Minimize2, Check, CheckCheck } from 'lucide-react';

const CustomerChat = ({ isOpen, onClose, product, setChatProduct }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const messagesEndRef = React.useRef(null);
  const isMobile = window.innerWidth <= 768;

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

  const deviceId = React.useMemo(() => {
    let id = localStorage.getItem('deviceId');
    if (!id) {
      id = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', id);
    }
    return id;
  }, []);

  const sessionId = React.useMemo(() => {
    if (!product) return null;
    return `${deviceId}_${product._id || product.id}`;
  }, [deviceId, product]);

  const fetchMessages = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`${API_URL}/chat/messages/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const fetchAndMarkRead = async () => {
        await fetchMessages();
        if (sessionId) {
          fetch(`${API_URL}/chat/sessions/${sessionId}/read-customer`, { method: 'PUT' });
        }
      };

      fetchAndMarkRead();
      const interval = setInterval(fetchAndMarkRead, 15000); // reduced from 5s to 15s
      return () => {
        clearInterval(interval);
        document.body.style.overflow = 'auto';
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, sessionId]);

  const handleSendMessage = async (e, textOverride, productData) => {
    if (e) e.preventDefault();
    const textToSend = textOverride !== undefined ? textOverride : newMessage;
    if (!textToSend.trim() && !productData) return;
    
    // Optimistic update
    const tempMsg = {
      _id: Date.now(),
      sender: 'customer',
      text: textToSend,
      product: productData,
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
          text: textToSend,
          product: productData
        })
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div 
      className="glass-panel"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: isFullScreen ? '100vh' : '80vh',
        zIndex: 9999,
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.4s ease-in-out, height 0.4s ease-in-out',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0px', display: 'flex' }}>
            <X size={24} />
          </button>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
            Chat
          </h3>
        </div>
        <button onClick={() => setIsFullScreen(!isFullScreen)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '5px', display: 'flex' }}>
          {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* Messages Area */}
      <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>
            Hello! How can we help you with MOR products today?
          </div>
        )}
        {messages.map(msg => (
          <div key={msg._id} style={{ alignSelf: msg.sender === 'customer' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
            <div style={{ 
              background: msg.sender === 'customer' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              color: msg.sender === 'customer' ? 'black' : 'white',
              padding: '12px 16px',
              borderRadius: '16px',
              borderBottomRightRadius: msg.sender === 'customer' ? '4px' : '16px',
              borderBottomLeftRadius: msg.sender === 'admin' ? '4px' : '16px',
              border: msg.sender === 'admin' ? '1px solid rgba(255,255,255,0.2)' : 'none'
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
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', textAlign: msg.sender === 'customer' ? 'right' : 'left', display: 'flex', alignItems: 'center', justifyContent: msg.sender === 'customer' ? 'flex-end' : 'flex-start', gap: '4px' }}>
              {formatMessageTime(msg.createdAt)}
              {msg.sender === 'customer' && (
                <span style={{ fontStyle: 'italic', opacity: 0.8 }}>{msg.read ? "Read" : "Unread"}</span>
              )}
            </div>
          </div>
        ))}

        {product && messages.length === 0 && (
          <div style={{ alignSelf: 'flex-end', maxWidth: '75%', background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', border: '1px solid var(--primary)', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <img src={product.images && product.images[0] ? product.images[0] : product.image} alt={product.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{product.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--primary)' }}>Rs. {product.price}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
              <button 
                onClick={() => setChatProduct(null)}
                className="btn-outline" 
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleSendMessage(null, "I'm interested in this product.", { title: product.title, price: product.price, image: product.images && product.images[0] ? product.images[0] : product.image });
                }}
                className="btn-primary" 
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                Send
              </button>
            </div>
          </div>
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
              padding: '12px 20px', 
              borderRadius: '30px', 
              border: '1px solid rgba(255,255,255,0.2)', 
              background: 'rgba(255,255,255,0.05)', 
              color: 'white',
              outline: 'none'
            }} 
          />
          <button type="submit" className="btn-primary" style={{ borderRadius: '50%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={20} color="black" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerChat;
