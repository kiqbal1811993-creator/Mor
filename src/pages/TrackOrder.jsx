import { API_URL } from '../config';
import React, { useState } from 'react';
import { Search, Package, MapPin, Truck, CheckCircle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



const statusSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`${API_URL}/orders/track/${orderId.trim()}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Order not found. Please check your Order ID.');
        }
        throw new Error('Failed to fetch order status.');
      }
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status) => {
    return statusSteps.indexOf(status);
  };

  return (
    <div className="glass-panel track-order-container" style={{ minHeight: '100vh', width: '100%', padding: '100px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 0, boxSizing: 'border-box', position: 'relative' }}>
      
      <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: '30px', left: '30px', background: 'transparent', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '10px', fontSize: '16px', zIndex: 10 }} className="hover-text-primary">
        <ChevronLeft size={24} /> Back
      </button>

      <div className="track-order-content" style={{ width: '100%', maxWidth: '600px', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '28px' }}>Track Your Order</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>Enter your Order ID to check the current status of your delivery.</p>
        
        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="e.g. MOR-12345-ABCD" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={{ width: '100%', padding: '15px 20px 15px 45px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', fontSize: '16px', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0 25px', borderRadius: '12px' }}>
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </form>

        {error && (
          <div style={{ background: 'rgba(255, 71, 87, 0.1)', border: '1px solid rgba(255, 71, 87, 0.3)', color: '#ff4757', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {order && (
          <div className="glass" style={{ borderRadius: '15px', padding: '30px', marginTop: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '14px' }}>Order ID</h3>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px' }}>{order.orderId}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '14px' }}>Order Date</h3>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
              {order.product.image && <img src={order.product.image} alt={order.product.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px' }} />}
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{order.product.title}</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Qty: {order.quantity} • Rs. {order.totalAmount}</p>
              </div>
            </div>

            {order.status === 'Cancelled' ? (
              <div style={{ textAlign: 'center', color: '#ff4757', fontWeight: 'bold', fontSize: '18px', padding: '20px', background: 'rgba(255, 71, 87, 0.1)', borderRadius: '10px' }}>
                Order Cancelled
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {/* Progress Bar Background */}
                <div style={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '4px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
                
                {/* Active Progress Bar */}
                <div style={{ position: 'absolute', top: '20px', left: '10%', height: '4px', background: 'var(--primary)', zIndex: 1, width: `${(Math.max(0, getStatusIndex(order.status)) / (statusSteps.length - 1)) * 80}%`, transition: 'width 0.5s ease' }}></div>

                {statusSteps.map((step, index) => {
                  const isActive = index <= getStatusIndex(order.status);
                  const isCurrent = index === getStatusIndex(order.status);
                  
                  return (
                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', width: '25%' }}>
                      <div style={{ 
                        width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isActive ? 'var(--primary)' : '#2a2a2a',
                        color: isActive ? '#000' : 'var(--text-muted)',
                        border: isCurrent ? '4px solid rgba(49,205,106,0.3)' : 'none',
                        transition: 'all 0.3s ease',
                        marginBottom: '10px'
                      }}>
                        {index === 0 && <Package size={20} />}
                        {index === 1 && <MapPin size={20} />}
                        {index === 2 && <Truck size={20} />}
                        {index === 3 && <CheckCircle size={20} />}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: isActive ? 'bold' : 'normal', color: isActive ? 'white' : 'var(--text-muted)' }}>{step}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
