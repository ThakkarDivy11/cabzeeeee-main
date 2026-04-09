import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const MARQUEE_ITEMS = ["SAFE RIDES", "INSTANT BOOKING", "LIVE TRACKING", "VERIFIED DRIVERS", "AFFORDABLE FARES", "24/7 SUPPORT", "GJ REGISTERED"];
const STEPS = [
  { icon: "📍", title: "Set Your Location", text: "Enter pickup & drop in seconds. CabZee auto-detects your location for faster booking." },
  { icon: "🚗", title: "Choose Your Ride", text: "Pick from Cab, Auto, or Premium — all with upfront transparent pricing." },
  { icon: "📡", title: "Track in Real-Time", text: "Watch your driver live on the map. Get ETA, plate number & driver details instantly." },
  { icon: "🎉", title: "Arrive in Style", text: "Pay via UPI, cash or card. Rate your driver and you're done!" },
];
const FEATURES = [
  { icon: "⚡", name: "Instant Matching", text: "AI matches you with the nearest verified driver in under 30 seconds — no waiting, no guessing.", num: "01" },
  { icon: "🗺️", name: "Live GPS Tracking", text: "Track your ride in real-time. Share trip with family. See driver ETA and plate live.", num: "02" },
  { icon: "🛡️", name: "Verified Drivers", text: "Every driver is background-checked and rated. Plate number shared before pickup — always.", num: "03" },
  { icon: "💳", name: "Flexible Payments", text: "Cash, UPI, card or CabZee wallet — pay however you like. Receipts delivered instantly.", num: "04" },
  { icon: "💰", name: "Upfront Pricing", text: "See your exact fare before you book. Zero hidden charges — what you see is what you pay.", num: "05" },
  { icon: "🌙", name: "24/7 Availability", text: "Rides available round the clock across Gujarat. Late night, early morning — CabZee is always on.", num: "06" },
];
const STATS = [
  { count: 500, suffix: "K+", label: "Happy Riders" },
  { count: 50, suffix: "K+", label: "Active Drivers" },
  { count: 100, suffix: "+", label: "Cities Covered" },
  { count: 4.9, suffix: "★", label: "Average Rating", decimal: true },
];
const TESTIMONIALS = [
  { text: "\"Booked a cab at 2 AM and Divy arrived in 4 minutes. Safe ride, great conversation, no surge pricing. CabZee is my go-to now.\"", name: "Priya Mehta", sub: "Ahmedabad · Regular Rider", avatar: "👩" },
  { text: "\"The live tracking feature gives me so much peace of mind. I share my trip with my family and they always know I'm safe.\"", name: "Aryan Shah", sub: "Surat · Daily Commuter", avatar: "👦" },
  { text: "\"Upfront pricing is a game changer. I saw ₹249 before I booked — that's exactly what I paid. Zero surprises, always.\"", name: "Sneha Joshi", sub: "Vadodara · Business Traveler", avatar: "👩" },
];

function useCountUp(target, decimal, active) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const duration = 2000;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(decimal ? parseFloat((eased * target).toFixed(1)) : Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else setVal(target);
    };
    requestAnimationFrame(step);
  }, [active, target, decimal]);
  return val;
}

function StatBlock({ count, suffix, label, decimal, active }) {
  const val = useCountUp(count, decimal, active);
  return (
    <div className="cz-stat-block">
      <div className="cz-stat-num">{decimal ? val.toFixed(1) : val}{suffix}</div>
      <div className="cz-stat-label">{label}</div>
    </div>
  );
}

