/* ===================================================
   VOYAGER – JavaScript Application
   JWT-based auth + SPA routing + API integration
   =================================================== */

const API = 'http://localhost:3000/api';

// ─── JWT Helpers ──────────────────────────────────────
function getToken()        { return localStorage.getItem('voy_token'); }
function setToken(token)   { localStorage.setItem('voy_token', token); }
function clearToken()      { localStorage.removeItem('voy_token'); }
function authHeader()      {
  const t = getToken();
  return t ? { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' }
           :                                   { 'Content-Type': 'application/json' };
}

// Wrapper so every fetch automatically sends the JWT
async function apiFetch(path, options = {}) {
  options.headers = { ...authHeader(), ...(options.headers || {}) };
  return fetch(`${API}${path}`, options);
}

// ─── Router ──────────────────────────────────────────
const pages    = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');

function navigate(pageId) {
  pages.forEach(p => p.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));
  const page = document.getElementById(`page-${pageId}`);
  if (page) page.classList.add('active');
  const link = document.querySelector(`.nav-link[data-page="${pageId}"]`);
  if (link) link.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navLinks.forEach(link => {
  link.addEventListener('click', e => { e.preventDefault(); navigate(link.dataset.page); });
});
document.getElementById('logo-link').addEventListener('click', e => { e.preventDefault(); navigate('home'); });
document.getElementById('goto-explore')?.addEventListener('click', () => navigate('flights'));

// ─── Navbar scroll effect ─────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ─── Hamburger menu ──────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const navLinksEl = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  const open = navLinksEl.style.display === 'flex';
  navLinksEl.style.display         = open ? 'none' : 'flex';
  navLinksEl.style.flexDirection   = 'column';
  navLinksEl.style.position        = 'absolute';
  navLinksEl.style.top             = '70px';
  navLinksEl.style.left            = '0';
  navLinksEl.style.right           = '0';
  navLinksEl.style.background      = 'rgba(8,14,29,0.98)';
  navLinksEl.style.padding         = '20px';
  navLinksEl.style.borderBottom    = '1px solid rgba(255,255,255,0.08)';
});

