import React from 'react';

const TermsConditions = () => {
  return (
    <div className="glass-panel about-container" style={{ width: '100%', minHeight: '100vh', borderRadius: '0', padding: '100px 20px 40px', boxSizing: 'border-box',marginTop:"25px" }}>
      <div className="about-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 className="section-title" style={{ marginBottom: '40px', fontSize: '36px' }}>Terms & Conditions</h1>
        <div className="about-text" style={{ display: 'flex', flexDirection: 'column', gap: '25px', color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '18px' }}>
          <p>Welcome to <strong>MOR</strong>. By accessing our website, you agree to be bound by these Terms and Conditions and our Privacy Policy.</p>
          <p>All content included on the site, such as text, graphics, logos, images, and software, is the property of MOR and protected by international copyright laws.</p>
          <p>We reserve the right to refuse service, terminate accounts, remove or edit content, or cancel orders at our sole discretion. Prices for our products are subject to change without notice.</p>
          <p>We do not guarantee, represent or warrant that your use of our service will be uninterrupted, timely, secure or error-free. You agree that from time to time we may remove the service for indefinite periods of time.</p>
          <p>Questions about the Terms of Service should be sent to us via our Helpline or contact form. Thank you for choosing MOR.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
