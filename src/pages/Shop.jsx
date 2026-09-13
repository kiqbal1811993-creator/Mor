import React from 'react';
import ProductCard from '../components/ProductCard';
import { useNavigate, useLocation } from 'react-router-dom';

const Shop = ({ products, handleAddToCart, onOpenChat }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('search') || '';

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="container" style={{ paddingTop: '50px', paddingBottom: '50px', minHeight: '60vh' }}>
      <div className="glass" style={{
        display: 'inline-block',
        padding: '8px 20px',
        borderRadius: '12px',
        marginBottom: '16px',
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        width: 'fit-content',
      }}>
        <h1 className="section-title" style={{ margin: 0, fontSize: '20px' }}>
          {query ? `Search Results for "${query}"` : 'Our Shop'}
        </h1>
      </div>

      {filteredProducts.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>No products found.</p>
      ) : (
        filteredProducts.map(product => (
          <ProductCard key={product.id || product._id} product={product} onMoreDetailClick={() => navigate(`/product/${product.id || product._id}`)} onAddToCart={handleAddToCart} onOpenChat={onOpenChat} />
        ))
      )}
    </div>
  );
};

export default Shop;
