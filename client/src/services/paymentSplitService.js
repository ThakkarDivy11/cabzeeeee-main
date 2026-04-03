const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';

async function handleResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.message || 'Request failed';
    throw new Error(message);
  }
  return payload;
}

export async function createPaymentSplit({ rideId, totalAmount, paymentStatus = 'completed', notes = '' }) {
  const resp = await fetch(`${apiBase}/api/payments/split`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ rideId, totalAmount, paymentStatus, notes })
  });
  return handleResponse(resp);
}

export async function fetchAdminCommissionSummary() {
  const resp = await fetch(`${apiBase}/api/payments/split/summary/admin`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return handleResponse(resp);
}

export async function fetchDriverEarningsSummary() {
  const resp = await fetch(`${apiBase}/api/payments/split/summary/driver`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return handleResponse(resp);
}
