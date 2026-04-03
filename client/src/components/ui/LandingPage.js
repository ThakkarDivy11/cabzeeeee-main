import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  MapPin,
  ShieldCheck,
  CreditCard,
  Users,
  Clock,
  ArrowRight,
  Star,
  MessageCircle,
  Navigation,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const stats = [
    { num: '5M+', label: 'Rides' },
    { num: '50K+', label: 'Drivers' },
    { num: '4.9', label: 'Rating' },
    { num: '<3 min', label: 'Avg Wait' },
  ];

  const features = [
    { icon: MapPin, title: 'Real-time Tracking', desc: 'See your driver live on the map. No guessing, no waiting around.' },
    { icon: MessageCircle, title: 'AI Chatbot', desc: 'Get instant answers and quick help—right inside the app.' },
    { icon: CreditCard, title: 'Secure Payments', desc: 'Cash, UPI, card—pay your way with encrypted checkout.' },
    { icon: Users, title: '24/7 Support', desc: 'Real humans and smart tools, always ready to help.' },
    { icon: ShieldCheck, title: 'Safety Shield', desc: 'Verified drivers, OTP rides, and live safety alerts.' },
    { icon: Zap, title: 'Instant Match', desc: 'AI finds you the best driver in under 30 seconds.' },
  ];

  const steps = [
    { n: '01', title: 'Set Destination', desc: 'Open the app, enter where you want to go.' },
    { n: '02', title: 'Get Matched', desc: 'We find the closest, highest-rated driver near you.' },
    { n: '03', title: 'Enjoy Your Ride', desc: 'Track live, share trip, and pay seamlessly.' },
  ];

  const trackingPoints = [
    { icon: Navigation, title: 'Live tracking', desc: 'GPS updated every 2 seconds.' },
    { icon: ShieldCheck, title: 'OTP safety', desc: 'Your ride begins only after OTP.' },
    { icon: Zap, title: 'Route optimization', desc: 'Smart routing beats traffic every time.' },
  ];

  const testimonials = [
    { name: 'Saran Jenkins', role: 'Daily Commuter', review: 'CabZee is the fastest cab app I’ve ever used. Got matched in under a minute during rush hour—insane.' },
    { name: 'Marcus Tran', role: 'Business Executive', review: 'Clean cars, professional drivers, and the live tracking makes every airport run stress-free.' },
    { name: 'Elena Rossi', role: 'Solo Night Rider', review: 'The OTP feature gave me real peace of mind on late-night rides. I can’t ride any other way.' },
  ];

  return (
    <div
      className="cabzee-landing"
      style={{
        background: '#060B18',
        color: '#e2e8f0',
        fontFamily:
          '"SF Pro Display","SF Pro Text","San Francisco",-apple-system,BlinkMacSystemFont,system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        .cabzee-landing, .cabzee-landing * { box-sizing: border-box; }
        .cabzee-landing * { margin: 0; padding: 0; }
        .cabzee-landing a { color: inherit; }

        .glass {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(0,255,255,0.12);
          box-shadow: 0 0 30px rgba(0,255,255,0.08);
        }
        .glass-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0,255,255,0.15);
          box-shadow: 0 0 30px rgba(0,229,255,0.2);
          border-radius: 20px;
        }
        .neon-btn {
          background: linear-gradient(135deg, #00e5ff, #2979ff);
          color: #000;
          font-weight: 900;
          border: none;
          border-radius: 12px;
          padding: 14px 32px;
          cursor: pointer;
          font-size: 15px;
          transition: all 0.3s ease;
          box-shadow: 0 0 20px rgba(0,229,255,0.4);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }
        .neon-btn:hover { transform: translateY(-2px); box-shadow: 0 0 35px rgba(0,229,255,0.7); }
        .ghost-btn {
          background: rgba(0,229,255,0.08);
          color: #00e5ff;
          font-weight: 800;
          border: 1px solid rgba(0,229,255,0.3);
          border-radius: 12px;
          padding: 14px 32px;
          cursor: pointer;
          font-size: 15px;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        }
        .ghost-btn:hover { background: rgba(0,229,255,0.15); border-color: rgba(0,229,255,0.6); transform: translateY(-2px); }

        .section { padding: 100px 24px; max-width: 1200px; margin: 0 auto; }
        .gradient-text {
          background: linear-gradient(135deg, #00e5ff, #2979ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(0,255,255,0.1);
          border-radius: 16px;
          padding: 28px;
          transition: all 0.3s ease;
        }
        .feature-card:hover {
          background: rgba(0,229,255,0.06);
          border-color: rgba(0,229,255,0.3);
          transform: translateY(-4px);
          box-shadow: 0 0 30px rgba(0,229,255,0.15);
        }
        .stat-card {
          text-align: center;
          padding: 32px 24px;
          border: 1px solid rgba(0,255,255,0.12);
          border-radius: 16px;
          background: rgba(255,255,255,0.03);
          transition: all 0.3s;
        }
        .stat-card:hover { border-color: rgba(0,229,255,0.4); box-shadow: 0 0 25px rgba(0,229,255,0.15); }

        .step-num {
          width: 56px; height: 56px;
          background: linear-gradient(135deg, #00e5ff22, #2979ff22);
          border: 1px solid rgba(0,229,255,0.3);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; font-weight: 900; color: #00e5ff;
          flex-shrink: 0;
        }
        .testimonial-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(0,255,255,0.1);
          border-radius: 20px;
          padding: 32px;
          transition: all 0.3s;
        }
        .testimonial-card:hover { border-color: rgba(0,229,255,0.3); box-shadow: 0 0 25px rgba(0,229,255,0.1); }

        .map-mock {
          width: 100%; height: 320px;
          background: linear-gradient(135deg, #0d1b2e 0%, #0a1628 50%, #0d1b2e 100%);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }
        .map-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(0,229,255,0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,229,255,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .map-road-h { position: absolute; height: 6px; background: rgba(0,229,255,0.15); left: 0; right: 0; }
        .map-road-v { position: absolute; width: 6px; background: rgba(0,229,255,0.15); top: 0; bottom: 0; }
        .pulse-pin {
          position: absolute;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: #00e5ff;
          box-shadow: 0 0 20px rgba(0,229,255,0.8);
        }
        .pulse-ring {
          position: absolute;
          width: 40px; height: 40px;
          border-radius: 50%;
          border: 2px solid rgba(0,229,255,0.5);
          animation: ping 1.5s infinite;
          top: -10px; left: -10px;
        }
        @keyframes ping { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .float-anim { animation: float 4s ease-in-out infinite; }

        .nav-link { color: #94a3b8; text-decoration: none; font-weight: 600; font-size: 14px; transition: color 0.2s; }
        .nav-link:hover { color: #00e5ff; }
        .hidden-mobile { display: flex; }

        @media (max-width: 768px) {
          .hero-grid { flex-direction: column !important; }
          .hidden-mobile { display: none !important; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .tracking-grid { flex-direction: column !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .footer-cols { flex-direction: column !important; gap: 32px !important; }
        }
        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* NAV */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(6,11,24,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,255,255,0.08)',
          padding: '0 32px',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg,#00e5ff,#2979ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 14,
              color: '#000',
            }}
          >
            CZ
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.5px' }}>CabZee</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hidden-mobile">
          {['Features', 'How it Works', 'Tracking', 'Testimonials'].map((label) => (
            <a key={label} href={`#${label.toLowerCase().replace(/ /g, '-')}`} className="nav-link">
              {label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button onClick={() => navigate('/login')} className="ghost-btn" style={{ padding: '10px 20px', fontSize: 14 }}>
            Login
          </button>
          <button onClick={() => navigate('/register')} className="neon-btn" style={{ padding: '10px 20px', fontSize: 14 }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ paddingTop: 70 }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '80px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 60,
            minHeight: '90vh',
          }}
          className="hero-grid"
        >
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} style={{ flex: 1 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 999,
                background: 'rgba(0,229,255,0.08)',
                border: '1px solid rgba(0,229,255,0.25)',
                marginBottom: 24,
              }}
            >
              <Zap size={13} color="#00e5ff" fill="#00e5ff" />
              <span style={{ fontSize: 12, fontWeight: 800, color: '#00e5ff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI-Chatbot</span>
            </div>

            <h1 style={{ fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-1px' }}>
              Book Rides
              <br />
              <span className="gradient-text">Faster &amp; Smarter</span>
            </h1>

            <p style={{ fontSize: 17, color: '#94a3b8', lineHeight: 1.7, maxWidth: 480, marginBottom: 36 }}>
              The smarter way to get around. Fast matching, live tracking, and safe rides — all in one place.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button className="neon-btn" onClick={() => navigate('/register')}>
                Book Ride <ArrowRight size={16} />
              </button>
              <button className="ghost-btn" onClick={() => navigate('/register')}>
                Join as Driver
              </button>
            </div>
          </motion.div>

          {/* Right — Map Mock */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ flex: 1, maxWidth: 420, width: '100%' }}
            className="float-anim"
          >
            <div className="glass-card" style={{ padding: 16 }}>
              <div className="map-mock">
                <div className="map-grid" />
                <div className="map-road-h" style={{ top: '35%' }} />
                <div className="map-road-h" style={{ top: '65%' }} />
                <div className="map-road-v" style={{ left: '30%' }} />
                <div className="map-road-v" style={{ left: '70%' }} />

                <div style={{ position: 'absolute', top: '33%', left: '28%' }}>
                  <div className="pulse-ring" />
                  <div className="pulse-pin" style={{ background: '#22c55e', boxShadow: '0 0 15px rgba(34,197,94,0.8)' }} />
                </div>
                <div style={{ position: 'absolute', top: '55%', left: '62%' }}>
                  <div className="pulse-ring" style={{ borderColor: 'rgba(0,229,255,0.5)' }} />
                  <div className="pulse-pin" />
                </div>

                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  <line x1="30%" y1="35%" x2="65%" y2="57%" stroke="rgba(0,229,255,0.4)" strokeWidth="2" strokeDasharray="6,4" />
                </svg>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 12px',
                  marginTop: 12,
                  background: 'rgba(0,229,255,0.05)',
                  borderRadius: 12,
                  border: '1px solid rgba(0,229,255,0.12)',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg,#00e5ff,#2979ff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: 16,
                      color: '#000',
                      flexShrink: 0,
                    }}
                  >
                    DT
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: '#00e5ff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Driver Arriving</p>
                    <p style={{ fontWeight: 800, color: '#e2e8f0' }}>Divy Thakkar · Honda City</p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>4.98 ★ · GJ05 AC 1234</p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>ETA</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: '#00e5ff' }}>3 MIN</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ background: 'rgba(0,229,255,0.02)', borderTop: '1px solid rgba(0,255,255,0.06)', borderBottom: '1px solid rgba(0,255,255,0.06)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }} className="stats-grid">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="stat-card"
            >
              <p style={{ fontSize: 30, fontWeight: 900, color: '#00e5ff', marginBottom: 8 }}>{s.num}</p>
              <p style={{ fontSize: 13, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" className="section">
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ fontSize: 12, letterSpacing: '0.3em', color: '#00e5ff', fontWeight: 900, textTransform: 'uppercase', marginBottom: 12 }}>Features</p>
          <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-1px' }}>
            Everything You Need,
            <br />
            Nothing You Don&apos;t
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="features-grid">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="feature-card"
              >
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(0,229,255,0.10)', border: '1px solid rgba(0,229,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={18} color="#00e5ff" />
                </div>
                <p style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>{f.title}</p>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="how-it-works" style={{ background: 'rgba(0,229,255,0.02)', borderTop: '1px solid rgba(0,255,255,0.06)', borderBottom: '1px solid rgba(0,255,255,0.06)' }}>
        <div className="section" style={{ paddingTop: 90, paddingBottom: 90 }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 12, letterSpacing: '0.3em', color: '#00e5ff', fontWeight: 900, textTransform: 'uppercase', marginBottom: 12 }}>Simple</p>
            <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-1px' }}>Three Steps. That&apos;s It.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }} className="steps-grid">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                style={{
                  display: 'flex',
                  gap: 18,
                  padding: 28,
                  borderRadius: 18,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(0,255,255,0.10)',
                }}
              >
                <div className="step-num">{s.n}</div>
                <div style={{ paddingTop: 2 }}>
                  <p style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>{s.title}</p>
                  <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* TRACKING */}
      <div id="tracking" className="section">
        <div style={{ display: 'flex', gap: 60, alignItems: 'center' }} className="tracking-grid">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ flex: 1 }}>
            <p style={{ fontSize: 12, letterSpacing: '0.3em', color: '#00e5ff', fontWeight: 900, textTransform: 'uppercase', marginBottom: 12 }}>Live</p>
            <h2 style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 14 }}>
              Watch Your Ride,
              <br />
              Every Second
            </h2>
            <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.7, maxWidth: 520, marginBottom: 26 }}>
              Real-time updates, every 2 seconds. You&apos;ll always know exactly where your driver is.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {trackingPoints.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 10, background: 'rgba(0,229,255,0.10)', border: '1px solid rgba(0,229,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color="#00e5ff" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 900, fontSize: 14 }}>{p.title}</p>
                      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{p.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 28 }}>
              <button className="ghost-btn" onClick={() => navigate('/register')} style={{ padding: '12px 18px', fontSize: 14, gap: 8 }}>
                Start tracking <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ flex: 1, maxWidth: 520 }}>
            <div className="glass-card" style={{ padding: 18 }}>
              <div className="map-mock" style={{ height: 360 }}>
                <div className="map-grid" />
                <div className="map-road-h" style={{ top: '42%' }} />
                <div className="map-road-h" style={{ top: '70%' }} />
                <div className="map-road-v" style={{ left: '45%' }} />
                <div className="map-road-v" style={{ left: '76%' }} />
                <div style={{ position: 'absolute', top: '40%', left: '42%' }}>
                  <div className="pulse-ring" />
                  <div className="pulse-pin" />
                </div>
                <div style={{ position: 'absolute', top: '67%', left: '73%' }}>
                  <div className="pulse-ring" style={{ borderColor: 'rgba(34,197,94,0.55)' }} />
                  <div className="pulse-pin" style={{ background: '#22c55e', boxShadow: '0 0 15px rgba(34,197,94,0.8)' }} />
                </div>
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  <line x1="45%" y1="42%" x2="76%" y2="70%" stroke="rgba(0,229,255,0.35)" strokeWidth="2" strokeDasharray="6,4" />
                </svg>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 12 }}>
                {[
                  { icon: Clock, label: 'ETA', value: '2:48' },
                  { icon: Users, label: 'Driver', value: '4.98★' },
                  { icon: ShieldCheck, label: 'Safety', value: 'OTP' },
                ].map((k) => {
                  const Icon = k.icon;
                  return (
                    <div key={k.label} style={{ borderRadius: 14, border: '1px solid rgba(0,255,255,0.10)', background: 'rgba(255,255,255,0.03)', padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Icon size={14} color="#00e5ff" />
                        <p style={{ fontSize: 12, color: '#64748b', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{k.label}</p>
                      </div>
                      <p style={{ fontSize: 16, fontWeight: 900, color: '#e2e8f0' }}>{k.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div id="testimonials" style={{ background: 'rgba(0,229,255,0.02)', borderTop: '1px solid rgba(0,255,255,0.06)' }}>
        <div className="section" style={{ paddingTop: 90, paddingBottom: 90 }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 12, letterSpacing: '0.3em', color: '#00e5ff', fontWeight: 900, textTransform: 'uppercase', marginBottom: 12 }}>Reviews</p>
            <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-1px' }}>Loved by Riders</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="testimonials-grid">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="testimonial-card"
              >
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={14} color="#fbbf24" fill="#fbbf24" />
                  ))}
                </div>
                <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>
                  &quot;{t.review}&quot;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'rgba(0,229,255,0.12)',
                      border: '1px solid rgba(0,229,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      color: '#00e5ff',
                      fontSize: 16,
                    }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight: 900, color: '#e2e8f0', fontSize: 14 }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(0,255,255,0.08)', padding: '60px 24px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 60, marginBottom: 60 }} className="footer-cols">
            <div style={{ flex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#00e5ff,#2979ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: '#000' }}>
                  CZ
                </div>
                <span style={{ fontWeight: 900, fontSize: 18 }}>CabZee</span>
              </div>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
                The smarter, faster, safer way to ride. Built for the modern commuter.
              </p>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Safety', 'Download'] },
              { title: 'Company', links: ['About', 'Careers', 'Blog', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Contact', 'Privacy', 'Terms'] },
            ].map((col) => (
              <div key={col.title} style={{ flex: 1 }}>
                <p style={{ fontWeight: 900, fontSize: 13, color: '#e2e8f0', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{col.title}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map((l) => (
                    <a key={l} href="#" className="nav-link" style={{ fontSize: 14 }}>
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: '#475569', fontSize: 13 }}>© 2026 CabZee. All rights reserved.</p>
            <p style={{ color: '#475569', fontSize: 13 }}>Built for the future.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