// ─── Hero Particles ──────────────────────────────────
(function initParticles() {
  const container = document.getElementById('hero-particles');
  const colours   = ['#6366f1','#8b5cf6','#a855f7','#f59e0b','#10b981','#3b82f6'];
  for (let i = 0; i < 28; i++) {
    const p    = document.createElement('div');
    p.className = 'particle';
    const size  = Math.random() * 5 + 2;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      background:${colours[Math.floor(Math.random()*colours.length)]};
      animation-duration:${8+Math.random()*12}s;
      animation-delay:${-Math.random()*15}s;
      filter:blur(${Math.random()>0.6?1:0}px);
    `;
    container.appendChild(p);
  }
})();

// ─── Counter animation ───────────────────────────────
function animateCounter(el, target) {
  let start = 0;
  const step = ts => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / 1800, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent  = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-number').forEach(el => animateCounter(el, +el.dataset.target));
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
const statsSection = document.querySelector('.stats-section');
if (statsSection) observer.observe(statsSection);

// ─── Toast ───────────────────────────────────────────
function toast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const t     = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(t);
  setTimeout(() => {
    t.style.animation = 'slideOutToast 0.3s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

// ─── Modal ───────────────────────────────────────────
const overlay      = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');

function openModal(html)  { modalContent.innerHTML = html; overlay.classList.add('active'); }
function closeModal()     { overlay.classList.remove('active'); }

document.getElementById('modal-close').addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

// ─── Auth ─────────────────────────────────────────────
let currentUser = null;

function loginModal() {
  openModal(`
    <h2 class="modal-title">Welcome Back ✈</h2>
    <p class="modal-subtitle">Sign in to manage your bookings</p>
    <form class="modal-form" id="login-form">
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" type="email" id="li-email" placeholder="you@example.com" required />
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input class="form-input" type="password" id="li-pass" placeholder="Enter password" required />
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:14px;">Sign In</button>
    </form>
    <div class="modal-footer">Don't have an account? <a id="switch-register">Create one</a></div>
  `);
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('switch-register').addEventListener('click', registerModal);
}

function registerModal() {
  openModal(`
    <h2 class="modal-title">Join Voyager 🚀</h2>
    <p class="modal-subtitle">Create your free account in seconds</p>
    <form class="modal-form" id="register-form">
      <div class="form-group">
        <label class="form-label">Full Name</label>
        <input class="form-input" type="text" id="rg-name" placeholder="John Doe" required />
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" type="email" id="rg-email" placeholder="you@example.com" required />
      </div>
      <div class="form-group">
        <label class="form-label">Phone</label>
        <input class="form-input" type="tel" id="rg-phone" placeholder="+91 98765 43210" />
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input class="form-input" type="password" id="rg-pass" placeholder="Create password" required />
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:14px;">Create Account</button>
    </form>
    <div class="modal-footer">Already have an account? <a id="switch-login">Sign in</a></div>
  `);
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('switch-login').addEventListener('click', loginModal);
}

document.getElementById('btn-login').addEventListener('click', loginModal);
document.getElementById('btn-register').addEventListener('click', registerModal);

async function handleLogin(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.textContent = 'Signing in…'; btn.disabled = true;
  try {
    const res  = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: document.getElementById('li-email').value, password: document.getElementById('li-pass').value })
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      setLoggedIn(data.user);
      closeModal();
      toast(`Welcome back, ${data.user.name}! ✈`, 'success');
    } else {
      toast(data.message || 'Login failed', 'error');
      btn.textContent = 'Sign In'; btn.disabled = false;
    }
  } catch {
    toast('Could not connect to server', 'error');
    btn.textContent = 'Sign In'; btn.disabled = false;
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.textContent = 'Creating…'; btn.disabled = true;
  try {
    const res  = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name:     document.getElementById('rg-name').value,
        email:    document.getElementById('rg-email').value,
        phone:    document.getElementById('rg-phone').value,
        password: document.getElementById('rg-pass').value
      })
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      setLoggedIn(data.user);
      closeModal();
      toast('Account created! Welcome aboard 🎉', 'success');
    } else {
      toast(data.message || 'Registration failed', 'error');
      btn.textContent = 'Create Account'; btn.disabled = false;
    }
  } catch {
    toast('Could not connect to server', 'error');
    btn.textContent = 'Create Account'; btn.disabled = false;
  }
}

function setLoggedIn(user) {
  currentUser = user;
  document.getElementById('btn-login').textContent = user.name.split(' ')[0];
  document.getElementById('btn-login').onclick      = showProfileMenu;
  document.getElementById('btn-register').textContent = 'Log Out';
  document.getElementById('btn-register').onclick     = handleLogout;
}

function handleLogout() {
  clearToken();
  currentUser = null;
  location.reload();
}

function showProfileMenu() {
  if (!currentUser) return;
  openModal(`
    <h2 class="modal-title">👤 My Profile</h2>
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:12px;">
      <div class="form-group">
        <label class="form-label">Name</label>
        <div style="padding:12px 16px;background:rgba(255,255,255,0.04);border-radius:12px;font-size:15px;">${currentUser.name}</div>
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <div style="padding:12px 16px;background:rgba(255,255,255,0.04);border-radius:12px;font-size:15px;">${currentUser.email}</div>
      </div>
      <div class="form-group">
        <label class="form-label">Role</label>
        <div><span class="badge badge-${currentUser.role}">${currentUser.role}</span></div>
      </div>
      <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:8px;" onclick="closeModal();navigate('bookings');">View My Bookings</button>
    </div>
  `);
}

// ─── Hero Search ─────────────────────────────────────
document.getElementById('tab-flight').addEventListener('click', () => {
  document.getElementById('tab-flight').classList.add('active');
  document.getElementById('tab-hotel').classList.remove('active');
  document.getElementById('search-flight-form').classList.remove('hidden');
  document.getElementById('search-hotel-form').classList.add('hidden');
});
document.getElementById('tab-hotel').addEventListener('click', () => {
  document.getElementById('tab-hotel').classList.add('active');
  document.getElementById('tab-flight').classList.remove('active');
  document.getElementById('search-hotel-form').classList.remove('hidden');
  document.getElementById('search-flight-form').classList.add('hidden');
});
document.getElementById('hero-search-flight').addEventListener('click', () => {
  document.getElementById('fl-origin').value = document.getElementById('hero-origin').value;
  document.getElementById('fl-dest').value   = document.getElementById('hero-destination').value;
  navigate('flights'); loadFlights();
});
document.getElementById('hero-search-hotel').addEventListener('click', () => {
  document.getElementById('ht-city').value = document.getElementById('hero-hotel-city').value;
  navigate('hotels'); loadHotels();
});

// ─── FLIGHTS ─────────────────────────────────────────
document.getElementById('btn-search-flights').addEventListener('click', loadFlights);

async function loadFlights() {
  const params = new URLSearchParams();
  const origin = document.getElementById('fl-origin').value;
  const dest   = document.getElementById('fl-dest').value;
  const cls    = document.getElementById('fl-class').value;
  const price  = document.getElementById('fl-price').value;
  if (origin) params.append('origin', origin);
  if (dest)   params.append('destination', dest);
  if (cls)    params.append('class', cls);
  if (price)  params.append('maxPrice', price);

  const container = document.getElementById('flights-results');
  container.innerHTML = `<div class="skeleton" style="height:120px"></div><div class="skeleton" style="height:120px;margin-top:16px"></div><div class="skeleton" style="height:120px;margin-top:16px"></div>`;

  try {
    const res  = await apiFetch(`/flights?${params}`);
    const data = await res.json();
    renderFlights(data.flights || data);
  } catch {
    toast('Failed to load flights. Make sure the server is running.', 'error');
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Server Unreachable</h3><p>Make sure your Node.js server is running on port 3000.</p></div>`;
  }
}

function renderFlights(flights) {
  const container = document.getElementById('flights-results');
  if (!flights || flights.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">✈</div><h3>No Flights Found</h3><p>Try changing your search filters or search all flights.</p></div>`;
    return;
  }
  container.innerHTML = flights.map(f => {
    const dep = new Date(f.departureTime);
    const arr = new Date(f.arrivalTime);
    const dur = Math.round((arr - dep) / 60000);
    const h   = Math.floor(dur / 60), m = dur % 60;
    return `
    <div class="flight-card">
      <div class="flight-airline">
        <div class="airline-logo">✈</div>
        <div class="airline-name">${f.airline}</div>
        <div class="flight-class">${f.class}</div>
      </div>
      <div class="flight-route">
        <div class="route-point">
          <div class="route-code">${f.origin.substring(0,3).toUpperCase()}</div>
          <div class="route-city">${f.origin}</div>
          <div class="route-time">${dep.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
        </div>
        <div class="route-arrow">
          <div class="arrow-line"></div>
          <div class="arrow-duration">${h}h ${m}m</div>
        </div>
        <div class="route-point">
          <div class="route-code">${f.destination.substring(0,3).toUpperCase()}</div>
          <div class="route-city">${f.destination}</div>
          <div class="route-time">${arr.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
        </div>
      </div>
      <div class="flight-info">
        <div class="flight-price">₹${f.price.toLocaleString()}</div>
        <div class="flight-seats">🪑 ${f.availableSeats} seats left</div>
        <div style="display:flex;gap:6px;margin-top:4px;">
          <span class="badge badge-${f.availableSeats>0?'confirmed':'cancelled'}">${f.availableSeats>0?'Available':'Full'}</span>
        </div>
        <button class="btn btn-primary btn-sm" onclick='bookFlight(${JSON.stringify(f)})'>Book Now</button>
      </div>
    </div>`;
  }).join('');
}

function bookFlight(flight) {
  if (!currentUser) { loginModal(); toast('Please sign in to book a flight', 'info'); return; }
  openModal(`
    <h2 class="modal-title">✈ Book Flight</h2>
    <p class="modal-subtitle">${flight.airline} · ${flight.flightNumber} · ${flight.origin} → ${flight.destination}</p>
    <div class="booking-steps">
      <div class="step active" id="step-dot-1">1</div>
      <div class="step-line"></div>
      <div class="step" id="step-dot-2">2</div>
    </div>
    <form class="modal-form" id="book-flight-form">
      <div class="form-group">
        <label class="form-label">Passengers</label>
        <input class="form-input" type="number" id="bf-passengers" min="1" max="${flight.availableSeats}" value="1" required />
      </div>
      <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:16px;font-size:14px;color:var(--text-secondary);">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>Price per passenger</span><span style="color:var(--text-primary);font-weight:600;">₹${flight.price.toLocaleString()}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>Flight</span><span style="color:var(--text-primary);">${flight.flightNumber} · ${flight.class}</span></div>
        <div id="bf-total" style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;color:#fbbf24;border-top:1px solid rgba(255,255,255,0.08);padding-top:10px;margin-top:6px;"><span>Total</span><span>₹${flight.price.toLocaleString()}</span></div>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:14px;">Continue to Payment →</button>
    </form>
  `);
  const passInput = document.getElementById('bf-passengers');
  passInput.addEventListener('input', () => {
    const total = (parseInt(passInput.value)||1) * flight.price;
    document.getElementById('bf-total').innerHTML = `<span>Total</span><span>₹${total.toLocaleString()}</span>`;
  });
  document.getElementById('book-flight-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button'); btn.textContent = 'Creating booking…'; btn.disabled = true;
    try {
      const res  = await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({ bookingType: 'flight', flightId: flight._id, passengers: parseInt(passInput.value)||1 })
      });
      const data = await res.json();
      if (res.ok) {
        const total = (parseInt(passInput.value)||1) * flight.price;
        showPaymentStep(data.booking._id, total, `${flight.airline} ${flight.flightNumber}`);
      } else {
        toast(data.message || 'Booking failed', 'error');
        btn.textContent = 'Continue to Payment →'; btn.disabled = false;
      }
    } catch { toast('Server error', 'error'); btn.textContent = 'Continue to Payment →'; btn.disabled = false; }
  });
}

