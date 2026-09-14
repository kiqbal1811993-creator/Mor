import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Package, ShoppingBag, MessageCircle, HelpCircle, Key, LogOut } from 'lucide-react';
import ChangeCredentialsModal from './ChangeCredentialsModal';

const AdminSidebar = ({
  activePage,
  isSubAdmin,
  permissions = [],
  adminToken,
  setAdminToken,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const navigate = useNavigate();
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

  const handleLogout = () => {
    if (setAdminToken) setAdminToken(null);
    navigate(isSubAdmin ? '/admin' : '/super-admin');
  };

  const getBtnStyle = (pageName) => {
    const isActive = activePage === pageName;
    if (isActive) {
      return {
        background: 'var(--primary, #4ade80)',
        color: 'black',
        border: 'none',
        padding: '12px 15px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontWeight: 'bold',
        width: '100%',
        textAlign: 'left'
      };
    }
    return {
      background: 'transparent',
      color: 'white',
      border: '1px solid rgba(255,255,255,0.2)',
      padding: '12px 15px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      transition: 'background 0.2s',
      width: '100%',
      textAlign: 'left'
    };
  };

  return (
    <>
      <div className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <h2 style={{ margin: '0 0 40px 0', fontSize: '22px', textAlign: 'center' }}>
          {isSubAdmin ? 'Admin Panel' : 'Super Admin'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
          {!isSubAdmin && (
            <button
              onClick={() => {
                navigate('/super-admin/add-admin');
                if (setMobileMenuOpen) setMobileMenuOpen(false);
              }}
              style={getBtnStyle('add-admin')}
              onMouseEnter={e => {
                if (activePage !== 'add-admin') e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={e => {
                if (activePage !== 'add-admin') e.currentTarget.style.background = 'transparent';
              }}
            >
              <UserPlus size={20} /> Add Admin
            </button>
          )}

          {(!isSubAdmin || permissions.includes('products')) && (
            <button
              onClick={() => {
                navigate(isSubAdmin ? '/admin/dashboard' : '/super-admin/dashboard');
                if (setMobileMenuOpen) setMobileMenuOpen(false);
              }}
              style={getBtnStyle('products')}
              onMouseEnter={e => {
                if (activePage !== 'products') e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={e => {
                if (activePage !== 'products') e.currentTarget.style.background = 'transparent';
              }}
            >
              <Package size={20} /> Products
            </button>
          )}

          {(!isSubAdmin || permissions.includes('orders')) && (
            <button
              onClick={() => {
                navigate(isSubAdmin ? '/admin/orders' : '/super-admin/orders');
                if (setMobileMenuOpen) setMobileMenuOpen(false);
              }}
              style={getBtnStyle('orders')}
              onMouseEnter={e => {
                if (activePage !== 'orders') e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={e => {
                if (activePage !== 'orders') e.currentTarget.style.background = 'transparent';
              }}
            >
              <ShoppingBag size={20} /> Orders
            </button>
          )}

          {(!isSubAdmin || permissions.includes('chat')) && (
            <button
              onClick={() => {
                navigate(isSubAdmin ? '/admin/chat' : '/super-admin/chat');
                if (setMobileMenuOpen) setMobileMenuOpen(false);
              }}
              style={getBtnStyle('chat')}
              onMouseEnter={e => {
                if (activePage !== 'chat') e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={e => {
                if (activePage !== 'chat') e.currentTarget.style.background = 'transparent';
              }}
            >
              <MessageCircle size={20} /> Chat
            </button>
          )}

          {(!isSubAdmin || permissions.includes('helpline')) && (
            <button
              onClick={() => {
                navigate(isSubAdmin ? '/admin/chat?filter=helpline' : '/super-admin/chat?filter=helpline');
                if (setMobileMenuOpen) setMobileMenuOpen(false);
              }}
              style={getBtnStyle('helpline')}
              onMouseEnter={e => {
                if (activePage !== 'helpline') e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={e => {
                if (activePage !== 'helpline') e.currentTarget.style.background = 'transparent';
              }}
            >
              <HelpCircle size={20} /> Help Chat
            </button>
          )}

          {/* Change Email / Password Sidebar Option */}
          <button
            onClick={() => {
              setIsCredentialsModalOpen(true);
              if (setMobileMenuOpen) setMobileMenuOpen(false);
            }}
            style={{
              background: 'transparent',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '12px 15px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'background 0.2s',
              width: '100%',
              textAlign: 'left'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Key size={20} color="var(--primary, #4ade80)" /> Change Email / Pass
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255, 71, 87, 0.1)',
            color: '#ff4757',
            border: '1px solid rgba(255, 71, 87, 0.3)',
            padding: '12px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'background 0.2s',
            marginTop: '20px',
            width: '100%',
            textAlign: 'left'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 71, 87, 0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 71, 87, 0.1)'}
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Change Credentials Modal */}
      <ChangeCredentialsModal
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
        adminToken={adminToken}
        isSubAdmin={isSubAdmin}
      />
    </>
  );
};

export default AdminSidebar;
