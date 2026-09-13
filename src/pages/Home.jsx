import React, { useState, useRef } from 'react';
import { Leaf, Shield, CheckCircle, ArrowRight, Star, Heart, Droplet, User, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const Home = ({ products, handleAddToCart, onOpenChat, navigate }) => {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const carouselRef = useRef(null);

  const nextReview = () => setCurrentReviewIndex(prev => Math.min(prev + 1, 2));
  const prevReview = () => setCurrentReviewIndex(prev => Math.max(prev - 1, 0));

  const maxProducts = products.slice(0, 3);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -window.innerWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: window.innerWidth, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Hero Section with Video Background */}
      <header className="video-hero">
        <video
          className="hero-video-bg"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/MOR_MULTI_RECOVER_product_video_20260910213130.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay-gradient"></div>

        <div className="video-hero-content">
          <div className="video-hero-main-text">
            <span className="hero-tag glass">MOR - Premium Hair Care</span>
            <h1 className="hero-title" style={{ textShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>MULTI RECOVER</h1>
            <h2 className="hero-subtitle" style={{ textShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>Hair Oil</h2>

            <div className="hero-features" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
              <span>Stronger Roots</span>
              <span>Healthier Hair</span>
              <span>Natural Care</span>
            </div>

            <p className="hero-desc" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)', maxWidth: '500px' }}>
              The power of nature in every drop. MOR Multi Recover Hair Oil is specially formulated with natural oils and vitamins to nourish your hair, reduce hair fall and bring back its natural shine.
            </p>

            <div className="hero-badges">
              <div className="badge">
                <div className="badge-icon glass"><Leaf size={16} className="text-primary" /></div>
                <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>100%<br />Natural Oils</span>
              </div>
              <div className="badge">
                <div className="badge-icon glass"><Shield size={16} className="text-primary" /></div>
                <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>No Harmful<br />Chemicals</span>
              </div>
              <div className="badge">
                <div className="badge-icon glass"><CheckCircle size={16} className="text-primary" /></div>
                <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Safe for<br />All Hair Types</span>
              </div>
            </div>
          </div>

          <div className="video-hero-bottom-right">
            <button className="btn-primary" style={{ padding: '12px 24px' }} onClick={() => { const el = document.getElementById('product-details'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>Buy Now</button>
            <button
              className="video-details-link"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white' }}
              onClick={() => { const el = document.getElementById('product-details'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
              aria-label="Scroll to products"
            >
              <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Benefits Strip */}
      <div id="benefits" className="benefits-strip">
        <div className="benefit-item glass-panel">
          <div className="badge-icon glass" style={{ width: '48px', height: '48px' }}><Leaf size={24} className="text-primary" /></div>
          <div className="benefit-text">
            <h4>Natural Ingredients</h4>
            <p>Pure & Safe</p>
          </div>
        </div>
        <div className="benefit-item glass-panel">
          <div className="badge-icon glass" style={{ width: '48px', height: '48px' }}><Shield size={24} className="text-primary" /></div>
          <div className="benefit-text">
            <h4>Clinically Proven</h4>
            <p>Effective Results</p>
          </div>
        </div>
        <div className="benefit-item glass-panel">
          <div className="badge-icon glass" style={{ width: '48px', height: '48px' }}><Star size={24} className="text-primary" /></div>
          <div className="benefit-text">
            <h4>Premium Quality</h4>
            <p>100% Guaranteed</p>
          </div>
        </div>
      </div>

      {/* Product Details Section */}
      <div id="product-details" className="product-carousel-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', position: 'relative' }}>
        {maxProducts.length > 1 && (
          <button 
            onClick={scrollLeft} 
            className="hover-scale desktop-arrow-btn left-arrow" 
            style={{ 
              padding: '12px', color: 'white', background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0
            }}>
            <ChevronLeft size={48} />
          </button>
        )}
        
        <div ref={carouselRef} className="product-carousel" style={{ flex: 1, display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollBehavior: 'smooth', width: '100%', scrollbarWidth: 'none', padding: '10px 0' }}>
          {maxProducts.length > 0 ? (
            maxProducts.map((product) => (
              <div key={product.id} style={{ minWidth: '100%', scrollSnapAlign: 'start', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%' }}>
                  <ProductCard product={product} onMoreDetailClick={() => navigate('/product-detail')} onAddToCart={handleAddToCart} onOpenChat={onOpenChat} />
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', width: '100%' }}>No products available.</p>
          )}
        </div>

        {maxProducts.length > 1 && (
          <button 
            onClick={scrollRight} 
            className="hover-scale desktop-arrow-btn right-arrow" 
            style={{ 
              padding: '12px', color: 'white', background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0
            }}>
            <ChevronRight size={48} />
          </button>
        )}
      </div>

      {/* Why Choose Section */}
      <div id="why-choose" className="glass-panel why-choose-section">
        <div className="why-choose-header">
          <h3 className="why-choose-title">Why Choose MOR Hair & Beauty?</h3>
          <div className="why-choose-badge">
            <span className="natural-care-text">Natural Care<br />Real Results</span>
            <Heart size={20} className="text-primary why-choose-heart" />
          </div>
        </div>

        <div className="why-choose-features">
          <div className="why-choose-feature">
            <div className="glass why-choose-icon">
              <Leaf size={24} className="text-primary" />
            </div>
            <div className="why-choose-text">
              <h4>Deep Hydration</h4>
              <p>Nourishes hair roots and skin</p>
            </div>
          </div>
          <div className="why-choose-feature">
            <div className="glass why-choose-icon">
              <Droplet size={24} className="text-primary" />
            </div>
            <div className="why-choose-text">
              <h4>Promotes Healthy Growth</h4>
              <p>Activates follicles & restores elasticity</p>
            </div>
          </div>
          <div className="why-choose-feature">
            <div className="glass why-choose-icon">
              <Star size={24} className="text-primary" />
            </div>
            <div className="why-choose-text">
              <h4>Restores Natural Shine</h4>
              <p>Revitalizes dull hair and tired skin</p>
            </div>
          </div>
          <div className="why-choose-feature">
            <div className="glass why-choose-icon">
              <Shield size={24} className="text-primary" />
            </div>
            <div className="why-choose-text">
              <h4>Smooths & Softens</h4>
              <p>Leaves hair silky and skin flawless</p>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Section */}
      <div id="real-results" className="glass-panel banner-section">
        <div className="banner-image-container">
          <img src="/woman-hair.jpg" alt="Healthy Hair" className="banner-image" />
        </div>

        <div className="banner-content">
          <div className="banner-text">
            <span className="glass banner-badge">Healthy Hair & Skin • Happy You</span>
            <h2 className="banner-title">Real Care<br />Real Results</h2>
            <p className="banner-desc">Experience the natural difference with MOR Hair & Beauty Products.</p>
          </div>

          <div className="banner-features">
            <div className="banner-feature">
              <div className="glass banner-icon">
                <Droplet size={28} className="text-primary" />
              </div>
              <span>Radiant Skin</span>
            </div>
            <div className="banner-feature">
              <div className="glass banner-icon">
                <Leaf size={28} className="text-primary" />
              </div>
              <span>Stronger Roots</span>
            </div>
            <div className="banner-feature">
              <div className="glass banner-icon">
                <Star size={28} className="text-primary" />
              </div>
              <span>Natural Shine</span>
            </div>
            <div className="banner-feature">
              <div className="glass banner-icon">
                <Shield size={28} className="text-primary" />
              </div>
              <span>Deep Hydration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div id="reviews" className="glass-panel section-container">
        <div className="section-header">
          <div>
            <h3 className="section-title">What Our Customers Say</h3>
            <p className="section-subtitle">Real People. Real Experiences.</p>
          </div>
        </div>

        <div className="reviews-wrapper" style={{ '--current-index': currentReviewIndex }}>
          <div className="reviews-grid">
            <div className={`review-card glass ${currentReviewIndex === 0 ? 'active-review' : 'hidden-review'}`}>
              <div className="review-header">
                <div className="review-avatar">
                  <User size={24} color="var(--primary)" />
                </div>
                <div className="review-user-info">
                  <h4>Ayesha Khan</h4>
                </div>
              </div>
              <p className="review-text">My hair fall was very high but after using this oil I can see a real difference. My hair feels stronger and more shiny now. Highly recommended!</p>
              <span className="review-date">2 days ago</span>
            </div>

            <div className={`review-card glass ${currentReviewIndex === 1 ? 'active-review' : 'hidden-review'}`}>
              <div className="review-header">
                <div className="review-avatar">
                  <User size={24} color="var(--primary)" />
                </div>
                <div className="review-user-info">
                  <h4>Sara Malik</h4>
                </div>
              </div>
              <p className="review-text">Best hair oil I have ever used. Natural oils are really effective. My hair feels so soft and healthy. Love it!</p>
              <span className="review-date">4 days ago</span>
            </div>

            <div className={`review-card glass ${currentReviewIndex === 2 ? 'active-review' : 'hidden-review'}`}>
              <div className="review-header">
                <div className="review-avatar">
                  <User size={24} color="var(--primary)" />
                </div>
                <div className="review-user-info">
                  <h4>Usman Raza</h4>
                </div>
              </div>
              <p className="review-text">Amazing product! Fragrance is also very good. It really works on hair fall and gives a natural shine. I'm ordering again!</p>
              <span className="review-date">6 days ago</span>
            </div>
          </div>
        </div>

        <div className="mobile-review-controls">
          <button onClick={prevReview} className="glass" disabled={currentReviewIndex === 0}><ChevronLeft size={24} /></button>
          <button onClick={nextReview} className="glass" disabled={currentReviewIndex === 2}><ChevronRight size={24} /></button>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="glass-panel section-container">
        <div className="section-header">
          <div>
            <h3 className="section-title">Frequently Asked Questions</h3>
            <p className="section-subtitle">Find answers to common questions about MOR Hair & Beauty Products.</p>
          </div>
        </div>

        <div className="faq-grid">
          <div className="faq-item glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '15px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Is this product original?</span>
              <Plus size={16} />
            </div>
            <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, textAlign: 'left' }}>Yes, our product is 100% original and guaranteed. We ensure the highest quality standards for all our customers.</p>
          </div>
          
          <div className="faq-item glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '15px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Is cash on delivery available?</span>
              <Plus size={16} />
            </div>
            <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, textAlign: 'left' }}>Yes, Cash on Delivery (COD) is available for all orders across the country for your convenience.</p>
          </div>
          
          <div className="faq-item glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '15px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>How long does the delivery take?</span>
              <Plus size={16} />
            </div>
            <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, textAlign: 'left' }}>Delivery typically takes 3 to 4 business days depending on your location.</p>
          </div>
          
          <div className="faq-item glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '15px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>What is the return policy?</span>
              <Plus size={16} />
            </div>
            <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, textAlign: 'left' }}>Since we offer Cash on Delivery, if you are not completely satisfied with the product upon arrival, you can immediately return it to our delivery rider.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