// ─── HOTELS ──────────────────────────────────────────
document.getElementById('btn-search-hotels').addEventListener('click', loadHotels);

async function loadHotels() {
  const params = new URLSearchParams();
  const city   = document.getElementById('ht-city').value;
  const price  = document.getElementById('ht-price').value;
  const rating = document.getElementById('ht-rating').value;
  if (city)   params.append('city', city);
  if (price)  params.append('maxPrice', price);
  if (rating) params.append('minRating', rating);

  const container = document.getElementById('hotels-results');
  container.innerHTML = `<div class="skeleton" style="height:300px"></div><div class="skeleton" style="height:300px"></div><div class="skeleton" style="height:300px"></div>`;

  try {
    const res  = await apiFetch(`/hotels?${params}`);
    const data = await res.json();
    renderHotels(data.hotels || data);
  } catch {
    toast('Failed to load hotels. Make sure the server is running.', 'error');
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Server Unreachable</h3><p>Make sure your Node.js server is running on port 3000.</p></div>`;
  }
}

function renderHotels(hotels) {
  const container = document.getElementById('hotels-results');
  if (!hotels || hotels.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🏨</div><h3>No Hotels Found</h3><p>Try changing your search filters.</p></div>`;
    return;
  }
  container.innerHTML = hotels.map(h => `
    <div class="hotel-card">
      <div class="hotel-img">
        🏨
        <div class="hotel-rating-badge">⭐ ${h.rating.toFixed(1)}</div>
      </div>
      <div class="hotel-body">
        <div class="hotel-name">${h.name}</div>
        <div class="hotel-city">📍 ${h.city}${h.address?', '+h.address:''}</div>
        <div class="hotel-amenities">
          ${(h.amenities||[]).slice(0,4).map(a=>`<span class="amenity-tag">${a}</span>`).join('')}
        </div>
        <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">🛏 ${h.availableRooms} rooms available</div>
      </div>
      <div class="hotel-footer">
        <div class="hotel-price"><span>₹${h.pricePerNight.toLocaleString()}</span><small> /night</small></div>
        <button class="btn btn-primary btn-sm" onclick='bookHotel(${JSON.stringify(h)})'>Book Now</button>
      </div>
    </div>
  `).join('');
}

