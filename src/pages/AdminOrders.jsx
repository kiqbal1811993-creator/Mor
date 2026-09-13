import { API_URL } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, MessageCircle, ShoppingBag, LogOut, ChevronDown, UserPlus, Star, HelpCircle, Menu, X, Trash2 } from 'lucide-react';

const statusColors = {
  Pending: { bg: 'rgba(255, 193, 7, 0.15)', color: '#ffc107', border: 'rgba(255, 193, 7, 0.4)' },
  Processing: { bg: 'rgba(33, 150, 243, 0.15)', color: '#2196f3', border: 'rgba(33, 150, 243, 0.4)' },
  Shipped: { bg: 'rgba(156, 39, 176, 0.15)', color: '#9c27b0', border: 'rgba(156, 39, 176, 0.4)' },
  Delivered: { bg: 'rgba(49, 205, 106, 0.15)', color: '#31cd6a', border: 'rgba(49, 205, 106, 0.4)' },
  Cancelled: { bg: 'rgba(255, 71, 87, 0.15)', color: '#ff4757', border: 'rgba(255, 71, 87, 0.4)' },
};

const AdminOrders = ({ adminToken, setAdminToken, isSubAdmin, permissions = [] }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const orderCountRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders`, { headers: { Authorization: 'Bearer ' + adminToken } });
      if (res.ok) {
        const data = await res.json();
        if (orderCountRef.current !== null && data.length > orderCountRef.current) {
          setNewOrderAlert(true);
          try { new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAA...').play(); } catch {}
        }
        orderCountRef.current = data.length;
        setOrders(data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!adminToken) { navigate(isSubAdmin ? '/admin' : '/super-admin'); return; }
    fetchOrders();
    intervalRef.current = setInterval(() => fetchOrders(true), 15000); // reduced from 5s to 15s
    // Sub-admin: also verify session every 5s
    let sessionInterval;
    if (isSubAdmin) {
      const checkSession = async () => {
        try {
          const r = await fetch(`${API_URL}/sub-admin/verify`, {
            headers: { Authorization: 'Bearer ' + adminToken }
          });
          if (!r.ok) {
            sessionStorage.removeItem('subAdminToken');
            sessionStorage.removeItem('subAdminPermissions');
            setAdminToken(null);
            setShowLogoutModal(true);
            setTimeout(() => navigate('/admin'), 3000);
            return;
          }
        } catch {}
      };
      sessionInterval = setInterval(checkSession, 60000); // reduced from 5s to 60s
    }
    return () => {
      clearInterval(intervalRef.current);
      if (sessionInterval) clearInterval(sessionInterval);
    };
  }, [adminToken, isSubAdmin]);

  const updateStatus = async (orderId, status) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    try {
      const res = await fetch(`${API_URL}/orders/` + orderId + '/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + adminToken },
        body: JSON.stringify({ status })
      });
      if (!res.ok) { fetchOrders(); }
    } catch (err) { 
      console.error(err); 
      fetchOrders();
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch(`${API_URL}/orders/` + orderId, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + adminToken }
      });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o._id !== orderId));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete order');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting order');
    }
  };

  if (!adminToken) return null;
  if (isSubAdmin && !permissions.includes('orders')) return (
    <div className="glass-panel" style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h2>You do not have permission to view orders.</h2>
    </div>
  );

  return (
    <div className="glass-panel admin-layout" style={{ borderRadius: '0', padding: 0, boxSizing: 'border-box' }}>
      
      {/* Mobile Menu Button */}
      <button 
        className="admin-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{
          display: isMobile ? 'flex' : 'none',
          position: 'fixed',
          top: '18px',
          left: '18px',
          zIndex: 1100,
          background: 'rgba(30, 30, 50, 0.95)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white',
          padding: '10px',
          borderRadius: '8px',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Custom Logout Modal */}
      {showLogoutModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(30,30,50,0.98), rgba(20,20,40,0.98))', border: '1px solid rgba(255,71,87,0.4)', borderRadius: '20px', padding: '50px 60px', textAlign: 'center', maxWidth: '420px', boxShadow: '0 25px 80px rgba(255,71,87,0.25)' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,71,87,0.15)', border: '2px solid rgba(255,71,87,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px' }}>🚫</div>
            <h2 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: '700', color: '#ff4757' }}>Access Revoked</h2>
            <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: '1.6' }}>Your admin account has been removed by the Super Admin.</p>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Redirecting to login page...</p>
            <div style={{ marginTop: '24px', height: '4px', borderRadius: '2px', background: 'rgba(255,71,87,0.2)', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#ff4757', borderRadius: '2px', animation: 'slideProgress 3s linear forwards' }} />
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes slideProgress { from { width: 0% } to { width: 100% } }`}</style>
      {/* Sidebar */}
      <div className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <h2 style={{ margin: '0 0 40px 0', fontSize: '22px', textAlign: 'center' }}>{isSubAdmin ? 'Admin Panel' : 'Super Admin'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
          {!isSubAdmin && (
            <button onClick={() => navigate('/super-admin/add-admin')} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <UserPlus size={20} /> Add Admin
            </button>
          )}
          {(!isSubAdmin || permissions.includes('products')) && (
            <button onClick={() => navigate(isSubAdmin ? '/admin/dashboard' : '/super-admin/dashboard')} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <Package size={20} /> Products
            </button>
          )}
          {(!isSubAdmin || permissions.includes('orders')) && (
            <button style={{ background: 'var(--primary)', color: 'black', border: 'none', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
              <ShoppingBag size={20} /> Orders
            </button>
          )}
          {(!isSubAdmin || permissions.includes('chat')) && (
            <button onClick={() => navigate(isSubAdmin ? '/admin/chat' : '/super-admin/chat')} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <MessageCircle size={20} /> Chat
            </button>
          )}
          {(!isSubAdmin || permissions.includes('helpline')) && (
            <button onClick={() => navigate(isSubAdmin ? '/admin/chat?filter=helpline' : '/super-admin/chat?filter=helpline')} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <HelpCircle size={20} /> Help Chat
            </button>
          )}
        </div>
        <button onClick={() => { setAdminToken(null); navigate(isSubAdmin ? '/admin' : '/super-admin'); }} style={{ background: 'rgba(255,71,87,0.1)', color: '#ff4757', border: '1px solid rgba(255,71,87,0.3)', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,71,87,0.2)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,71,87,0.1)'}>
          <LogOut size={20} /> Logout
        </button>
      </div>
      <div className="admin-sidebar-overlay" onClick={() => setMobileMenuOpen(false)}></div>

      {/* Main */}
      <div className="admin-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="section-title" style={{ margin: 0 }}>Customer Orders</h1>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(49,205,106,0.12)', border: '1px solid rgba(49,205,106,0.3)', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', color: '#31cd6a', fontWeight: '600' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#31cd6a', display: 'inline-block' }}></span>
              LIVE
            </span>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{orders.length} total orders</span>
        </div>

        {newOrderAlert && (
          <div onClick={() => setNewOrderAlert(false)} style={{ cursor: 'pointer', marginBottom: '20px', padding: '14px 20px', background: 'rgba(49,205,106,0.15)', border: '1px solid rgba(49,205,106,0.5)', borderRadius: '12px', color: '#31cd6a', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={18} /> New order received! Click to dismiss.
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
            <ShoppingBag size={60} style={{ opacity: 0.2, marginBottom: '20px' }} />
            <p>No orders placed yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => {
              const sc = statusColors[order.status] || statusColors.Pending;
              const isExpanded = expandedOrder === order._id;
              return (
                <div key={order._id} className="glass" style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {/* Order header row */}
                  <div onClick={() => setExpandedOrder(isExpanded ? null : order._id)} style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', gap: '20px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    {/* Product image */}
                    {order.product?.image && <img src={order.product.image} alt="" style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '700', fontSize: '15px' }}>{order.orderId}</span>
                        <span style={{ background: sc.bg, color: sc.color, border: '1px solid ' + sc.border, borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: '600' }}>{order.status}</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.customer?.name} &bull; {order.product?.title}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '16px' }}>Rs. {order.totalAmount}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                    <ChevronDown size={18} style={{ color: 'var(--text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', flexShrink: 0 }} />
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '24px', display: 'flex', gap: '30px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)' }}>
                      {/* Customer */}
                      <div style={{ flex: '1 1 200px' }}>
                        <h4 style={{ margin: '0 0 12px', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Customer Info</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '14px' }}>
                          <div><span style={{ color: 'var(--text-muted)' }}>Name: </span><strong>{order.customer?.name}</strong></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Email: </span>{order.customer?.email}</div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Phone: </span>{order.customer?.phone}</div>
                          {order.customer?.city && <div><span style={{ color: 'var(--text-muted)' }}>City: </span><strong>{order.customer.city}</strong></div>}
                          <div><span style={{ color: 'var(--text-muted)' }}>Address: </span>{order.customer?.address}</div>
                        </div>
                      </div>

                      {/* Product */}
                      <div style={{ flex: '1 1 200px' }}>
                        <h4 style={{ margin: '0 0 12px', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Product Details</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '14px' }}>
                          <div><span style={{ color: 'var(--text-muted)' }}>Product: </span><strong>{order.product?.title}</strong></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Price: </span>Rs. {order.product?.price}</div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Qty: </span>{order.quantity}</div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Total: </span><strong style={{ color: 'var(--primary)' }}>Rs. {order.totalAmount}</strong></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Payment: </span>{order.deliveryMethod}</div>
                        </div>
                      </div>

                      {/* Status update */}
                      <div style={{ flex: '1 1 160px' }}>
                        <h4 style={{ margin: '0 0 12px', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Update Status</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {['Pending','Processing','Shipped','Delivered','Cancelled'].map(s => {
                            const c = statusColors[s];
                            return (
                              <button key={s} onClick={() => updateStatus(order._id, s)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid ' + c.border, background: order.status === s ? c.bg : 'transparent', color: order.status === s ? c.color : 'var(--text-muted)', cursor: 'pointer', textAlign: 'left', fontSize: '13px', fontWeight: order.status === s ? '700' : '400', transition: 'all 0.2s' }}>
                                {order.status === s ? '● ' : '○ '}{s}
                              </button>
                            );
                          })}
                          <button onClick={() => deleteOrder(order._id)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255, 71, 87, 0.4)', background: 'rgba(255, 71, 87, 0.1)', color: '#ff4757', cursor: 'pointer', textAlign: 'left', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                            <Trash2 size={16} /> Delete Order
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
