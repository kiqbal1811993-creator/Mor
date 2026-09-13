import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="glass-panel about-container" style={{ width: '100%', minHeight: '100vh', borderRadius: '0', padding: '100px 20px 40px', boxSizing: 'border-box', marginTop:"25px" }}>
      <div className="about-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 className="section-title" style={{ marginBottom: '40px', fontSize: '36px' }}>Privacy Policy</h1>
        <div className="about-text" style={{ display: 'flex', flexDirection: 'column', gap: '25px', color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '18px' }}>
          <p>At <strong>MOR</strong>, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>
          <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes Personal Data, such as your name, shipping address, email address, and telephone number.</p>
          <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to process your orders, send you updates, and improve our services.</p>
          <p>We may share information we have collected about you in certain situations. Your information may be disclosed to third-party service providers that perform services for us, including payment processing and order fulfillment.</p>
          <p>We use administrative, technical, and physical security measures to help protect your personal information. However, no data transmission over the Internet or wireless network can be guaranteed to be 100% secure.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