function bookHotel(hotel) {
  if (!currentUser) { loginModal(); toast('Please sign in to book a hotel', 'info'); return; }
  const today = new Date().toISOString().split('T')[0];
  openModal(`
    <h2 class="modal-title">🏨 Book Hotel</h2>
    <p class="modal-subtitle">${hotel.name} · ${hotel.city}</p>
    <div class="booking-steps">
      <div class="step active" id="step-dot-1">1</div>
      <div class="step-line"></div>
      <div class="step" id="step-dot-2">2</div>
    </div>
    <form class="modal-form" id="book-hotel-form">
      <div class="form-group">
        <label class="form-label">Check-in Date</label>
        <input class="form-input" type="date" id="bh-checkin" min="${today}" required />
      </div>
      <div class="form-group">
        <label class="form-label">Check-out Date</label>
        <input class="form-input" type="date" id="bh-checkout" min="${today}" required />
      </div>
      <div id="bh-summary" style="background:rgba(255,255,255,0.04);border-radius:12px;padding:16px;font-size:14px;color:var(--text-secondary);display:none;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>Price per night</span><span style="color:var(--text-primary);font-weight:600;">₹${hotel.pricePerNight.toLocaleString()}</span></div>
        <div id="bh-nights"></div>
        <div id="bh-total" style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;color:#fbbf24;border-top:1px solid rgba(255,255,255,0.08);padding-top:10px;margin-top:8px;"></div>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:14px;">Continue to Payment →</button>
    </form>
  `);
  let totalAmount = 0;
  function updateSummary() {
    const ci = document.getElementById('bh-checkin').value;
    const co = document.getElementById('bh-checkout').value;
    if (ci && co) {
      const nights = Math.ceil((new Date(co)-new Date(ci))/(86400000));
      if (nights > 0) {
        totalAmount = hotel.pricePerNight * nights;
        document.getElementById('bh-summary').style.display = 'block';
        document.getElementById('bh-nights').innerHTML = `<div style="display:flex;justify-content:space-between;"><span>Nights</span><span style="color:var(--text-primary);">${nights}</span></div>`;
        document.getElementById('bh-total').innerHTML  = `<span>Total</span><span>₹${totalAmount.toLocaleString()}</span>`;
      }
    }
  }
  document.getElementById('bh-checkin').addEventListener('change', updateSummary);
  document.getElementById('bh-checkout').addEventListener('change', updateSummary);
  document.getElementById('book-hotel-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button'); btn.textContent = 'Creating booking…'; btn.disabled = true;
    try {
      const res  = await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({ bookingType: 'hotel', hotelId: hotel._id, checkIn: document.getElementById('bh-checkin').value, checkOut: document.getElementById('bh-checkout').value })
      });
      const data = await res.json();
      if (res.ok) {
        showPaymentStep(data.booking._id, data.booking.totalAmount, hotel.name);
      } else {
        toast(data.message || 'Booking failed', 'error');
        btn.textContent = 'Continue to Payment →'; btn.disabled = false;
      }
    } catch { toast('Server error', 'error'); btn.textContent = 'Continue to Payment →'; btn.disabled = false; }
  });
}

