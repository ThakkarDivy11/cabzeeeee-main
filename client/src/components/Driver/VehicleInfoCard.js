import React from 'react';

const VehicleInfoCard = ({ onAddVehicle }) => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      padding: '40px',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '40px auto',
      position: 'relative',
    }}>
      <div style={{ marginBottom: '24px' }}>
        <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="12" width="24" height="24" rx="4" stroke="#A0AEC0" strokeWidth="2" fill="#F7FAFC" />
          <path d="M20 20h8v2h-8v-2zm0 6h8v2h-8v-2z" fill="#A0AEC0" />
        </svg>
      </div>
      <h2 style={{ fontWeight: 600, fontSize: '20px', marginBottom: '8px' }}>No vehicle information</h2>
      <p style={{ color: '#4A5568', marginBottom: '32px' }}>
        Add your vehicle details to start accepting rides.
      </p>
      <button
        onClick={onAddVehicle}
        style={{
          background: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontWeight: 600,
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        Add Vehicle Details
      </button>
    </div>
  );
};

export default VehicleInfoCard;
