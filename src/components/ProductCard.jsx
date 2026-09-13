import React, { useState } from 'react';
import { ShoppingCart, ChevronLeft, ChevronRight, MessageCircle, ArrowRight, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, onMoreDetailClick, isDetailView, noBackground, onAddToCart, onOpenChat, showQuantitySelector = false }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0); 
  // 0 for main image, 1+ for other images, or a special index for video
  
  const images = (product.images && product.images.length > 0) ? product.images : (product.image ? [product.image] : ['']);
  const video = product.video || null;
  const totalMedia = images.length + (video ? 1 : 0);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        actualPrice: product.actualPrice,
        image: images[0],
        quantity: quantity
      });
    }
  };

  const actualPrice = product.actualPrice || 1500;
  const discountPercentage = Math.round(((actualPrice - product.price) / actualPrice) * 100);

  const handlePrevMedia = () => {
    setActiveMediaIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
  };

  const handleNextMedia = () => {
    setActiveMediaIndex((prev) => (prev + 1) % totalMedia);
  };

  const isVideoActive = video && activeMediaIndex === images.length;

  return (
  <div className={noBackground ? 'product-details' : 'product-details glass-panel'}>
    <div className="product-thumbnails" style={{ display: 'flex', gap: '10px' }}>
      {images.map((img, idx) => (
        <img 
          key={idx}
          src={img} 
          onClick={() => setActiveMediaIndex(idx)}
          style={{ 
            width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer',
            border: activeMediaIndex === idx ? '2px solid var(--primary)' : '2px solid transparent'
          }} 
          alt="thumbnail" 
        />
      ))}
      {video && (
        <div 
          onClick={() => setActiveMediaIndex(images.length)}
          className="glass" 
          style={{ 
            width: '50px', height: '50px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: isVideoActive ? '2px solid var(--primary)' : '2px solid transparent'
          }}>
          <PlayCircle size={24} color="var(--primary)" />
        </div>
      )}
    </div>

    <div className="product-details-img-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {totalMedia > 1 && (
        <button onClick={handlePrevMedia} className="glass hover-scale product-arrow-btn" style={{ position: 'absolute', left: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', padding: '8px', color: 'white', cursor: 'pointer', display: 'flex', zIndex: 2 }}>
          <ChevronLeft className="product-arrow-icon" size={24} />
        </button>
      )}
      
      {isVideoActive ? (
        <video 
          src={video} 
          controls 
          autoPlay 
          loop
          className="product-details-img" 
          style={{ borderRadius: '16px', position: 'relative', zIndex: 1, maxHeight: '400px', width: '100%', objectFit: 'contain' }} 
        />
      ) : (
        <img src={images[activeMediaIndex]} id="product-details" alt={product.title} className="product-details-img" style={{ borderRadius: '16px', position: 'relative', zIndex: 1 }} />
      )}
      
      {totalMedia > 1 && (
        <button onClick={handleNextMedia} className="glass hover-scale product-arrow-btn" style={{ position: 'absolute', right: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', padding: '8px', color: 'white', cursor: 'pointer', display: 'flex', zIndex: 2 }}>
          <ChevronRight className="product-arrow-icon" size={24} />
        </button>
      )}
    </div>
    
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <span className="hero-tag glass" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', margin: 0 }}>Best Seller</span>
        <button onClick={() => onOpenChat(product)} className="hero-tag glass hover-scale" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fff', borderColor: 'rgba(255,255,255,0.2)', margin: 0, cursor: 'pointer', background: 'rgba(255,255,255,0.1)' }}>
          <MessageCircle size={14} /> Chat now
        </button>
      </div>
      <h2 className="product-details-title">{product.title}</h2>


      <div className="product-controls-wrapper">
        <div className="product-details-price-container" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <div className="product-quantity-selector glass" style={{ display: 'flex', alignItems: 'center', padding: '0 15px', borderRadius: '30px', height: '40px' }}>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>-</button>
            <span style={{ margin: '0 15px', fontWeight: 'bold' }}>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>+</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h3 className="product-details-price" style={{ lineHeight: 1, margin: 0 }}>Rs. {product.price * quantity}</h3>
            {discountPercentage > 0 && (
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <span className="product-details-old-price" style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>Rs. {actualPrice * quantity}</span>
                <span className="product-details-discount glass" style={{ position: 'absolute', top: '-18px', left: '70%', marginLeft: '5px', padding: '2px 6px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '10px', whiteSpace: 'nowrap' }}>{discountPercentage}% OFF</span>
              </div>
            )}
          </div>
        </div>

        <div className="product-actions" style={{ display: 'contents' }}>
          <div className="product-actions-buttons" style={{ display: 'flex', gap: '15px', width: '100%', marginTop: '10px' }}>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#31cd6aff', color: 'white', borderColor: '#22c55e' }} onClick={() => navigate(`/checkout/${product._id || product.id}`, { state: { quantity } })}>
              Buy Now
            </button>
            <button onClick={handleAddToCart} className="btn-outline" style={{ flex: 1, justifyContent: 'center', background: 'transparent' }}>
              <ShoppingCart size={18} /> Add to Cart
            </button>
          </div>
          {!isDetailView && (
            <div onClick={() => navigate(`/product/${product._id || product.id}`)} className="more-detail-btn hover-text-primary" style={{ cursor: 'pointer' }}>
              <span>More Detail</span>
              <ArrowRight size={16} className="text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default ProductCard;
