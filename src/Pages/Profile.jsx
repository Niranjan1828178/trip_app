import React, { useEffect, useState, useMemo } from 'react';
import api from '../api';
import { tripsData } from '../assets/data.js';
import Modal from '../Components/Modal';

function initials(name = '') {
  return name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
}

export default function Profile({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // new: modal state for booking details
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/bookings', { params: { userId: user.id } });
        setBookings(res.data || []);
      } catch (err) {
        console.error(err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(prev => prev.filter(b => b.id !== id));
      // if the deleted booking is currently shown in modal, close it
      if (selectedBooking?.id === id) {
        setShowDetails(false);
        setSelectedBooking(null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to cancel booking');
    } finally {
      setDeletingId(null);
    }
  };

  const stats = useMemo(() => {
    const total = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
    const upcoming = bookings.filter(b => new Date(b.startDate) > new Date()).length;
    return { total, count: bookings.length, upcoming };
  }, [bookings]);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl">
          {initials(user.name)}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xl font-semibold text-slate-900">{user.name}</div>
              <div className="text-sm text-slate-600">{user.email}</div>
            </div>

            <div className="flex gap-4">
              <div className="text-sm text-slate-500 text-right">
                <div className="text-xs">Bookings</div>
                <div className="font-semibold text-slate-900">{stats.count}</div>
              </div>
              <div className="text-sm text-slate-500 text-right">
                <div className="text-xs">Upcoming</div>
                <div className="font-semibold text-slate-900">{stats.upcoming}</div>
              </div>
              <div className="text-sm text-slate-500 text-right">
                <div className="text-xs">Total spent</div>
                <div className="font-semibold text-slate-900">${stats.total}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-3">Booking History</h3>
      <div className="space-y-4">
        {loading ? <div>Loading...</div> : bookings.length === 0 ? (
          <div className="text-sm text-slate-500">No bookings yet. Book a trip to get started.</div>
        ) : bookings.map(b => {
          const trip = tripsData.find(t => t.id === b.tripId) || {};
          return (
            <div key={b.id} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-28 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  <img src={trip.image || 'https://via.placeholder.com/320x160?text=Trip'} alt={b.tripName} className="w-full h-full object-cover" />
                </div>

                <div>
                  <div className="font-semibold text-slate-900">{b.tripName}</div>
                  <div className="text-sm text-slate-500">{b.destination} • {b.numTravelers} traveler{b.numTravelers>1?'s':''}</div>
                  <div className="text-xs text-slate-400">{new Date(b.date).toLocaleString()}</div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="font-bold">${b.totalPrice}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => cancelBooking(b.id)}
                    disabled={deletingId === b.id}
                    className="text-sm px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                  >
                    {deletingId === b.id ? 'Cancelling...' : 'Cancel'}
                  </button>

                  {/* open details modal for this booking */}
                  <button
                    onClick={() => { setSelectedBooking(b); setShowDetails(true); }}
                    className="text-sm px-3 py-1 border rounded-md bg-slate-50 hover:bg-slate-100"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Details Modal */}
      <Modal isOpen={showDetails} onClose={() => { setShowDetails(false); setSelectedBooking(null); }}>
        {selectedBooking && (() => {
          const trip = tripsData.find(t => t.id === selectedBooking.tripId) || {};
          return (
            <div className="max-w-xl">
              <div className="flex gap-4">
                <div className="w-36 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={trip.image || 'https://via.placeholder.com/320x160?text=Trip'} alt={selectedBooking.tripName} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1">
                  <div className="text-lg font-semibold text-slate-900">{selectedBooking.tripName}</div>
                  <div className="text-sm text-slate-500 mb-2">{selectedBooking.destination}</div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                    <div>
                      <div className="text-xs">Start</div>
                      <div className="font-medium">{selectedBooking.startDate || '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs">Booked on</div>
                      <div className="font-medium">{new Date(selectedBooking.date).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs">Travelers</div>
                      <div className="font-medium">{selectedBooking.numTravelers}</div>
                    </div>
                    <div>
                      <div className="text-xs">Total</div>
                      <div className="font-medium">${selectedBooking.totalPrice}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => { setShowDetails(false); setSelectedBooking(null); }}
                  className="px-4 py-2 border rounded-md"
                >
                  Close
                </button>

                <button
                  onClick={() => cancelBooking(selectedBooking.id)}
                  disabled={deletingId === selectedBooking.id}
                  className="px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                >
                  {deletingId === selectedBooking.id ? 'Cancelling...' : 'Cancel booking'}
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}