function CarSvg() {
  return (
    <svg className="cz-car-svg" viewBox="0 0 104 52" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="20" width="86" height="22" rx="5" fill="#FFD000" />
      <path d="M22 20 L31 7 L72 7 L82 20Z" fill="#e6bc00" />
      <rect x="33" y="9" width="15" height="10" rx="2" fill="#1a2a4a" opacity=".85" />
      <rect x="52" y="9" width="15" height="10" rx="2" fill="#1a2a4a" opacity=".85" />
      <rect x="36" y="6.5" width="28" height="2" rx="1" fill="#cc9e00" />
      <line x1="50" y1="20" x2="50" y2="42" stroke="#cc9e00" strokeWidth="1.2" opacity=".45" />
      <rect x="86" y="25" width="9" height="5" rx="2" fill="#cc9e00" />
      <rect x="87" y="26" width="7" height="3" rx="1" fill="#fffde0" opacity=".9" />
      <rect x="4" y="25" width="5" height="7" rx="1.5" fill="#ff4444" opacity=".85" />
      <ellipse cx="24" cy="42" rx="11" ry="5" fill="#111" />
      <ellipse cx="76" cy="42" rx="11" ry="5" fill="#111" />
      <g className="cz-wheel-a">
        <circle cx="24" cy="42" r="10" fill="#1e1e2e" />
        <circle cx="24" cy="42" r="7" fill="#2a2a3e" />
        <circle cx="24" cy="42" r="3" fill="#FFD000" />
        <line x1="24" y1="35" x2="24" y2="49" stroke="#FFD000" strokeWidth="1.5" opacity=".7" />
        <line x1="17" y1="42" x2="31" y2="42" stroke="#FFD000" strokeWidth="1.5" opacity=".7" />
        <line x1="19" y1="37" x2="29" y2="47" stroke="#FFD000" strokeWidth="1" opacity=".4" />
        <line x1="29" y1="37" x2="19" y2="47" stroke="#FFD000" strokeWidth="1" opacity=".4" />
      </g>
      <g className="cz-wheel-a">
        <circle cx="76" cy="42" r="10" fill="#1e1e2e" />
        <circle cx="76" cy="42" r="7" fill="#2a2a3e" />
        <circle cx="76" cy="42" r="3" fill="#FFD000" />
        <line x1="76" y1="35" x2="76" y2="49" stroke="#FFD000" strokeWidth="1.5" opacity=".7" />
        <line x1="69" y1="42" x2="83" y2="42" stroke="#FFD000" strokeWidth="1.5" opacity=".7" />
        <line x1="71" y1="37" x2="81" y2="47" stroke="#FFD000" strokeWidth="1" opacity=".4" />
        <line x1="81" y1="37" x2="71" y2="47" stroke="#FFD000" strokeWidth="1" opacity=".4" />
      </g>
      <text x="44" y="34" fontFamily="Arial" fontSize="7" fill="#000" fontWeight="bold" opacity=".5">CABZEE</text>
    </svg>
  );
}

function CarStrip() {
  const bldH = [28, 36, 44, 22, 40, 50, 30, 20, 46, 34];
  const bldW = [22, 16, 28, 18, 32, 14, 26, 20, 36, 24];
  const trees = ['🌴', '🌳', '💡', '🌲', '🏠'];
  const buildings = [];
  const treeItems = [];
  let cx = 0;
  for (let rep = 0; rep < 2; rep++) {
    let x = cx;
    while (x - cx < 1600) {
      const idx = (buildings.length * 7 + x) % bldH.length;
      buildings.push({ left: x, width: bldW[idx], height: bldH[idx] });
      x += bldW[idx] + 4 + ((x * 13) % 14);
    }
    if (rep === 0) cx = x;
  }
  let tx = 0;
  for (let rep = 0; rep < 2; rep++) {
    let x = tx;
    while (x - tx < 1800) {
      const idx = (treeItems.length * 3 + x) % trees.length;
      treeItems.push({ left: x, emoji: trees[idx], size: 18 + (x % 8) });
      x += 55 + ((x * 11) % 75);
    }
    if (rep === 0) tx = x;
  }
  return (
    <div className="cz-car-strip" aria-hidden="true">
      <div className="cz-city-layer">
        {buildings.map((b, i) => (
          <div key={i} className="cz-bld" style={{ position: 'absolute', left: b.left, width: b.width, height: b.height, bottom: 0 }} />
        ))}
      </div>
      <div className="cz-tree-layer">
        {treeItems.map((t, i) => (
          <div key={i} className="cz-tree" style={{ left: t.left, fontSize: t.size }}>{t.emoji}</div>
        ))}
      </div>
      <div className="cz-road-layer">
        <div className="cz-road-surface" />
        <div className="cz-road-stripe">
          <div className="cz-road-dashes-wrap">
            {Array.from({ length: 22 }).map((_, i) => <div key={i} className="cz-rd" />)}
          </div>
        </div>
      </div>
      <div className="cz-strip-car-wrap">
        <div className="cz-car-main">
          <div className="cz-speed-wrap">
            {[0, 1, 2, 3].map(i => <div key={i} className="cz-sl" />)}
          </div>
          <div className="cz-exhaust-wrap">
            {[0, 1, 2].map(i => <div key={i} className="cz-puff" />)}
          </div>
          <CarSvg />
        </div>
      </div>
    </div>
  );
}

