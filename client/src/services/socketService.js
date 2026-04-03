import { io } from 'socket.io-client';

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '';

class SocketService {
  constructor() {
    this.socket = null;
    // Rooms we want to stay subscribed to (so we can re-join on reconnect).
    this.joinedRideIds = new Set();
    this._coreHandlersBound = false;
  }

  connect() {
    // Create the socket once and reuse it. Recreating a new instance during the
    // "connecting" phase can cause missed events and duplicate sockets.
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });
    } else if (this.socket.disconnected) {
      // If it was disconnected, try to reconnect explicitly.
      this.socket.connect();
    }

    this._bindCoreHandlers();
    return this.socket;
  }

  _bindCoreHandlers() {
    if (!this.socket || this._coreHandlersBound) return;
    this._coreHandlersBound = true;

    this.socket.on('connect', () => {
      console.log('[socket] connected:', this.socket.id);
      // Ensure we are in the correct ride rooms after (re)connect.
      for (const rideId of this.joinedRideIds) {
        this.socket.emit('join-ride', rideId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[socket] disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[socket] connect_error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.joinedRideIds.clear();
      this._coreHandlersBound = false;
      console.log('[socket] disconnected manually');
    }
  }

  joinRide(rideId) {
    if (!rideId) return;
    const socket = this.connect();
    this.joinedRideIds.add(rideId);
    // Emit even while connecting; socket.io-client buffers emits by default.
    socket.emit('join-ride', rideId);
    console.log('[socket] join ride:', rideId);
  }

  leaveRide(rideId) {
    if (!rideId) return;
    this.joinedRideIds.delete(rideId);
    if (this.socket) {
      this.socket.emit('leave-ride', rideId);
      console.log('[socket] leave ride:', rideId);
    }
  }

  updateDriverLocation(rideId, latitude, longitude) {
    if (!rideId) return;
    const socket = this.connect();
    socket.emit('driver-location-update', { rideId, latitude, longitude });
  }

  onLocationUpdate(callback) {
    const socket = this.connect();
    socket.on('location-updated', callback);
  }

  onStatusUpdate(callback) {
    const socket = this.connect();
    socket.on('status-updated', callback);
  }

  onOTPVerified(callback) {
    const socket = this.connect();
    socket.on('otp-verification-success', callback);
  }

  notifyRideStatusChange(rideId, status) {
    if (!rideId) return;
    const socket = this.connect();
    socket.emit('ride-status-changed', { rideId, status });
  }

  notifyOTPVerified(rideId) {
    if (!rideId) return;
    const socket = this.connect();
    socket.emit('otp-verified', { rideId });
  }

  bookRide(bookingData) {
    const socket = this.connect();
    socket.emit('book-ride', bookingData);
  }

  removeAllListeners() {
    if (this.socket) {
      // Only remove app-level listeners; keep core connect/reconnect handlers alive.
      this.socket.off('location-updated');
      this.socket.off('status-updated');
      this.socket.off('otp-verification-success');
      this.socket.off('ride-booked-confirmed');
    }
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }
}

const socketService = new SocketService();
export default socketService;