// ─── Payment Step (Step 2) ────────────────────────────
function showPaymentStep(bookingId, amount, label) {
  openModal(`
    <h2 class="modal-title">💳 Payment</h2>
    <p class="modal-subtitle">${label}</p>
    <div class="booking-steps">
      <div class="step done">✓</div>
      <div class="step-line active-line"></div>
      <div class="step active">2</div>
    </div>
    <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.25);border-radius:14px;padding:20px;margin:16px 0;text-align:center;">
      <div style="font-size:13px;color:var(--text-secondary);margin-bottom:4px;">Amount Due</div>
      <div style="font-size:2rem;font-weight:900;color:#fbbf24;">₹${amount.toLocaleString()}</div>
    </div>
    <form class="modal-form" id="payment-form">
      <div class="form-group">
        <label class="form-label">Payment Method</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <label class="pay-method-card" id="pm-card">
            <input type="radio" name="method" value="card" checked style="display:none" />
            <span class="pm-icon">💳</span><span>Credit / Debit Card</span>
          </label>
          <label class="pay-method-card" id="pm-upi">
            <input type="radio" name="method" value="upi" style="display:none" />
            <span class="pm-icon">📱</span><span>UPI</span>
          </label>
          <label class="pay-method-card" id="pm-netbanking">
            <input type="radio" name="method" value="netbanking" style="display:none" />
            <span class="pm-icon">🏦</span><span>Net Banking</span>
          </label>
          <label class="pay-method-card" id="pm-wallet">
            <input type="radio" name="method" value="wallet" style="display:none" />
            <span class="pm-icon">👛</span><span>Wallet</span>
          </label>
        </div>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:16px;font-size:16px;">🔒 Pay ₹${amount.toLocaleString()}</button>
      <p style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:10px;">🔐 Secured & encrypted · Simulated payment</p>
    </form>
  `);
  // Highlight selected payment method
  document.querySelectorAll('.pay-method-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.pay-method-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
  document.querySelector('#pm-card').classList.add('selected');

  document.getElementById('payment-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn    = e.target.querySelector('button');
    const method = document.querySelector('input[name="method"]:checked').value;
    btn.textContent = 'Processing payment…'; btn.disabled = true;
    // Animate processing
    let dots = 0;
    const interval = setInterval(() => { dots = (dots+1)%4; btn.textContent = 'Processing' + '.'.repeat(dots); }, 400);
    try {
      const res  = await apiFetch('/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({ bookingId, method })
      });
      clearInterval(interval);
      const data = await res.json();
      if (res.ok) {
        showPaymentSuccess(data.transactionId, amount, label, method);
        loadBookings();
      } else {
        toast(data.message || 'Payment failed', 'error');
        btn.textContent = `🔒 Pay ₹${amount.toLocaleString()}`; btn.disabled = false;
      }
    } catch {
      clearInterval(interval);
      toast('Server error', 'error');
      btn.textContent = `🔒 Pay ₹${amount.toLocaleString()}`; btn.disabled = false;
    }
  });
}