const LandingPage = () => {
  const navigate = useNavigate();
  const [dark, setDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [statsActive, setStatsActive] = useState(false);
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const statsRef = useRef(null);
  const rxRef = useRef(window.innerWidth / 2);
  const ryRef = useRef(window.innerHeight / 2);
  const mxRef = useRef(window.innerWidth / 2);
  const myRef = useRef(window.innerHeight / 2);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      mxRef.current = e.clientX;
      myRef.current = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px';
        cursorRef.current.style.top = e.clientY + 'px';
      }
    };
    const raf = () => {
      rxRef.current += (mxRef.current - rxRef.current) * 0.12;
      ryRef.current += (myRef.current - ryRef.current) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = rxRef.current + 'px';
        ringRef.current.style.top = ryRef.current + 'px';
      }
      rafId = requestAnimationFrame(raf);
    };
    let rafId = requestAnimationFrame(raf);
    document.addEventListener('mousemove', onMove);
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => { document.removeEventListener('mousemove', onMove); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafId); };
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsActive(true); }, { threshold: 0.2 });
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const marqueeItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className={`cz-root ${dark ? 'cabzee-dark' : 'cabzee-light'}`}
      onMouseOver={e => { if (e.target.closest('a,button')) setHovering(true); }}
      onMouseOut={e => { if (e.target.closest('a,button')) setHovering(false); }}>
      <div className="cz-noise" />
      <div ref={cursorRef} className={`cz-cursor${hovering ? ' big' : ''}`} />
      <div ref={ringRef} className="cz-ring" />

      {/* NAV */}
      <nav className={`cz-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="cz-logo">🚕 CABZEE</div>
        <ul className="cz-nav-links">
          <li><a href="#how">How It Works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#drive">Drive</a></li>
          <li><a href="#app">Get App</a></li>
        </ul>
        <div className="cz-nav-right">
          <button className="cz-theme-toggle" onClick={() => setDark(d => !d)}>{dark ? '☀️' : '🌙'}</button>
          <button onClick={() => navigate('/register')} className="cz-nav-cta">Book a Ride →</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="cz-hero" id="hero">
        <div className="cz-hero-grid" />
        <div className="cz-orb cz-orb-1" />
        <div className="cz-orb cz-orb-2" />
        <div className="cz-shape-ring" />
        <div className="cz-shape-ring-2" />
        <div className="cz-hero-left">
          <div className="cz-hero-tag">🚕 Your Ride, Your Way</div>
          <h1 className="cz-hero-title">
            <span className="line"><span>YOUR RIDE</span></span>
            <span className="line"><span className="cz-stroke-word">ANYWHERE</span>&nbsp;<span className="cz-accent-word">NOW</span></span>
            <span className="line"><span>WITH CABZEE</span></span>
          </h1>
          <p className="cz-hero-sub">Fast, safe & affordable rides at your fingertips. Book in seconds, track in real-time, arrive in comfort — every time across Gujarat & beyond.</p>
          <div className="cz-hero-actions">
            <button onClick={() => navigate('/register')} className="cz-btn-primary">Book a Ride Now →</button>
            <button onClick={() => navigate('/register')} className="cz-btn-ghost">🚗 Become a Driver</button>
          </div>
        </div>
        <div className="cz-hero-right">
          <div className="cz-hero-map-card">
            <div className="cz-map-canvas">
              <svg className="cz-map-grid-svg" xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="mg" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="var(--grid-line)" strokeWidth=".8" /></pattern></defs>
                <rect width="100%" height="100%" fill="url(#mg)" />
                <line x1="27%" y1="37%" x2="68%" y2="64%" stroke="rgba(0,212,168,0.3)" strokeWidth="1.5" strokeDasharray="5,4" />
              </svg>
              <div className="cz-map-road-h" style={{ top: '36%', height: '13px' }} />
              <div className="cz-map-road-h" style={{ top: '63%', height: '13px' }} />
              <div className="cz-map-road-v" style={{ left: '26%', width: '13px' }} />
              <div className="cz-map-road-v" style={{ left: '66%', width: '13px' }} />
              <div className="cz-map-pickup">
                <div className="cz-map-ring r-g2" />
                <div className="cz-map-ring r-g1" />
                <div className="cz-map-pickup-dot" />
              </div>
              <div className="cz-map-drop">
                <div className="cz-map-ring r-t2" />
                <div className="cz-map-ring r-t1" />
                <div className="cz-map-drop-dot" />
              </div>
              <div className="cz-map-taxi">🚕</div>
            </div>
            <div className="cz-driver-arriving-card">
              <div className="cz-driver-avatar-box">DT</div>
              <div className="cz-driver-arriving-info">
                <div className="cz-driver-arriving-label">Driver Arriving</div>
                <div className="cz-driver-arriving-name">Divy Thakkar · Honda City</div>
                <div className="cz-driver-arriving-sub">4.98 ★ &nbsp;·&nbsp; GJ05 AC 1234</div>
              </div>
              <div className="cz-driver-eta">
                <div className="cz-driver-eta-label">ETA</div>
                <div className="cz-driver-eta-val">3 MIN</div>
              </div>
            </div>
          </div>
          <div className="cz-hero-fare-row">
            <div className="cz-fare-info">
              <div className="cz-fare-label">Estimated Fare</div>
              <div className="cz-fare-val">₹249</div>
            </div>
            <button onClick={() => navigate('/register')} className="cz-fare-book">Book Now →</button>
          </div>
        </div>
        <div className="cz-hero-scroll"><div className="cz-scroll-line" /><span>SCROLL</span></div>
      </section>

      {/* CAR STRIP */}
      <CarStrip />

      {/* MARQUEE */}
      <section className="cz-marquee-section">
        <div className="cz-marquee-track">
          {marqueeItems.map((item, i) => (
            <div key={i} className="cz-marquee-item">{item} <span className="cz-marquee-dot">·</span></div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="cz-how" id="how">
        <div className="cz-section-header">
          <div><div className="cz-section-label">Simple As 1-2-3</div><div className="cz-section-title">HOW IT<br />WORKS</div></div>
          <p className="cz-section-desc">From tap to destination — the smoothest ride experience you've ever had.</p>
        </div>
        <div className="cz-steps-row">
          {STEPS.map((s, i) => (
            <div key={i} className="cz-step">
              <div className="cz-step-num">{s.icon}</div>
              <div className="cz-step-title">{s.title}</div>
              <p className="cz-step-text">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="cz-features" id="features">
        <div className="cz-section-header">
          <div><div className="cz-section-label">Why CabZee</div><div className="cz-section-title">CORE<br />FEATURES</div></div>
          <p className="cz-section-desc">Every feature designed for a safer, smarter, smoother journey.</p>
        </div>
        <div className="cz-features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="cz-feature-card">
              <div className="cz-feature-icon">{f.icon}</div>
              <div className="cz-feature-name">{f.name}</div>
              <p className="cz-feature-text">{f.text}</p>
              <div className="cz-feature-num">{f.num}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="cz-stats" id="stats" ref={statsRef}>
        {STATS.map((s, i) => <StatBlock key={i} {...s} active={statsActive} />)}
      </section>

      {/* APP SECTION */}
      <section className="cz-app-section" id="app">
        <div className="cz-app-content">
          <div className="cz-section-label">Comming Soon</div>
          <div className="cz-app-title">RIDE SMARTER<br />WITH THE<br /><span>CABZEE APP</span></div>
          <p className="cz-app-desc">Download the CabZee app and get your first 3 rides with 20% off. The fastest way to get around Gujarat — in the palm of your hand.</p>
          <div className="cz-store-buttons">
            <button key="apple" onClick={() => navigate('/register')} className="cz-store-btn" style={{ background: 'var(--surface)', border: '1px solid var(--border2)', cursor: 'pointer' }}>
              <div className="cz-store-btn-icon">🍎</div>
              <div className="cz-store-btn-text"><span className="cz-store-btn-sub">Download on the</span><span className="cz-store-btn-name">App Store</span></div>
            </button>
            <button key="google" onClick={() => navigate('/register')} className="cz-store-btn" style={{ background: 'var(--surface)', border: '1px solid var(--border2)', cursor: 'pointer' }}>
              <div className="cz-store-btn-icon">🤖</div>
              <div className="cz-store-btn-text"><span className="cz-store-btn-sub">Get it on</span><span className="cz-store-btn-name">Google Play</span></div>
            </button>
          </div>
        </div>
        <div className="cz-app-mockup">
          <div className="cz-phone-frame">
            <div className="cz-phone-notch" />
            <div className="cz-phone-screen">
              <div className="cz-phone-map">
                <svg className="cz-phone-map-grid-svg" xmlns="http://www.w3.org/2000/svg">
                  <defs><pattern id="pg" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M 22 0 L 0 0 0 22" fill="none" stroke="var(--grid-line)" strokeWidth=".8" /></pattern></defs>
                  <rect width="100%" height="100%" fill="url(#pg)" />
                </svg>
                <div className="cz-phone-road-h" style={{ top: '40%', height: '9px' }} />
                <div className="cz-phone-road-h" style={{ top: '66%', height: '9px' }} />
                <div className="cz-phone-road-v" style={{ left: '33%', width: '9px' }} />
                <div className="cz-phone-road-v" style={{ left: '64%', width: '9px' }} />
                <div className="cz-phone-taxi-wrap">
                  <div className="cz-phone-ring-ping" />
                  <div className="cz-phone-ring-dash" />
                  <div className="cz-phone-ring-solid" />
                  <span className="cz-phone-taxi-emoji">🚕</span>
                </div>
              </div>
              <div className="cz-phone-driver-card">
                <div className="cz-ph-avatar">DT</div>
                <div className="cz-ph-info">
                  <div className="cz-ph-label">Driver Arriving</div>
                  <div className="cz-ph-name">Divy Thakkar · Honda City</div>
                  <div className="cz-ph-sub">4.98 ★ · GJ05 AC 1234</div>
                </div>
                <div className="cz-ph-eta"><div className="cz-ph-eta-lbl">ETA</div><div className="cz-ph-eta-val">3 MIN</div></div>
              </div>
              <div className="cz-phone-fare-row">
                <div><div className="cz-ph-fare-lbl">Estimated Fare</div><div className="cz-ph-fare-val">₹249</div></div>
                <button onClick={() => navigate('/register')} className="cz-ph-book">Book Now →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DRIVER SECTION */}
      <section className="cz-driver-section" id="drive">
        <div className="cz-driver-visual">
          <div className="cz-driver-card">
            <div className="cz-driver-avatar-big">👨✈️</div>
            <div className="cz-driver-name-big">Divy Thakkar</div>
            <div className="cz-driver-sub-big">CabZee Driver · Honda City · 3 Years</div>
            <div className="cz-driver-plate">GJ05 AC 1234</div>
            <div className="cz-driver-stats-grid">
              {[["4.98", "Rating"], ["2,400", "Trips Done"], ["₹82K", "Earned / Mo"], ["98%", "On Time"]].map(([v, l], i) => (
                <div key={i} className="cz-driver-stat"><div className="cz-driver-stat-val">{v}</div><div className="cz-driver-stat-lbl">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
        <div className="cz-driver-content">
          <div className="cz-section-label">Drive with CabZee</div>
          <div className="cz-app-title">EARN MORE.<br />DRIVE ON YOUR<br /><span>TERMS.</span></div>
          <div className="cz-driver-perks">
            {[["💸", "Weekly Payouts", "Earn consistently with weekly direct payouts and performance bonuses."], ["🕐", "Flexible Hours", "Drive when you want. No fixed schedules — be your own boss."], ["🎓", "Free Onboarding", "Free training and safety certification to help you succeed from day one."]].map(([icon, h4, p], i) => (
              <div key={i} className="cz-driver-perk">
                <div className="cz-perk-icon">{icon}</div>
                <div className="cz-perk-text"><h4>{h4}</h4><p>{p}</p></div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/register')} className="cz-btn-primary">Register as Driver →</button>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="cz-testimonials" id="testimonials">
        <div className="cz-section-header" style={{ marginBottom: '56px' }}>
          <div><div className="cz-section-label">What Riders Say</div><div className="cz-section-title">LOVED BY<br />THOUSANDS</div></div>
          <p className="cz-section-desc">Real experiences from real CabZee riders across Gujarat.</p>
        </div>
        <div className="cz-testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="cz-testimonial-card">
              <div className="cz-testimonial-stars">★★★★★</div>
              <p className="cz-testimonial-text">{t.text}</p>
              <div className="cz-testimonial-author">
                <div className="cz-author-avatar">{t.avatar}</div>
                <div><div className="cz-author-name">{t.name}</div><div className="cz-author-sub">{t.sub}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cz-cta-section" id="cta">
        <div className="cz-cta-bg" />
        <div className="cz-cta-title">YOUR NEXT RIDE<br />IS <span>ONE TAP</span> AWAY</div>
        <p className="cz-cta-sub">Join 500,000+ riders already cruising smarter with CabZee across Gujarat.</p>
        <div className="cz-cta-buttons">
          <button onClick={() => navigate('/register')} className="cz-btn-primary" style={{ fontSize: '15px', padding: '17px 44px' }}>Book a Ride Now →</button>
          <button onClick={() => navigate('/register')} className="cz-btn-ghost" style={{ fontSize: '15px', padding: '17px 44px' }}>Become a Driver</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="cz-footer">
        <div className="cz-footer-top">
          <div>
            <div className="cz-logo" style={{ fontSize: '24px', marginBottom: '12px', display: 'inline-flex' }}>🚕 CABZEE</div>
            <p className="cz-footer-desc">Fast, safe & affordable rides wherever you go. Available 24/7 across 100+ cities in Gujarat and India.</p>
          </div>
          {[["Riders", ["Book a Ride", "CabZee Rewards", "Safety Features", "Ride Types"]], ["Drivers", ["Register to Drive", "Driver App", "Earnings", "Training"]], ["Company", ["About Us", "Careers", "Blog", "Contact"]]].map(([title, links]) => (
            <div key={title}>
              <div className="cz-footer-col-title">{title}</div>
              <ul className="cz-footer-links">
                {links.map(l => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="cz-footer-bottom">
          <span>© 2026 CabZee. All rights reserved.</span>
          <div className="cz-footer-social">
            {['𝕏', 'in', '📸'].map((s, i) => <a key={i} href="#" className="cz-social-btn" style={{ cursor: 'pointer' }}>{s}</a>)}
          </div>
          <span>Made with 🚕 in Gujarat, India</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
