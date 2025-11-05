import React from 'react';

export default function FilterBar({ maxPrice, setMaxPrice, maxDays, setMaxDays, query, setQuery, sortBy, setSortBy, onReset }) {
  return (
    <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-5 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-end">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
          <input
            type="text"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            placeholder="Destination or trip name"
            className="w-full px-3 py-2 rounded-md border border-slate-200 focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 md:col-span-1">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Max Budget ($)</label>
            <div className="flex gap-3 items-center">
              <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={maxPrice}
                onChange={(e)=>setMaxPrice(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div className="mt-2 text-sm text-slate-500">${maxPrice}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Max Days</label>
            <div className="flex gap-3 items-center">
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={maxDays}
                onChange={(e)=>setMaxDays(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div className="mt-2 text-sm text-slate-500">{maxDays} days</div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Sort</label>
          <select
            value={sortBy}
            onChange={(e)=>setSortBy(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-200"
          >
            <option value="none">Best match</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="days-asc">Days: Short → Long</option>
            <option value="days-desc">Days: Long → Short</option>
          </select>
          
        </div>
      </div>
    </div>
  );
}