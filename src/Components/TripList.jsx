import React from 'react';
import TripCard from './TripCard';

export default function TripList({ trips, currentUser, onBookingCreated }) {
  if (!trips.length) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800">No trips match your filters</h3>
        <p className="text-sm text-slate-500 mt-2">Try widening your budget or duration.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {trips.map(t =>
        <TripCard
          key={t.id}
          trip={t}
          currentUser={currentUser}
          onBookingCreated={onBookingCreated}
        />
      )}
    </div>
  );
}