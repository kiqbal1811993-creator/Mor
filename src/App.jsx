import { API_URL } from './config';
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import CustomerChat from './components/CustomerChat';

import Home from './pages/Home';
import Shop from './pages/Shop';
import About from './pages/About';
import ProductDetail from './pages/ProductDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminChat from './pages/AdminChat';
import AdminOrders from './pages/AdminOrders';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import HelplineChat from './pages/HelplineChat';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import ReturnPolicy from './pages/ReturnPolicy';
import AddAdmin from './pages/AddAdmin';
import SubAdminLogin from './pages/SubAdminLogin';
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

function App() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatProduct, setChatProduct] = useState(null);
  
  const [adminToken, setAdminToken] = useState(() => {
    return sessionStorage.getItem('adminToken') || null;
  });

  const [subAdminToken, setSubAdminToken] = useState(() => {
    return sessionStorage.getItem('subAdminToken') || null;
  });
  const [subAdminPermissions, setSubAdminPermissions] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('subAdminPermissions') || '[]'); } catch { return []; }
  });

  const fetchProducts = () => {
    setIsLoading(true);
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(err => console.error('Error fetching products:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (adminToken) {
      sessionStorage.setItem('adminToken', adminToken);
    } else {
      sessionStorage.removeItem('adminToken');
    }
  }, [adminToken]);

  useEffect(() => {
    if (subAdminToken) {
      sessionStorage.setItem('subAdminToken', subAdminToken);
    } else {
      sessionStorage.removeItem('subAdminToken');
    }
    sessionStorage.setItem('subAdminPermissions', JSON.stringify(subAdminPermissions));
  }, [subAdminToken, subAdminPermissions]);

  const handleUpdateCartQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      setCartItems(prev => prev.filter(item => item.id !== id));
      return;
    }
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + product.quantity } : item);
      }
      return [...prev, product];
    });
    setIsCartOpen(true);
  };
  
  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  return (
    <div className="app-container">
      <ScrollToTop />
      {/* Background shapes */}
      <div className="background-shape shape-1"></div>
      <div className="background-shape shape-2"></div>
      <div className="background-shape shape-3"></div>

      <Routes>
        <Route path="/super-admin/*" element={null} />
        <Route path="/admin/*" element={null} />
        <Route path="/product/*" element={null} />
        <Route path="/checkout/*" element={null} />
        <Route path="/track-order/*" element={null} />
        <Route path="/helpline/*" element={null} />
        <Route path="*" element={
          <div className="container">
            <Navbar 
              isMobileMenuOpen={isMobileMenuOpen} 
              setIsSearchOpen={setIsSearchOpen} 
              isSearchOpen={isSearchOpen} 
              setIsCartOpen={setIsCartOpen} 
              totalCartItems={totalCartItems} 
            />
          </div>
        }/>
      </Routes>

      <div className="container">
        <Routes>
          <Route path="/" element={<Home products={products} handleAddToCart={handleAddToCart} onOpenChat={(p) => { setChatProduct(p); setIsChatOpen(true); }} />} />
          <Route path="/shop" element={<Shop products={products} handleAddToCart={handleAddToCart} onOpenChat={(p) => { setChatProduct(p); setIsChatOpen(true); }} />} />
          <Route path="/super-admin" element={<AdminLogin setAdminToken={setAdminToken} />} />
        </Routes>
      </div>

      <Routes>
        <Route path="/product/:id" element={<ProductDetail products={products} isLoading={isLoading} handleAddToCart={handleAddToCart} onOpenChat={(p) => { setChatProduct(p); setIsChatOpen(true); }} />} />
        <Route path="/checkout/:id" element={<Checkout products={products} />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/helpline" element={<HelplineChat />} />
        <Route path="/super-admin/dashboard" element={
          <AdminDashboard 
            adminToken={adminToken} 
            setAdminToken={setAdminToken} 
            products={products} 
            fetchProducts={fetchProducts} 
          />
        } />
        <Route path="/super-admin/add-admin" element={<AddAdmin adminToken={adminToken} setAdminToken={setAdminToken} />} />
        <Route path="/super-admin/chat" element={<AdminChat adminToken={adminToken} />} />
        <Route path="/super-admin/orders" element={<AdminOrders adminToken={adminToken} setAdminToken={setAdminToken} />} />
        {/* Sub-Admin Routes */}
        <Route path="/admin" element={<SubAdminLogin setSubAdminToken={setSubAdminToken} setSubAdminPermissions={setSubAdminPermissions} />} />
        <Route path="/admin/dashboard" element={
          <AdminDashboard
            adminToken={subAdminToken}
            setAdminToken={setSubAdminToken}
            products={products}
            fetchProducts={fetchProducts}
            isSubAdmin={true}
            permissions={subAdminPermissions}
          />
        } />
        <Route path="/admin/chat" element={
          <AdminChat 
            adminToken={subAdminToken} 
            isSubAdmin={true} 
            permissions={subAdminPermissions}
          />
        } />
        <Route path="/admin/orders" element={
          <AdminOrders 
            adminToken={subAdminToken} 
            setAdminToken={setSubAdminToken}
            isSubAdmin={true} 
            permissions={subAdminPermissions}
          />
        } />
      </Routes>

      <Routes>
        <Route path="/super-admin/*" element={null} />
        <Route path="/admin/*" element={null} />
        <Route path="/checkout/*" element={null} />
        <Route path="*" element={<Footer />} />
      </Routes>

      <CartSidebar 
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cartItems={cartItems}
        setCartItems={setCartItems}
        handleUpdateCartQuantity={handleUpdateCartQuantity}
        totalCartPrice={totalCartPrice}
      />

      <CustomerChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} product={chatProduct} setChatProduct={setChatProduct} />
      
      {isLoading && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '50px', height: '50px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <div style={{ color: 'white', fontWeight: 'bold', letterSpacing: '2px' }}>LOADING</div>
          </div>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}
    </div>
  );
}

export default App;
