// src/App.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import FilterBar from './Components/FilterBar';
import TripList from './Components/TripList';
import Footer from './Components/Footer';
import SignIn from './Pages/SignIn';
import SignUp from './Pages/SignUp';
import Profile from './Pages/Profile';
import About from './Pages/About';
import Destinations from './Pages/Destinations';
import Guides from './Pages/Guides';
import FAQs from './Pages/FAQs';
import Privacy from './Pages/Privacy';
import Terms from './Pages/Terms';
import Contact from './Pages/Contact';
import { tripsData } from './assets/data.js';
import api from './api';

export default function App() {
  const [maxPrice, setMaxPrice] = useState(3000);
  const [maxDays, setMaxDays] = useState(15);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('none');

  // Simple auth state: store user object
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const reset = () => {
    setMaxPrice(3000);
    setMaxDays(15);
    setQuery('');
    setSortBy('none');
  };

  const filtered = useMemo(() => {
    let list = tripsData.filter(t =>
      t.price <= maxPrice &&
      t.durationDays <= maxDays &&
      (t.name.toLowerCase().includes(query.toLowerCase()) ||
       t.destination.toLowerCase().includes(query.toLowerCase()))
    );

    if (sortBy === 'price-asc') list = list.slice().sort((a,b)=>a.price-b.price);
    if (sortBy === 'price-desc') list = list.slice().sort((a,b)=>b.price-a.price);
    if (sortBy === 'days-asc') list = list.slice().sort((a,b)=>a.durationDays-b.durationDays);
    if (sortBy === 'days-desc') list = list.slice().sort((a,b)=>b.durationDays-a.durationDays);

    return list;
  }, [maxPrice, maxDays, query, sortBy]);

  // basic logout
  const logout = () => setUser(null);

  return (
    <BrowserRouter>
      <div
        className="min-h-screen flex flex-col text-slate-900"
        style={{
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)'
        }}
      >
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold">Trip Planner</Link>
            <nav className="flex items-center gap-4">
              <Link to="/" className="text-sm text-slate-700 hover:text-slate-900">Explore</Link>
              {user ? (
                <>
                  <Link to="/profile" className="text-sm text-slate-700 hover:text-slate-900">Profile</Link>
                  <button onClick={logout} className="text-sm px-3 py-2 bg-slate-100 rounded-md">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="text-sm px-3 py-2 bg-slate-100 rounded-md">Sign In</Link>
                  <Link to="/signup" className="text-sm px-3 py-2 bg-indigo-600 text-white rounded-md">Sign Up</Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">Trip Recommendations</h1>
                    <p className="mt-1 text-sm text-slate-600">Find curated trips — filter by budget and duration.</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-700"><strong className="text-indigo-600">{filtered.length}</strong> results</div>
                    <button onClick={reset} className="hidden md:inline px-3 py-2 rounded-md bg-slate-100 text-slate-800 hover:bg-slate-200">Reset</button>
                  </div>
                </header>

                <FilterBar
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  maxDays={maxDays}
                  setMaxDays={setMaxDays}
                  query={query}
                  setQuery={setQuery}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  onReset={reset}
                />

                <section className="mt-8">
                  <TripList
                    trips={filtered}
                    currentUser={user}
                    onBookingCreated={(booking) => {
                      // no-op for now, but available to update global UI if desired
                      // e.g., show a toast or increment counters
                      console.log('booking created', booking);
                    }}
                  />
                </section>
              </div>
            }/>

            <Route path="/signin" element={<SignIn onLogin={setUser} />} />
            <Route path="/signup" element={<SignUp onSignUp={setUser} />} />
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/signin" replace />} />

            {/* footer pages */}
            <Route path="/about" element={<About />} />
            <Route path="/destinations" element={<Destinations currentUser={user} />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
           </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}