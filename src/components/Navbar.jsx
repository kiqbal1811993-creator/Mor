import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ isMobileMenuOpen, setIsSearchOpen, isSearchOpen, setIsCartOpen, totalCartItems }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [previousPath, setPreviousPath] = useState('/');
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };

  const executeSearch = () => {
    if (searchText.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchText)}`);
    }
  };

  const handleCloseSearch = () => {
    setSearchText('');
    setIsSearchOpen(false);
    if (location.pathname === '/shop' && new URLSearchParams(location.search).get('search') !== null) {
      navigate(previousPath);
    }
  };

  const handleScrollTo = (id) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
    } else {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <>
      <nav className="navbar glass">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="MOR Logo" style={{ height: '48px', objectFit: 'contain' }} />
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', lineHeight: 1 }}>MOR</h2>
          </div>
        </div>

        <ul className={`nav-links ${isMobileMenuOpen ? 'mobile-dropdown-open' : ''}`}>
          <li className="desktop-only"><Link to="/" className={location.pathname === '/' ? 'text-primary active' : ''}>Home</Link></li>
          <li className="desktop-only"><Link to="/shop" className={location.pathname === '/shop' ? 'text-primary active' : ''}>Shop</Link></li>
          <li className="desktop-only"><Link to="/track-order" className={location.pathname === '/track-order' ? 'text-primary active' : ''}>Track Order</Link></li>
          <li><Link to="/about" className={location.pathname === '/about' ? 'text-primary active' : ''}>About</Link></li>
          <li><Link to="/helpline" className={location.pathname === '/helpline' ? 'text-primary active' : ''}>Helpline</Link></li>
        </ul>

        <div className="nav-actions">
          <Search size={20} style={{ cursor: 'pointer' }} onClick={() => { 
            if (!isSearchOpen && location.pathname !== '/shop') {
              setPreviousPath(location.pathname);
            }
            setIsSearchOpen(!isSearchOpen); 
          }} />
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsCartOpen(true)}>
            <ShoppingCart size={20} />
            {totalCartItems > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: '#000', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{totalCartItems}</span>
            )}
          </div>
        </div>
      </nav>

      {/* Search Bar Dropdown */}
      <div style={{
        position: 'relative',
        width: '100%',
        zIndex: 99,
        maxHeight: isSearchOpen ? '100px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: isSearchOpen ? 'auto' : 'none',
        boxSizing: 'border-box'
      }}>
        <div style={{
          padding: '20px 0',
          transform: isSearchOpen ? 'translateX(0)' : 'translateX(100%)',
          opacity: isSearchOpen ? 1 : 0,
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease'
        }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '800px', margin: '0 auto'
        }}>
          <div className="glass" style={{
            flex: 1,
            padding: '12px 20px',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search products..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleSearchSubmit}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                width: '100%',
                outline: 'none',
                fontSize: '16px'
              }}
            />
            <button onClick={handleCloseSearch} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
              <X size={18} className="hover-text-primary" />
            </button>
          </div>
          
          <button 
            onClick={executeSearch} 
            className="glass hover-scale" 
            style={{ 
              padding: '12px', 
              borderRadius: '50%', 
              border: '1px solid rgba(255,255,255,0.2)', 
              display: 'flex', 
              background: 'rgba(255,255,255,0.05)', 
              cursor: 'pointer',
              color: 'var(--primary)'
            }}
          >
            <Search size={20} />
          </button>
        </div>
      </div>
      </div>
    </>
  );
};

export default Navbar;
