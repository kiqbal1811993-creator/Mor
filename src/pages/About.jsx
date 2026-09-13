import React from 'react';

const About = () => {
  return (
    <div className="glass-panel about-container" style={{ width: '100%', minHeight: '100vh', borderRadius: '0', padding: '100px 20px 40px', boxSizing: 'border-box' , marginTop:"20px"}}>
      <div className="about-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 className="section-title" style={{ marginBottom: '40px', fontSize: '36px' }}>About MOR</h1>
        <div className="about-text" style={{ display: 'flex', flexDirection: 'column', gap: '25px', color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '18px' }}>
          <p>Welcome to <strong>MOR</strong>, your most trusted companion in the journey towards natural beauty and hair wellness. We believe that true beauty comes from nature, and our philosophy revolves around utilizing the earth's purest elements to restore, rejuvenate, and protect what is naturally yours.</p>
          
          <p>Founded on the principles of organic care and scientific research, MOR was born out of a desire to provide effective, chemical-free alternatives in a market saturated with synthetic products. Our team of experts and botanists work tirelessly to source the highest quality ingredients from sustainable farms across the globe.</p>
          
          <p>Our flagship product, <strong>MOR Multi Recover Hair Oil</strong>, is meticulously crafted with a proprietary blend of 100% natural oils, essential vitamins, and deeply nourishing plant extracts. It has been specifically formulated to combat hair fall, strengthen roots from deep within the scalp, and bring back your hair's natural shine without leaving any greasy residue.</p>
          
          <p>But we don't just stop at hair care. At MOR, our mission extends to empowering you with knowledge and effective, clinically-proven solutions that promote healthy growth and radiant beauty overall. We are constantly expanding our research to bring you more innovative products that align with our core values of purity and effectiveness.</p>
          
          <p>With an unwavering commitment to quality, transparency, and complete customer satisfaction, we ensure that every bottle of MOR brings nature's absolute best directly to your doorstep. Join us in embracing a lifestyle where beauty and wellness go hand in hand.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
