import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function TripCard({ trip, currentUser, onBookingCreated }) {
  const navigate = useNavigate();
   const { id, name, image, price, durationDays, description, destination } = trip;
   const [showDetails, setShowDetails] = useState(false);
   const [showBooking, setShowBooking] = useState(false);

  // booking form state
  const [numTravelers, setNumTravelers] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const totalPrice = price * Math.max(1, numTravelers);

  useEffect(() => {
    // prefill if user present
    if (currentUser) {
      setFullName(currentUser.name || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      // redirect to sign-in if user somehow reaches submit without being signed in
      navigate('/signin');
      return;
    }
    setSubmitting(true);
    const payload = {
      userId: currentUser.id,
      tripId: id,
      tripName: name,
      destination,
      numTravelers,
      startDate,
      totalPrice,
      date: new Date().toISOString()
    };

    try {
      const res = await api.post('/bookings', payload);
      setSuccessData(res.data);
      onBookingCreated?.(res.data);
    } catch (err) {
      console.error(err);
      alert('Booking failed — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeBooking = () => {
    setShowBooking(false);
    setSuccessData(null);
    setNumTravelers(1);
    setStartDate('');
  };

  return (
    <>
      <article className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100 flex flex-col hover:shadow-xl transition">
        <div className="w-full h-56 sm:h-64 md:h-56 lg:h-64 relative">
          <img src={image} alt={name} className="w-full h-full object-cover object-center" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute left-4 bottom-4 bg-white/90 px-3 py-1 rounded-full text-xs font-medium text-slate-800">
            {durationDays}d • ${Math.round(price / Math.max(1, durationDays))}/day
          </div>
          <div className="absolute right-4 top-4 bg-white/90 px-3 py-1 rounded-full text-xs font-medium text-slate-800">
            {destination}
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{name}</h3>
            <p className="text-sm text-slate-500 mt-2 line-clamp-3">{description}</p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-indigo-600">${price}</div>
              <div className="text-xs text-slate-400">total</div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowDetails(true)} className="px-3 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50">Details</button>
              <button
                onClick={() => {
                  if (!currentUser) {
                    navigate('/signin');
                  } else {
                    setShowBooking(true);
                  }
                }}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Book
              </button>
             </div>
           </div>
         </div>
       </article>

      {/* Details Modal */}
      <Modal isOpen={showDetails} onClose={() => setShowDetails(false)}>
        <div className="p-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 rounded-lg overflow-hidden">
              <img src={image} alt={name} className="w-full h-48 object-cover" />
            </div>

            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{name}</h2>
              <p className="text-slate-600 mb-4">{description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-slate-600">Duration</div>
                  <div className="text-lg font-semibold text-slate-900">{durationDays} days</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-slate-600">Price per day</div>
                  <div className="text-lg font-semibold text-slate-900">${Math.round(price / Math.max(1, durationDays))}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Booking Modal */}
      <Modal isOpen={showBooking} onClose={() => { if (!submitting) closeBooking(); }}>
        {successData ? (
          <div className="text-center">
            <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 mb-4">
              ✓
            </div>
            <h3 className="text-xl font-semibold mb-2">Booking Confirmed</h3>
            <p className="text-sm text-slate-600 mb-4">Your booking for <strong>{name}</strong> is confirmed.</p>

            <div className="bg-slate-50 p-4 rounded-lg text-left mb-4">
              <div className="text-sm text-slate-500">Booking ID</div>
              <div className="font-medium">{successData.id ?? '—'}</div>
              <div className="mt-2 text-sm text-slate-500">Start</div>
              <div className="font-medium">{successData.startDate || startDate || '—'}</div>
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={() => { closeBooking(); window.location.href = '/profile'; }} className="px-4 py-2 bg-indigo-600 text-white rounded-md">View Bookings</button>
              <button onClick={closeBooking} className="px-4 py-2 border rounded-md">Done</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="rounded-lg overflow-hidden">
              <img src={image} alt={name} className="w-full h-56 object-cover" />
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="text-sm text-slate-500">Trip</div>
                <div className="font-semibold">{name}</div>
                <div className="mt-2 text-sm text-slate-400">{destination} • {durationDays} days</div>
              </div>
            </div>

            <form onSubmit={submitBooking} className="space-y-4 bg-white">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} type="text" required className="w-full px-3 py-2 border border-slate-200 rounded-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="w-full px-3 py-2 border border-slate-200 rounded-md" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input value={startDate} onChange={e => setStartDate(e.target.value)} type="date" required className="w-full px-3 py-2 border border-slate-200 rounded-md" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Travelers</label>
                  <select value={numTravelers} onChange={e => setNumTravelers(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-md">
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n===1 ? 'person' : 'people'}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-slate-600">Subtotal</div>
                  <div className="text-sm text-slate-800">${(price * Math.max(1, numTravelers)).toFixed(2)}</div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-slate-600">Taxes & fees</div>
                  <div className="text-sm text-slate-800">${(Math.round((totalPrice * 0.08) * 100) / 100).toFixed(2)}</div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-slate-600">Total</div>
                  <div className="text-2xl font-bold text-slate-900">${(totalPrice + Math.round(totalPrice * 0.08)).toFixed(2)}</div>
                </div>

                <button type="submit" disabled={submitting} className="w-full py-3 bg-indigo-600 text-white rounded-md">
                  {submitting ? 'Processing…' : 'Confirm booking'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </>
  );
}