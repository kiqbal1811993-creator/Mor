import React from 'react';

const ReturnPolicy = () => {
  return (
    <div className="glass-panel about-container" style={{ width: '100%', minHeight: '100vh', borderRadius: '0', padding: '100px 20px 40px', boxSizing: 'border-box', marginTop:"25px"}}>
      <div className="about-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 className="section-title" style={{ marginBottom: '40px', fontSize: '36px' }}>Return Policy</h1>
        <div className="about-text" style={{ display: 'flex', flexDirection: 'column', gap: '25px', color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '18px' }}>
          <p>At <strong>MOR</strong>, we want you to be completely satisfied with your purchase. If you are not entirely happy with your product, we're here to help.</p>
          <p>You have 7 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it. Your item must be in the original packaging.</p>
          <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.</p>
          <p>If your return is approved, we will initiate a refund to your credit card (or original method of payment). You will receive the credit within a certain amount of days, depending on your card issuer's policies.</p>
          <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.</p>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