// ─── Payment Success Receipt (Step 3) ─────────────────
function showPaymentSuccess(txnId, amount, label, method) {
  const methodIcons = { card:'💳', upi:'📱', netbanking:'🏦', wallet:'👛' };
  openModal(`
    <div style="text-align:center;padding:12px 0;">
      <div style="width:72px;height:72px;border-radius:50%;background:rgba(16,185,129,0.15);border:2px solid rgba(16,185,129,0.4);display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 16px;">✅</div>
      <h2 class="modal-title" style="color:#6ee7b7;">Payment Successful!</h2>
      <p class="modal-subtitle">Your booking is confirmed</p>
    </div>
    <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:12px;margin:16px 0;">
      <div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--text-secondary);">Booking</span><span style="font-weight:600;">${label}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--text-secondary);">Amount Paid</span><span style="font-weight:700;color:#fbbf24;">₹${amount.toLocaleString()}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--text-secondary);">Method</span><span>${methodIcons[method]||'💳'} ${method.charAt(0).toUpperCase()+method.slice(1)}</span></div>
      <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;">
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px;">Transaction ID</div>
        <div style="font-size:13px;font-family:monospace;color:#a5b4fc;word-break:break-all;">${txnId}</div>
      </div>
    </div>
    <div style="display:flex;gap:10px;">
      <button class="btn btn-ghost" style="flex:1;justify-content:center;" onclick="closeModal()">Close</button>
      <button class="btn btn-primary" style="flex:1;justify-content:center;" onclick="closeModal();navigate('bookings');">View Bookings</button>
    </div>
  `);
}

// ─── Pay Now (for existing unpaid bookings) ───────────
function payNow(bookingId, amount, label) {
  showPaymentStep(bookingId, amount, label);
}

// ─── MY BOOKINGS ─────────────────────────────────────
let allBookings  = [];
let activeFilter = 'all';

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    filterBookings();
  });
});

function filterBookings() {
  const filtered = activeFilter === 'all'
    ? allBookings
    : allBookings.filter(b => b.bookingType === activeFilter || b.status === activeFilter);
  renderBookings(filtered);
}

document.querySelector('.nav-link[data-page="bookings"]').addEventListener('click', () => {
  setTimeout(loadBookings, 50);
});

