import React from 'react';

/* ── Skeleton shape helpers — match the shape of real content ── */
export const SkeletonLine = ({ width = '100%', height = '12px', className = '' }) => (
  <div
    className={`skeleton rounded ${className}`}
    style={{ width, height }}
  />
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`skeleton rounded-2xl ${className}`} style={{ height: '140px' }} />
);

export const SkeletonKPI = ({ className = '' }) => (
  <div className={`p-6 bg-white rounded-2xl border border-navy/5 space-y-3 ${className}`}>
    <SkeletonLine width="40%" height="10px" />
    <SkeletonLine width="55%" height="32px" className="mt-2" />
    <SkeletonLine width="30%" height="10px" />
  </div>
);

export const SkeletonListItem = ({ className = '' }) => (
  <div className={`flex items-center gap-4 p-4 ${className}`}>
    <div className="skeleton rounded-full flex-shrink-0" style={{ width: 40, height: 40 }} />
    <div className="flex-1 space-y-2">
      <SkeletonLine width="60%" height="12px" />
      <SkeletonLine width="40%" height="10px" />
    </div>
    <SkeletonLine width="60px" height="10px" />
  </div>
);

/* ── Main Loader Component ── */
const Loader = ({ fullScreen = true, size = 'medium', text = '' }) => {
  /* For full-screen, show skeleton shimmer overlay */
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-4">
          {/* Animated logo mark */}
          <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center shadow-navy relative overflow-hidden">
            <span className="text-soft-white text-2xl font-black font-outfit leading-none">C</span>
            {/* shimmer sweep on logo */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </div>
          {text && (
            <p className="text-navy/40 font-semibold text-sm tracking-wide">{text}</p>
          )}
        </div>
        {/* Skeleton card previews below */}
        <div className="flex gap-3 opacity-40">
          {[80, 100, 60].map((w, i) => (
            <div
              key={i}
              className="skeleton rounded-xl"
              style={{ width: w, height: 6 }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* Inline shimmer strip */
  const heights = { small: 24, medium: 40, large: 64 };
  return (
    <div className="w-full flex flex-col items-center justify-center p-8 gap-3">
      <div
        className="skeleton rounded-xl"
        style={{ width: heights[size] * 3, height: heights[size] }}
      />
      {text && <p className="text-navy/30 text-xs font-medium">{text}</p>}
    </div>
  );
};

export default Loader;
