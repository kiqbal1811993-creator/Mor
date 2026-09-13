import React, { useState, useEffect } from 'react';
import { Star, Upload, X } from 'lucide-react';
import { createPortal } from 'react-dom';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New review state
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !text || !rating) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, name, rating, text, image })
      });
      
      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setName('');
        setRating(5);
        setText('');
        setImage('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (count) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={16} 
        fill={i < count ? "#ffc107" : "transparent"} 
        color={i < count ? "#ffc107" : "rgba(255,255,255,0.3)"} 
      />
    ));
  };

  return (
    <div className="product-reviews-container" style={{ marginTop: '40px' }}>
      <h3 className="section-title" style={{ marginBottom: '30px', fontSize: '24px' }}>Customer Reviews</h3>
      
      {/* Add Review Form */}
      <div className="glass review-form-container" style={{ padding: '25px', borderRadius: '16px', marginBottom: '40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h4 style={{ margin: '0 0 20px', color: 'white', fontSize: '18px' }}>Write a Review</h4>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Your Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="glass"
              style={{ flex: 1, minWidth: '200px', padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', background: 'rgba(255,255,255,0.05)' }}
            />
            
            <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Rating:</span>
              <div style={{ display: 'flex', gap: '5px', cursor: 'pointer' }}>
                {[1,2,3,4,5].map(num => (
                  <Star 
                    key={num} 
                    size={20} 
                    onClick={() => setRating(num)}
                    fill={num <= rating ? "#ffc107" : "transparent"} 
                    color={num <= rating ? "#ffc107" : "rgba(255,255,255,0.3)"} 
                  />
                ))}
              </div>
            </div>
          </div>

          <textarea 
            placeholder="Share your experience..." 
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            className="glass"
            rows={4}
            style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', background: 'rgba(255,255,255,0.05)', resize: 'vertical' }}
          />

          <div className="review-form-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', transition: 'background 0.2s' }}>
              <Upload size={18} />
              <span>Attach Image</span>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
            {image && (
              <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                <img src={image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                <button type="button" onClick={() => setImage('')} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--primary)', color: 'black', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                  <X size={12} />
                </button>
              </div>
            )}
            
            <button type="submit" disabled={isSubmitting} className="btn-primary submit-review-btn" style={{ marginLeft: 'auto', padding: '10px 25px' }}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>

      {/* Reviews List */}
      <div>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.map(review => (
              <div key={review._id} className="glass review-item" style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h5 style={{ margin: '0 0 5px', color: 'white', fontSize: '16px' }}>{review.name}</h5>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '15px', marginTop: '15px', alignItems: 'flex-start' }}>
                  {review.image && (
                    <img 
                      src={review.image} 
                      alt="Review" 
                      onClick={() => setSelectedImage(review.image)}
                      style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }} 
                    />
                  )}
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                    {review.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && createPortal(
        <div 
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
              style={{
                position: 'absolute', top: '-40px', right: '0',
                background: 'transparent', border: 'none', color: 'white',
                cursor: 'pointer'
              }}
            >
              <X size={30} />
            </button>
            <img 
              src={selectedImage} 
              alt="Fullscreen Review" 
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }} 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProductReviews;
