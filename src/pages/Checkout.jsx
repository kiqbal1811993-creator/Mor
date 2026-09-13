import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ChevronLeft, ShoppingBag, Truck } from 'lucide-react';

const Checkout = ({ products }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => (p._id || p.id) === id);
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const location = useLocation();
  const [quantity, setQuantity] = useState(location.state?.quantity || 1);
  const [errors, setErrors] = useState({});
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Hyderabad', 'Gujranwala', 'Peshawar', 'Quetta', 'Sialkot', 'Sukkur', 'Bahawalpur', 'Sargodha', 'Gujrat', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Mardan', 'Kasur', 'Dera Ghazi Khan', 'Nawabshah', 'Sahiwal', 'Mirpur Khas', 'Okara', 'Mandi Bahauddin', 'Jacobabad', 'Jhelum', 'Khairpur', 'Dadu'];
  const filteredCities = form.city ? cities.filter(c => c.toLowerCase().includes(form.city.toLowerCase())) : cities;

  if (!product) {
    return (
      <div className="glass-panel" style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'white' }}>Product not found.</p>
      </div>
    );
  }

  const mainImage = product.images?.[0] || product.image || '';
  const total = product.price * quantity;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.phone.trim() || form.phone.trim().length < 10) errs.phone = 'Valid phone number is required';
    if (!form.city) errs.city = 'City is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    return errs;
  };

  const handleProceed = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: { name: form.name, email: form.email, phone: form.phone, city: form.city, address: form.address }, product: { id: product._id || product.id, title: product.title, price: product.price, image: mainImage }, quantity, totalAmount: total })
      });
      if (res.ok) {
        const data = await res.json();
        setOrderId(data.orderId);
        setOrderPlaced(true);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (orderPlaced) {
    return (
      <div className="glass-panel" style={{ width: '100%', minHeight: '100vh', borderRadius: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '30px', textAlign: 'center', padding: '40px', boxSizing: 'border-box' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(49, 205, 106, 0.15)', border: '2px solid rgba(49, 205, 106, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulseGreen 2s ease-in-out infinite' }}>
          <CheckCircle size={52} color="#31cd6a" strokeWidth={1.5} />
        </div>
        <div>
          <h1 style={{ margin: '0 0 12px 0', fontSize: '36px', fontWeight: '800', background: 'linear-gradient(135deg, #31cd6a, #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Order Placed!</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0 }}>Thank you, <strong style={{ color: 'white' }}>{form.name}</strong>! Your order has been received.</p>
        </div>
        <div className="glass" style={{ padding: '25px 40px', borderRadius: '16px', border: '1px solid rgba(49, 205, 106, 0.3)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Your Order ID</p>
          <p style={{ color: 'var(--primary)', fontSize: '24px', fontWeight: '800', letterSpacing: '3px', margin: 0 }}>{orderId}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '14px' }}>
          <Truck size={18} /><span>Cash on Delivery - Our team will contact you soon.</span>
        </div>
        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
          <button className="btn-outline" onClick={() => navigate('/')}>Back to Home</button>
          <button className="btn-primary" onClick={() => navigate('/shop')}>Continue Shopping</button>
        </div>
        <style>{`@keyframes pulseGreen { 0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(49,205,106,0.3)} 50%{transform:scale(1.05);box-shadow:0 0 0 15px rgba(49,205,106,0)} }`}</style>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ width: '100%', minHeight: '100vh', borderRadius: '0', padding: '0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '25px 40px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.03)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
          <ChevronLeft size={20} />
        </button>
        <ShoppingBag size={22} color="var(--primary)" />
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>Checkout</h1>
      </div>

      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', overflowY: 'auto' }}>
        <div className="checkout-left">
          <h2 style={{ margin: '0 0 30px 0', fontSize: '20px' }}>Customer Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {[{label:'Full Name',key:'name',type:'text',ph:'Enter your full name'},{label:'Email Address',key:'email',type:'email',ph:'you@example.com'},{label:'Phone Number',key:'phone',type:'tel',ph:'+92 300 0000000'}].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>{f.label}</label>
                <input type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e => { setForm(v => ({...v,[f.key]:e.target.value})); setErrors(er=>({...er,[f.key]:''})); }} style={{ width:'100%',padding:'13px 16px',borderRadius:'10px',border:errors[f.key]?'1px solid #ff4757':'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.05)',color:'white',outline:'none',fontSize:'15px',boxSizing:'border-box' }} />
                {errors[f.key] && <p style={{ color:'#ff4757',fontSize:'12px',margin:'5px 0 0' }}>{errors[f.key]}</p>}
              </div>
            ))}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>City</label>
              <input
                type="text"
                autoComplete="off"
                name="user_city"
                placeholder="Type or select your city"
                value={form.city}
                onChange={e => { setForm(v => ({ ...v, city: e.target.value })); setErrors(er => ({ ...er, city: '' })); setShowCityDropdown(true); }}
                onFocus={() => setShowCityDropdown(true)}
                onBlur={() => setShowCityDropdown(false)}
                style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: errors.city ? '1px solid #ff4757' : '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }}
              />
              {showCityDropdown && filteredCities.length > 0 && (
                <div className="glass" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, marginTop: '5px', borderRadius: '10px', maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(20, 20, 20, 0.95)', backdropFilter: 'blur(20px)' }}>
                  {filteredCities.map(c => (
                    <div 
                      key={c}
                      onMouseDown={(e) => { e.preventDefault(); setForm(v => ({ ...v, city: c })); setErrors(er => ({ ...er, city: '' })); setShowCityDropdown(false); }}
                      style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', fontSize: '14px' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
              {errors.city && <p style={{ color: '#ff4757', fontSize: '12px', margin: '5px 0 0 0' }}>{errors.city}</p>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Complete Address</label>
              <textarea rows={3} placeholder="Address" value={form.address} onChange={e => { setForm(v=>({...v,address:e.target.value})); setErrors(er=>({...er,address:''})); }} style={{ width:'100%',padding:'13px 16px',borderRadius:'10px',border:errors.address?'1px solid #ff4757':'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.05)',color:'white',outline:'none',fontSize:'15px',resize:'vertical',boxSizing:'border-box' }} />
              {errors.address && <p style={{ color:'#ff4757',fontSize:'12px',margin:'5px 0 0' }}>{errors.address}</p>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '14px' }}>Delivery Option</label>
              <div style={{ display:'flex',alignItems:'center',gap:'14px',padding:'16px',borderRadius:'10px',border:'1px solid rgba(49,205,106,0.5)',background:'rgba(49,205,106,0.08)' }}>
                <Truck size={22} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight:'700',color:'var(--primary)',fontSize:'15px' }}>Cash on Delivery</div>
                  <div style={{ fontSize:'12px',color:'var(--text-muted)',marginTop:'2px' }}>Pay when you receive your order</div>
                </div>
                <div style={{ marginLeft:'auto',width:'18px',height:'18px',borderRadius:'50%',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <div style={{ width:'8px',height:'8px',borderRadius:'50%',background:'black' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="checkout-right">
          <h2 style={{ margin: '0 0 30px 0', fontSize: '20px' }}>Order Summary</h2>
          <div className="glass" style={{ borderRadius:'14px',overflow:'hidden',marginBottom:'25px' }}>
            {mainImage && <img src={mainImage} alt={product.title} style={{ width:'100%',height:'200px',objectFit:'cover' }} />}
            <div style={{ padding: '20px' }}>
              <h3 style={{ margin:'0 0 8px',fontSize:'17px',fontWeight:'700' }}>{product.title}</h3>
              <p style={{ margin:'0 0 16px',color:'var(--primary)',fontSize:'22px',fontWeight:'800' }}>Rs. {product.price}</p>
              <div style={{ display:'flex',alignItems:'center',gap:'15px' }}>
                <span style={{ color:'var(--text-muted)',fontSize:'14px' }}>Qty:</span>
                <div className="glass" style={{ display:'flex',alignItems:'center',borderRadius:'30px',overflow:'hidden' }}>
                  <button onClick={() => setQuantity(q=>Math.max(1,q-1))} style={{ background:'none',border:'none',color:'white',fontSize:'20px',cursor:'pointer',padding:'5px 14px' }}>-</button>
                  <span style={{ fontWeight:'bold',padding:'0 8px',minWidth:'24px',textAlign:'center' }}>{quantity}</span>
                  <button onClick={() => setQuantity(q=>q+1)} style={{ background:'none',border:'none',color:'white',fontSize:'20px',cursor:'pointer',padding:'5px 14px' }}>+</button>
                </div>
              </div>
            </div>
          </div>
          <div className="glass" style={{ borderRadius:'12px',padding:'20px',marginBottom:'25px' }}>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'12px',color:'var(--text-muted)' }}><span>Subtotal ({quantity} item{quantity>1?'s':''})</span><span>Rs. {total}</span></div>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'12px',color:'var(--text-muted)' }}><span>Delivery</span><span style={{ color:'var(--primary)' }}>Free</span></div>
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)',paddingTop:'12px',display:'flex',justifyContent:'space-between',fontWeight:'800',fontSize:'18px' }}><span>Total</span><span style={{ color:'var(--primary)' }}>Rs. {total}</span></div>
          </div>
          <div style={{ display:'flex',gap:'12px',justifyContent:'flex-end' }}>
            <button onClick={() => navigate(-1)} className="btn-outline" style={{ padding:'13px 24px',fontSize:'15px' }}>Cancel</button>
            <button onClick={handleProceed} disabled={loading} className="btn-primary" style={{ padding:'13px 30px',fontSize:'15px',opacity:loading?0.7:1,minWidth:'130px',justifyContent:'center' }}>{loading?'Placing...':'Proceed'}</button>
          </div>
        </div>
      </div>
      <style>{`
        .checkout-left { flex: 1 1 400px; padding: 40px; border-right: 1px solid rgba(255,255,255,0.08); }
        .checkout-right { flex: 1 1 300px; padding: 40px; }
        @media (max-width: 768px) {
          .checkout-left { padding: 20px; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .checkout-right { padding: 20px; }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
