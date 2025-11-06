// src/App.jsx
import React, { useMemo, useState, useEffect } from 'react';
import api from './api';
import { tripsData as fallbackTrips } from './assets/data.js';
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
// import {tripsData} from './assets/data.js';

export default function App() {
  const [trips, setTrips] = useState([]);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [maxDays, setMaxDays] = useState(15);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('none');

  // new filters
  const [category, setCategory] = useState('All');
  const [country, setCountry] = useState('All');
  const [minRating, setMinRating] = useState(0);

  // auth state
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
  });

  // server-backed state
  const [favorites, setFavorites] = useState([]); // raw favorite records from API
  const [reviews, setReviews] = useState([]);     // all reviews from API
  const [loading, setLoading] = useState(true);

  // load trips from JSON server (fallback to in-file data)
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get('/tripsdata')
      .then(res => { 
        if (!mounted) return;
        setTrips(Array.isArray(res.data) ? res.data : fallbackTrips);
        setLoading(false);
      })
      .catch(err => { 
        console.error('Failed to load trips from API, using fallback', err);
        if (mounted) {
          setTrips(fallbackTrips);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  // load reviews and favorites when app mounts or user changes
  useEffect(() => {
    const loadAll = async () => {
      try {
        const revRes = await api.get('/reviews');
        setReviews(Array.isArray(revRes.data) ? revRes.data : []);
      } catch (err) {
        console.error('Failed fetching reviews', err);
        setReviews([]);
      }

      if (user) {
        try {
          const favRes = await api.get('/favorites', { params: { userId: user.id } });
          setFavorites(Array.isArray(favRes.data) ? favRes.data : []);
        } catch (err) {
          console.error('Failed fetching favorites', err);
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }
    };
    loadAll();
  }, [user]);

  useEffect(() => { localStorage.setItem('user', JSON.stringify(user)); }, [user]);

  // helper: favorites as tripId array for components
  const favoritesIds = favorites.map(f => Number(f.tripId));

  // toggle favorite for current user — persists to backend
  const toggleFavorite = async (tripId) => {
    if (!user) { alert('Sign in to favorite trips'); return; }
    const existing = favorites.find(f => Number(f.tripId) === Number(tripId) && Number(f.userId) === Number(user.id));
    try {
      if (existing) {
        await api.delete(`/favorites/${existing.id}`);
        setFavorites(prev => prev.filter(f => f.id !== existing.id));
      } else {
        const res = await api.post('/favorites', { userId: user.id, tripId });
        setFavorites(prev => [...prev, res.data]);
      }
    } catch (err) {
      console.error('favorite update failed', err);
      alert('Could not update favorites — try again.');
    }
  };

  // refresh reviews (fetch all)
  const refreshReviews = async () => {
    try {
      const res = await api.get('/reviews');
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to refresh reviews', err);
    }
  };

  // called when a review is added (optimistic UI)
  const handleReviewAdded = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setTimeout(refreshReviews, 500);
  };

  // compute average rating from server reviews with deterministic fallback
  const getAvgRating = (tripId) => {
    try {
      const list = reviews.filter(r => Number(r.tripId) === Number(tripId));
      if (list.length) {
        return Math.round((list.reduce((s, r) => s + (r.rating || 0), 0) / list.length) * 10) / 10;
      }
      const seed = Number(tripId) || 1;
      const frac = ((seed * 9301 + 49297) % 233280) / 233280;
      const base = 3 + frac * 2; // 3.0 .. 5.0
      return Math.round(base * 10) / 10;
    } catch {
      return 0;
    }
  };

  const filtered = useMemo(() => {
    let list = (trips || []).filter(t =>
      t.price <= maxPrice &&
      t.durationDays <= maxDays &&
      (t.name.toLowerCase().includes(query.toLowerCase()) ||
       t.destination.toLowerCase().includes(query.toLowerCase()))
    );

    if (category && category !== 'All') list = list.filter(t => (t.category || 'General') === category);

    if (country && country !== 'All') {
      list = list.filter(t => {
        const parts = (t.destination || '').split(',').map(s => s.trim());
        const c = parts.length ? parts[parts.length - 1] : '';
        return c.toLowerCase() === country.toLowerCase();
      });
    }

    if (minRating > 0) list = list.filter(t => getAvgRating(t.id) >= minRating);

    if (sortBy === 'price-asc') list = list.slice().sort((a,b)=>a.price-b.price);
    if (sortBy === 'price-desc') list = list.slice().sort((a,b)=>b.price-a.price);
    if (sortBy === 'days-asc') list = list.slice().sort((a,b)=>a.durationDays-b.durationDays);
    if (sortBy === 'days-desc') list = list.slice().sort((a,b)=>b.durationDays-a.durationDays);

    return list;
  }, [trips, maxPrice, maxDays, query, sortBy, category, country, minRating, reviews]);

  const resetFilters = () => {
    setMaxPrice(3000); setMaxDays(15); setQuery(''); setSortBy('none'); setCategory('All'); setCountry('All'); setMinRating(0);
  };

  const logout = () => setUser(null);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-slate-900">Trip Planner</Link>
            <nav className="flex items-center gap-4">
              <Link to="/" className="text-sm text-slate-700 hover:text-slate-900">Explore</Link>
              {user ? (
                <>
                  <Link to="/profile" className="text-sm text-slate-700 hover:text-slate-900">Profile</Link>
                  <button onClick={logout} className="text-sm px-3 py-2 bg-slate-100 text-slate-700 hover:text-slate-900 rounded-md">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="text-sm px-3 py-2 bg-slate-100 text-slate-700 hover:text-slate-900 rounded-md">Sign In</Link>
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
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                      Trip Recommendations
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                      Find curated trips — filter by budget, duration and more.
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-700">
                      <strong className="text-indigo-600">{filtered.length}</strong> results
                    </div>
                  </div>
                </header>

                <FilterBar
                  trips={trips}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  maxDays={maxDays}
                  setMaxDays={setMaxDays}
                  query={query}
                  setQuery={setQuery}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  category={category}
                  setCategory={setCategory}
                  country={country}
                  setCountry={setCountry}
                  minRating={minRating}
                  setMinRating={setMinRating}
                  onReset={resetFilters}
                />

                <section className="mt-8">
                  <TripList
                    trips={filtered}
                    loading={loading}
                    currentUser={user}
                    onBookingCreated={(booking) => console.log('booking created', booking)}
                    favorites={favoritesIds}
                    onToggleFavorite={toggleFavorite}
                    getAvgRating={getAvgRating}
                    onReviewAdded={handleReviewAdded}
                  />
                </section>
              </div>
            }/>

            <Route path="/signin" element={<SignIn onLogin={setUser} />} />
            <Route path="/signup" element={<SignUp onSignUp={setUser} />} />
            <Route path="/profile" element={user ? <Profile user={user} favorites={favoritesIds} onToggleFavorite={toggleFavorite} trips={trips} /> : <Navigate to="/signin" replace />} />

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