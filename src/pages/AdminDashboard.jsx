import { API_URL } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Package, LogOut, Plus, Trash2, Upload, ShoppingBag, UserPlus, Star, HelpCircle, ArrowLeft, Menu, X } from 'lucide-react';

const AdminDashboard = ({ adminToken, setAdminToken, products, fetchProducts, isSubAdmin, permissions = [] }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    actualPrice: '',
    images: [''],
    video: '',
    description: ''
  });
  const navigate = useNavigate();
  const fileInputRefs = useRef({});

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const orderCountRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!adminToken) {
      navigate(isSubAdmin ? '/admin' : '/super-admin');
      return;
    }
    if (!isSubAdmin) {
      fetchOrdersSilent();
      intervalRef.current = setInterval(() => fetchOrdersSilent(), 60000); // reduced from 30s to 60s
      return () => clearInterval(intervalRef.current);
    } else {
      // Sub-admin: verify session every 5s
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
      checkSession();
      intervalRef.current = setInterval(checkSession, 120000); // reduced from 60s to 120s
      return () => clearInterval(intervalRef.current);
    }
  }, [adminToken, navigate, isSubAdmin]);

  const fetchOrdersSilent = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, { headers: { Authorization: 'Bearer ' + adminToken } });
      if (res.ok) {
        const data = await res.json();
        if (orderCountRef.current !== null && data.length > orderCountRef.current) {
          setNewOrderAlert(true);
          try { new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAA...').play(); } catch {}
        }
        orderCountRef.current = data.length;
      }
    } catch (err) { console.error(err); }
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    navigate('/super-admin');
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`${API_URL}/products/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert('Delete failed: ' + (err.message || res.status));
          return;
        }
        fetchProducts(true);
      } catch (err) {
        console.error('Failed to delete product', err);
        alert('Network error: Could not delete product.');
      }
    }
  };

  const handleSaveEditProduct = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const cleanedProduct = {
        ...editingProduct,
        images: editingProduct.images.filter(img => img.trim() !== '')
      };

      const res = await fetch(`${API_URL}/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(cleanedProduct)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Update failed: ' + (err.message || res.status));
        return;
      }
      setEditingProduct(null);
      fetchProducts(true);
    } catch (err) {
      console.error('Failed to update product', err);
      alert('Network error: Could not update product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const cleanedProduct = {
        ...newProduct,
        images: newProduct.images.filter(img => img.trim() !== '')
      };

      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(cleanedProduct)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Add failed: ' + (err.message || res.status));
        return;
      }
      setAddingProduct(false);
      setNewProduct({
        title: '',
        price: '',
        actualPrice: '',
        images: [''],
        video: '',
        description: ''
      });
      fetchProducts(true);
    } catch (err) {
      console.error('Failed to add product', err);
      alert('Network error: Could not add product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (index, value, isEditing) => {
    if (isEditing) {
      const updatedImages = [...editingProduct.images];
      updatedImages[index] = value;
      setEditingProduct({ ...editingProduct, images: updatedImages });
    } else {
      const updatedImages = [...newProduct.images];
      updatedImages[index] = value;
      setNewProduct({ ...newProduct, images: updatedImages });
    }
  };

  const addImageField = (isEditing) => {
    if (isEditing) {
      setEditingProduct({ ...editingProduct, images: [...editingProduct.images, ''] });
    } else {
      setNewProduct({ ...newProduct, images: [...newProduct.images, ''] });
    }
  };

  const removeImageField = (index, isEditing) => {
    if (isEditing) {
      const updatedImages = editingProduct.images.filter((_, i) => i !== index);
      setEditingProduct({ ...editingProduct, images: updatedImages });
    } else {
      const updatedImages = newProduct.images.filter((_, i) => i !== index);
      setNewProduct({ ...newProduct, images: updatedImages });
    }
  };

  const handleFileUpload = (e, index, isEditing) => {
    const file = e.target.files[0];
    if (file) {
      // Create a blob URL to load into an image element
      const blobUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        // Revoke the blob URL
        URL.revokeObjectURL(blobUrl);
        
        // Calculate new dimensions (max 800px)
        const MAX_DIM = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress as JPEG with 0.7 quality (drastically reduces base64 size)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        handleImageChange(index, compressedBase64, isEditing);
      };
      img.src = blobUrl;
    }
  };

  const triggerFileInput = (index, isEditing) => {
    const key = `${isEditing ? 'edit' : 'add'}-${index}`;
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key].click();
    }
  };

  const handleVideoUpload = (e, isEditing) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEditing) {
          setEditingProduct({ ...editingProduct, video: reader.result });
        } else {
          setNewProduct({ ...newProduct, video: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerVideoInput = (isEditing) => {
    const key = `${isEditing ? 'edit' : 'add'}-video`;
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key].click();
    }
  };

  if (!adminToken) return null;
  if (isSubAdmin && !permissions.includes('products')) return (
    <div className="glass-panel" style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h2>You do not have permission to view products.</h2>
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
            <button onClick={() => navigate('/super-admin/add-admin')} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <UserPlus size={20} /> Add Admin
            </button>
          )}

          {(!isSubAdmin || permissions.includes('products')) && (
            <button style={{ background: 'var(--primary)', color: 'black', border: 'none', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
              <Package size={20} /> Products
            </button>
          )}
          
          {(!isSubAdmin || permissions.includes('orders')) && (
            <button onClick={() => navigate(isSubAdmin ? '/admin/orders' : '/super-admin/orders')} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <ShoppingBag size={20} /> Orders
            </button>
          )}

          {(!isSubAdmin || permissions.includes('chat')) && (
            <button onClick={() => navigate(isSubAdmin ? '/admin/chat' : '/super-admin/chat')} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <MessageCircle size={20} /> Chat
            </button>
          )}

          {(!isSubAdmin || permissions.includes('helpline')) && (
            <button onClick={() => navigate(isSubAdmin ? '/admin/chat?filter=helpline' : '/super-admin/chat?filter=helpline')} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <HelpCircle size={20} /> Help Chat
            </button>
          )}
        </div>
        
        <button onClick={handleAdminLogout} style={{ background: 'rgba(255, 71, 87, 0.1)', color: '#ff4757', border: '1px solid rgba(255, 71, 87, 0.3)', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 71, 87, 0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 71, 87, 0.1)'}>
          <LogOut size={20} /> Logout
        </button>
      </div>
      <div className="admin-sidebar-overlay" onClick={() => setMobileMenuOpen(false)}></div>

      {/* Main Content */}
      <div className="admin-main">
        
        {newOrderAlert && (
          <div onClick={() => setNewOrderAlert(false)} style={{ cursor: 'pointer', marginBottom: '20px', padding: '14px 20px', background: 'rgba(49,205,106,0.15)', border: '1px solid rgba(49,205,106,0.5)', borderRadius: '12px', color: '#31cd6a', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={18} /> New order received! Click to view.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 className="section-title" style={{ margin: 0 }}>Manage Products</h1>
          <button onClick={() => {
            setNewProduct({
              title: '',
              price: '',
              actualPrice: '',
              images: [''],
              video: '',
              description: ''
            });
            setAddingProduct(true);
          }} className="btn-primary" style={{ padding: '10px 20px', fontSize: '15px' }}>+ Add New Product</button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
          <table style={{ width: '100%', minWidth: isMobile ? '100%' : '520px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.1)' }}>
                <th style={{ padding: isMobile ? '8px 10px' : '15px', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px' }}>Image</th>
                <th style={{ padding: isMobile ? '8px 10px' : '15px', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px' }}>Title</th>
                <th style={{ padding: isMobile ? '8px 10px' : '15px', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px' }}>{isMobile ? 'Price' : 'Price & Discount'}</th>
                <th style={{ padding: isMobile ? '8px 10px' : '15px', fontWeight: 'bold', textAlign: 'right', fontSize: isMobile ? '12px' : '14px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const actual = product.actualPrice || 1500;
                const discount = Math.round(((actual - product.price) / actual) * 100);
                const mainImage = (product.images && product.images.length > 0) ? product.images[0] : (product.image || '');
                
                return (
                <tr key={product.id} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <td style={{ padding: isMobile ? '8px 10px' : '15px' }}><img src={mainImage} alt={product.title} style={{ width: isMobile ? '36px' : '50px', height: isMobile ? '36px' : '50px', objectFit: 'cover', borderRadius: '8px' }} /></td>
                  <td style={{ padding: isMobile ? '8px 10px' : '15px', maxWidth: isMobile ? '100px' : '250px' }}>
                    <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: isMobile ? '12px' : '14px' }}>{product.title}</div>
                    {!isMobile && <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.description}</div>}
                  </td>
                  <td style={{ padding: isMobile ? '8px 10px' : '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px' }}>Rs. {product.price}</span>
                      {!isMobile && discount > 0 && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>Rs. {actual}</span>
                      )}
                      {!isMobile && discount > 0 && (
                        <span style={{ background: 'rgba(49, 205, 106, 0.2)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{discount}% OFF</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: isMobile ? '8px 10px' : '15px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '6px', alignItems: 'flex-end' }}>
                    <button onClick={() => setEditingProduct({
                        ...product, 
                        actualPrice: product.actualPrice || 1500, 
                        description: product.description || 'Experience the ultimate care for your hair with MOR Multi Recover Hair Oil. Formulated with a blend of premium natural oils, this lightweight, non-greasy formula penetrates deep into the roots to strengthen, nourish, and restore your hair\'s natural shine. Perfect for reducing hair fall, repairing split ends, and promoting healthy growth.',
                        images: (product.images && product.images.length > 0) ? product.images : (product.image ? [product.image] : ['']),
                        video: product.video || ''
                      })} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: isMobile ? '4px 8px' : '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: isMobile ? '11px' : '13px', whiteSpace: 'nowrap' }}>Edit</button>
                    <button onClick={() => handleDeleteProduct(product.id)} style={{ background: 'rgba(255, 71, 87, 0.2)', color: '#ff4757', border: 'none', padding: isMobile ? '4px 8px' : '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: isMobile ? '11px' : '13px', whiteSpace: 'nowrap' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              )})}
              {products.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No products available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '100vw', height: '100vh', borderRadius: '0', padding: isMobile ? '20px 15px' : '40px', boxSizing: 'border-box', overflowY: 'auto' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: isMobile ? '16px' : '30px' }}>
                <button type="button" onClick={() => setEditingProduct(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <ArrowLeft size={isMobile ? 22 : 28} />
                </button>
                <h2 style={{ fontSize: isMobile ? '18px' : '28px', margin: 0 }}>Edit Product</h2>
              </div>
              <form onSubmit={handleSaveEditProduct} style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: isMobile ? '13px' : '14px' }}>Title</label>
                  <input type="text" required value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} style={{ width: '100%', padding: isMobile ? '8px 10px' : '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: isMobile ? '13px' : '14px' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: isMobile ? '13px' : '14px' }}>Discount Price (Rs.)</label>
                    <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value ? parseInt(e.target.value) : ''})} style={{ width: '100%', padding: isMobile ? '8px 10px' : '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: isMobile ? '13px' : '14px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: isMobile ? '13px' : '14px' }}>Actual Price (Rs.)</label>
                    <input type="number" required value={editingProduct.actualPrice} onChange={e => setEditingProduct({...editingProduct, actualPrice: e.target.value ? parseInt(e.target.value) : ''})} style={{ width: '100%', padding: isMobile ? '8px 10px' : '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: isMobile ? '13px' : '14px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: isMobile ? '13px' : '14px' }}>Images (First is Main Image)</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {editingProduct.images.map((img, idx) => (
                      img ? <img key={idx} src={img} alt="preview" style={{ width: isMobile ? '60px' : '100px', height: isMobile ? '60px' : '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.2)' }} onError={(e) => e.target.style.display = 'none'} /> : null
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {editingProduct.images.map((img, index) => (
                      <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button type="button" onClick={() => triggerFileInput(index, true)} style={{ background: 'var(--primary)', color: 'black', border: 'none', padding: isMobile ? '8px 10px' : '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: isMobile ? '12px' : '14px' }}>
                          <Upload size={isMobile ? 14 : 18} /> {isMobile ? '' : 'Import'}
                        </button>
                        <input 
                          type="file" 
                          accept="image/*" 
                          ref={el => fileInputRefs.current[`edit-${index}`] = el}
                          onChange={e => handleFileUpload(e, index, true)} 
                          style={{ display: 'none' }} 
                        />
                        <input 
                          type="text" 
                          placeholder={`Image URL ${index + 1}`} 
                          value={img} 
                          required={index === 0}
                          onChange={e => handleImageChange(index, e.target.value, true)} 
                          style={{ flex: 1, padding: isMobile ? '8px 10px' : '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: isMobile ? '12px' : '14px' }} 
                        />
                        {editingProduct.images.length > 1 && (
                          <button type="button" onClick={() => removeImageField(index, true)} style={{ background: 'rgba(255, 71, 87, 0.2)', color: '#ff4757', border: 'none', padding: isMobile ? '8px' : '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Trash2 size={isMobile ? 16 : 20} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addImageField(true)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px dashed rgba(255,255,255,0.3)', padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '5px' }}>
                      <Plus size={20} /> Add Another Image
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: isMobile ? '13px' : '14px' }}>Video URL (Optional)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button type="button" onClick={() => triggerVideoInput(true)} style={{ background: 'var(--primary)', color: 'black', border: 'none', padding: isMobile ? '8px 10px' : '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: isMobile ? '12px' : '14px' }}>
                      <Upload size={isMobile ? 14 : 18} /> {isMobile ? '' : 'Import'}
                    </button>
                    <input 
                      type="file" 
                      accept="video/*" 
                      ref={el => fileInputRefs.current['edit-video'] = el}
                      onChange={e => handleVideoUpload(e, true)} 
                      style={{ display: 'none' }} 
                    />
                    <input type="text" placeholder="Video URL (mp4)" value={editingProduct.video || ''} onChange={e => setEditingProduct({...editingProduct, video: e.target.value})} style={{ flex: 1, padding: isMobile ? '8px 10px' : '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: isMobile ? '12px' : '14px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: isMobile ? '13px' : '14px' }}>Description</label>
                  <textarea required rows={isMobile ? "4" : "6"} value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} style={{ width: '100%', padding: isMobile ? '8px 10px' : '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', resize: 'vertical', fontSize: isMobile ? '13px' : '14px', boxSizing: 'border-box' }} />
                </div>
                
                <div style={{ display: 'flex', gap: isMobile ? '10px' : '15px', marginTop: isMobile ? '10px' : '20px' }}>
                  <button type="submit" disabled={isSaving} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: isMobile ? '10px' : '15px', fontSize: isMobile ? '14px' : '16px', opacity: isSaving ? 0.7 : 1 }}>{isSaving ? 'Saving...' : 'Save'}</button>
                  <button type="button" disabled={isSaving} onClick={() => setEditingProduct(null)} className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: isMobile ? '10px' : '15px', fontSize: isMobile ? '14px' : '16px', opacity: isSaving ? 0.7 : 1 }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {addingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '100vw', height: '100vh', borderRadius: '0', padding: '40px', boxSizing: 'border-box', overflowY: 'auto' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <button type="button" onClick={() => setAddingProduct(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <ArrowLeft size={28} />
                </button>
                <h2 style={{ fontSize: '28px', margin: 0 }}>Add New Product</h2>
              </div>
              <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Title</label>
                  <input type="text" required value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
                </div>
                
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Discount Price (Rs.)</label>
                    <input type="number" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value ? parseInt(e.target.value) : ''})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Actual Price (Rs.)</label>
                    <input type="number" required value={newProduct.actualPrice} onChange={e => setNewProduct({...newProduct, actualPrice: e.target.value ? parseInt(e.target.value) : ''})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Images (First is Main Image)</label>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
                    {newProduct.images.map((img, idx) => (
                      img ? <img key={idx} src={img} alt="preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.2)' }} onError={(e) => e.target.style.display = 'none'} /> : null
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {newProduct.images.map((img, index) => (
                      <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button type="button" onClick={() => triggerFileInput(index, false)} style={{ background: 'var(--primary)', color: 'black', border: 'none', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                          <Upload size={18} /> Import
                        </button>
                        <input 
                          type="file" 
                          accept="image/*" 
                          ref={el => fileInputRefs.current[`add-${index}`] = el}
                          onChange={e => handleFileUpload(e, index, false)} 
                          style={{ display: 'none' }} 
                        />
                        <input 
                          type="text" 
                          placeholder={`Or enter Image URL ${index + 1}`} 
                          value={img} 
                          required={index === 0}
                          onChange={e => handleImageChange(index, e.target.value, false)} 
                          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white' }} 
                        />
                        {newProduct.images.length > 1 && (
                          <button type="button" onClick={() => removeImageField(index, false)} style={{ background: 'rgba(255, 71, 87, 0.2)', color: '#ff4757', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addImageField(false)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px dashed rgba(255,255,255,0.3)', padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '5px' }}>
                      <Plus size={20} /> Add Another Image
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Video URL (Optional)</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button type="button" onClick={() => triggerVideoInput(false)} style={{ background: 'var(--primary)', color: 'black', border: 'none', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      <Upload size={18} /> Import
                    </button>
                    <input 
                      type="file" 
                      accept="video/*" 
                      ref={el => fileInputRefs.current['add-video'] = el}
                      onChange={e => handleVideoUpload(e, false)} 
                      style={{ display: 'none' }} 
                    />
                    <input type="text" placeholder="Or enter Video URL (mp4)" value={newProduct.video} onChange={e => setNewProduct({...newProduct, video: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description</label>
                  <textarea required rows="6" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', resize: 'vertical' }} />
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                  <button type="submit" disabled={isSaving} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '15px', fontSize: '16px', opacity: isSaving ? 0.7 : 1 }}>{isSaving ? 'Adding...' : 'Add Product'}</button>
                  <button type="button" disabled={isSaving} onClick={() => setAddingProduct(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '15px', fontSize: '16px', opacity: isSaving ? 0.7 : 1 }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
