import React from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartSidebar = ({ isCartOpen, setIsCartOpen, cartItems, setCartItems, handleUpdateCartQuantity, totalCartPrice }) => {
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <div 
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999, backdropFilter: 'blur(5px)' }}
      onClick={() => setIsCartOpen(false)}
    >
      <div 
        className="glass-panel" 
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '350px', maxWidth: '100vw', borderRadius: 0, zIndex: 10000, display: 'flex', flexDirection: 'column', padding: '20px', cursor: 'default', borderLeft: '1px solid rgba(255,255,255,0.1)', animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Your Cart</h2>
          <button onClick={() => setIsCartOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {cartItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
              <ShoppingCart size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '18px' }}>Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={idx} style={{ position: 'relative', display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>
                <button onClick={() => setCartItems(prev => prev.filter(i => i.id !== item.id))} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }} aria-label="Remove item" title="Remove">
                  <X size={16} className="hover-text-primary" />
                </button>
                <img src={item.image} alt={item.title} style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ flex: 1, paddingRight: '20px' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold', lineHeight: 1.2 }}>{item.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px', gap: '5px' }}>
                    <button disabled={item.quantity <= 1} onClick={() => handleUpdateCartQuantity(item.id, item.quantity - 1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '24px', height: '24px', borderRadius: '4px', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', opacity: item.quantity <= 1 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                    <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => handleUpdateCartQuantity(item.id, item.quantity + 1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', alignSelf: 'flex-end' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px', color: 'var(--primary)' }}>Rs. {item.price * item.quantity}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', marginBottom: '20px' }}>
              <span>Subtotal:</span>
              <span>Rs. {totalCartPrice}</span>
            </div>
            <button 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: '16px' }}
              onClick={() => {
                setIsCartOpen(false);
                navigate('/checkout');
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
