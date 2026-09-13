import React, { useState } from 'react';
import { ArrowRight, Home, ShoppingBag, Package, MessageCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Footer = ({ currentPage }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  const handleNewsletterSubmit = async () => {
    if (!newsletterEmail.trim()) return;
    try {
      const res = await fetch('http://localhost:5000/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail.trim() })
      });
      const data = await res.json();
      setNewsletterMsg(data.message || 'Subscribed!');
      setNewsletterEmail('');
      setTimeout(() => setNewsletterMsg(''), 4000);
    } catch {
      setNewsletterMsg('Something went wrong. Try again.');
    }
  };

  const handleScrollTo = (id) => {
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
    } else {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const isNoFooterPage = location.pathname === '/track-order' || location.pathname === '/helpline';

  return (
    <>
      {!isNoFooterPage && (
        <footer className="footer-section">
        <div className="glass-panel footer-top" style={{ borderRadius: '0' }}>
          <div className="footer-logo">
            <img src="/logo.png" alt="MOR Logo" className="footer-logo-img" />
            <div>
              <h2 className="footer-logo-title">MOR</h2>
            </div>
          </div>

          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/about">About</Link>
            <a href="#why-choose" onClick={(e) => { e.preventDefault(); handleScrollTo('why-choose'); }}>Benefits</a>
            <a href="#reviews" onClick={(e) => { e.preventDefault(); handleScrollTo('reviews'); }}>Reviews</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); handleScrollTo('faq'); }}>FAQ</a>
          </div>

          <div className="footer-social-wrapper">
            <span className="footer-label">Follow Us</span>
            <div className="social-icons">
              <a href="https://www.facebook.com/mis.phool.baloch.pk" target="_blank" rel="noopener noreferrer" className="social-icon glass" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="social-icon glass" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://www.tiktok.com/@multirecaveoil?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="social-icon glass" aria-label="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              </a>
            </div>
          </div>

          <div className="footer-newsletter">
            <span className="footer-label">Get Exclusive Offers</span>
            <div className="newsletter-input-group">
              <input
                type="email"
                placeholder="Enter your email"
                className="glass newsletter-input"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNewsletterSubmit()}
              />
              <button className="btn-primary newsletter-btn" style={{ padding: '10px' }} onClick={handleNewsletterSubmit}><ArrowRight size={16} /></button>
            </div>
            {newsletterMsg && <p style={{ marginTop: '8px', fontSize: '13px', color: newsletterMsg.includes('wrong') ? '#ff4757' : '#4ade80' }}>{newsletterMsg}</p>}
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 MOR. All rights reserved.</p>
            <div className="footer-legal">
              <Link to="/privacy-policy">Privacy Policy</Link>
              <span>|</span>
              <Link to="/terms-conditions">Terms & Conditions</Link>
              <span>|</span>
              <Link to="/return-policy">Return Policy</Link>
            </div>
          </div>
        </div>
        </footer>
      )}

      {/* Mobile Bottom Navigation outside container too */}
      <div className="mobile-bottom-nav glass">
        <Link to="/" className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link to="/shop" className={`bottom-nav-item ${location.pathname === '/shop' ? 'active' : ''}`}>
          <ShoppingBag size={20} />
          <span>Shop</span>
        </Link>
        <Link to="/track-order" className={`bottom-nav-item ${location.pathname === '/track-order' ? 'active' : ''}`}>
          <Package size={20} />
          <span>Track Order</span>
        </Link>
        <Link to="/helpline" className={`bottom-nav-item ${location.pathname === '/helpline' ? 'active' : ''}`}>
          <MessageCircle size={20} />
          <span>Helpline</span>
        </Link>
      </div>
    </>
  );
};

export default Footer;