async function loadBookings() {
  if (!currentUser) {
    document.getElementById('bookings-list').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔐</div>
        <h3>Authentication Required</h3>
        <p>Please sign in to view your bookings.</p>
        <button class="btn btn-primary" onclick="loginModal()">Sign In</button>
      </div>`;
    return;
  }
  document.getElementById('bookings-list').innerHTML = `<div class="skeleton" style="height:90px"></div><div class="skeleton" style="height:90px;margin-top:16px"></div>`;
  try {
    const res  = await apiFetch('/bookings');
    const data = await res.json();
    allBookings = data.bookings || [];
    filterBookings();
  } catch { toast('Could not load bookings', 'error'); }
}

function renderBookings(bookings) {
  const list = document.getElementById('bookings-list');
  if (!bookings.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🧳</div><h3>No Bookings Found</h3><p>Book a flight or hotel to get started!</p><button class="btn btn-primary" onclick="navigate('flights')">Explore Flights</button></div>`;
    return;
  }
  list.innerHTML = bookings.map(b => {
    const isFlight = b.bookingType === 'flight';
    const title    = isFlight
      ? (b.flight ? `${b.flight.airline} · ${b.flight.origin} → ${b.flight.destination}` : 'Flight Booking')
      : (b.hotel  ? `${b.hotel.name} · ${b.hotel.city}` : 'Hotel Booking');
    const meta     = isFlight
      ? `${b.passengers} passenger(s) · Flight`
      : (b.checkIn ? `Check-in: ${new Date(b.checkIn).toLocaleDateString()} → ${new Date(b.checkOut).toLocaleDateString()}` : 'Hotel Stay');
    const canPay   = b.paymentStatus === 'unpaid' && b.status !== 'cancelled';
    const labelStr = title.replace(/'/g, "\\'");
    return `
    <div class="booking-card">
      <div class="booking-type-icon ${b.bookingType}">${isFlight?'✈':'🏨'}</div>
      <div class="booking-main">
        <div class="booking-title">${title}</div>
        <div class="booking-meta">${meta}</div>
        <div style="display:flex;gap:6px;margin-top:8px;">
          <span class="badge badge-${b.status}">${b.status}</span>
          <span class="badge badge-${b.paymentStatus}">${b.paymentStatus}</span>
        </div>
      </div>
      <div class="booking-amount">₹${b.totalAmount.toLocaleString()}</div>
      <div class="booking-actions">
        ${canPay ? `<button class="btn btn-primary btn-sm" onclick="payNow('${b._id}',${b.totalAmount},'${labelStr}')">💳 Pay Now</button>` : ''}
        ${b.status!=='cancelled' ? `<button class="btn btn-danger btn-sm" onclick="cancelBooking('${b._id}')">Cancel</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

async function cancelBooking(id) {
  if (!confirm('Cancel this booking?')) return;
  try {
    const res  = await apiFetch(`/bookings/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) { toast('Booking cancelled', 'success'); loadBookings(); }
    else toast(data.message || 'Failed to cancel', 'error');
  } catch { toast('Server error', 'error'); }
}

// ─── ADMIN ───────────────────────────────────────────
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`admin-panel-${tab.dataset.tab}`).classList.add('active');
  });
});

document.querySelector('.nav-link[data-page="admin"]').addEventListener('click', () => {
  setTimeout(loadAdminStats, 50);
});

async function loadAdminStats() {
  try {
    const [uRes, bRes] = await Promise.all([
      apiFetch('/admin/users'),
      apiFetch('/admin/bookings')
    ]);
    if (uRes.ok) {
      const d = await uRes.json();
      document.getElementById('admin-user-count').textContent = d.count ?? '—';
    }
    if (bRes.ok) {
      const d = await bRes.json();
      document.getElementById('admin-booking-count').textContent = d.count ?? '—';
      const rev = (d.bookings||[]).reduce((s,b) => s+(b.totalAmount||0), 0);
      document.getElementById('admin-revenue').textContent = `₹${rev.toLocaleString()}`;
    }
  } catch { /* not admin */ }
}

document.getElementById('btn-load-users').addEventListener('click', loadAdminUsers);
async function loadAdminUsers() {
  try {
    const res  = await apiFetch('/admin/users');
    if (!res.ok) { toast('Admin access required', 'error'); return; }
    const data = await res.json();
    document.getElementById('users-tbody').innerHTML =
      (data.users||[]).map(u => `
        <tr>
          <td><strong>${u.name}</strong></td>
          <td>${u.email}</td>
          <td>${u.phone||'—'}</td>
          <td><span class="badge badge-${u.role}">${u.role}</span></td>
          <td>${new Date(u.createdAt).toLocaleDateString()}</td>
          <td><button class="btn btn-danger btn-sm" onclick="deleteUser('${u._id}')">Delete</button></td>
        </tr>`).join('') ||
      '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px;">No users found</td></tr>';
    document.getElementById('admin-user-count').textContent = data.count ?? data.users?.length ?? 0;
    toast(`Loaded ${data.users?.length||0} users`, 'success');
  } catch { toast('Failed to load users', 'error'); }
}

async function deleteUser(id) {
  if (!confirm('Delete this user and all their bookings?')) return;
  try {
    const res  = await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) { toast('User deleted', 'success'); loadAdminUsers(); }
    else toast(data.message || 'Failed', 'error');
  } catch { toast('Server error', 'error'); }
}

document.getElementById('btn-load-bookings').addEventListener('click', loadAdminBookings);
async function loadAdminBookings() {
  try {
    const res  = await apiFetch('/admin/bookings');
    if (!res.ok) { toast('Admin access required', 'error'); return; }
    const data = await res.json();
    document.getElementById('bookings-tbody').innerHTML =
      (data.bookings||[]).map(b => `
        <tr>
          <td style="font-size:12px;color:var(--text-muted);">${b._id.slice(-6)}</td>
          <td>${b.user?.name||'—'}</td>
          <td><span class="badge badge-${b.bookingType==='flight'?'confirmed':'pending'}">${b.bookingType}</span></td>
          <td>₹${b.totalAmount.toLocaleString()}</td>
          <td><span class="badge badge-${b.status}">${b.status}</span></td>
          <td><span class="badge badge-${b.paymentStatus}">${b.paymentStatus}</span></td>
          <td>
            <select class="form-input" style="padding:4px 8px;font-size:12px;width:auto;" onchange="updateStatus('${b._id}',this.value)">
              <option value="pending"   ${b.status==='pending'   ?'selected':''}>Pending</option>
              <option value="confirmed" ${b.status==='confirmed' ?'selected':''}>Confirmed</option>
              <option value="cancelled" ${b.status==='cancelled' ?'selected':''}>Cancelled</option>
            </select>
          </td>
        </tr>`).join('') ||
      '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:24px;">No bookings</td></tr>';
    document.getElementById('admin-booking-count').textContent = data.count ?? data.bookings?.length ?? 0;
    toast(`Loaded ${data.bookings?.length||0} bookings`, 'success');
  } catch { toast('Failed to load bookings', 'error'); }
}

async function updateStatus(id, status) {
  try {
    const res  = await apiFetch(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (res.ok) toast(`Status updated to "${status}"`, 'success');
    else toast(data.message || 'Failed', 'error');
  } catch { toast('Server error', 'error'); }
}

document.getElementById('btn-add-hotel').addEventListener('click', () => {
  openModal(`
    <h2 class="modal-title">🏨 Add Hotel</h2>
    <p class="modal-subtitle">Add a new hotel listing</p>
    <form class="modal-form" id="add-hotel-form">
      <div class="form-group"><label class="form-label">Hotel Name</label><input class="form-input" type="text" id="ah-name" placeholder="Grand Hyatt" required /></div>
      <div class="form-group"><label class="form-label">City</label><input class="form-input" type="text" id="ah-city" placeholder="Mumbai" required /></div>
      <div class="form-group"><label class="form-label">Address</label><input class="form-input" type="text" id="ah-address" placeholder="123 Marine Drive" /></div>
      <div class="form-group"><label class="form-label">Price per Night (₹)</label><input class="form-input" type="number" id="ah-price" placeholder="5000" required /></div>
      <div class="form-group"><label class="form-label">Rating (0-5)</label><input class="form-input" type="number" id="ah-rating" min="0" max="5" step="0.1" placeholder="4.5" /></div>
      <div class="form-group"><label class="form-label">Available Rooms</label><input class="form-input" type="number" id="ah-rooms" placeholder="10" /></div>
      <div class="form-group"><label class="form-label">Amenities (comma-separated)</label><input class="form-input" type="text" id="ah-amenities" placeholder="WiFi, Pool, Spa" /></div>
      <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:14px;">Add Hotel</button>
    </form>
  `);
  document.getElementById('add-hotel-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button'); btn.textContent = 'Adding…'; btn.disabled = true;
    const amenities = document.getElementById('ah-amenities').value.split(',').map(s=>s.trim()).filter(Boolean);
    try {
      const res  = await apiFetch('/admin/hotels', {
        method: 'POST',
        body: JSON.stringify({
          name: document.getElementById('ah-name').value,
          city: document.getElementById('ah-city').value,
          address: document.getElementById('ah-address').value,
          pricePerNight: +document.getElementById('ah-price').value,
          rating: +document.getElementById('ah-rating').value || 0,
          availableRooms: +document.getElementById('ah-rooms').value || 0,
          amenities
        })
      });
      const data = await res.json();
      if (res.ok) { closeModal(); toast('Hotel added! 🎉', 'success'); }
      else { toast(data.message || 'Failed', 'error'); btn.textContent = 'Add Hotel'; btn.disabled = false; }
    } catch { toast('Server error', 'error'); btn.textContent = 'Add Hotel'; btn.disabled = false; }
  });
});

// ─── Init — restore session from stored JWT ───────────
(async function restoreSession() {
  const token = getToken();
  if (!token) return;
  try {
    const res  = await apiFetch('/auth/me');
    if (res.ok) {
      const data = await res.json();
      if (data.user) setLoggedIn(data.user);
    } else {
      // Token expired or invalid — clear it
      clearToken();
    }
  } catch { /* server offline, token stays until next attempt */ }
})();

// Set today's date as default for date fields
const today = new Date().toISOString().split('T')[0];
['hero-date','hero-checkin','hero-checkout'].forEach(id => {
  const el = document.getElementById(id); if (el) el.value = today;
});
