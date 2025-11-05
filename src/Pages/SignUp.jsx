import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function SignUp({ onSignUp }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { email } });
      const users = Array.isArray(res.data) ? res.data : [];
      if (users.length) {
        alert('User already exists');
        setLoading(false);
        return;
      }
      const create = await api.post('/users', { name, email, password });
      onSignUp(create.data);
      nav('/');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.status
        ? `Sign up failed (server responded ${err.response.status})`
        : 'Sign up failed (could not reach API at http://localhost:4000)';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold mb-4">Create Account</h2>
      <form onSubmit={submit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <label className="block text-sm font-medium text-slate-700">Full name</label>
        <input className="w-full px-3 py-2 border border-slate-200 rounded-md mb-4" value={name} onChange={e=>setName(e.target.value)} required />
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input className="w-full px-3 py-2 border border-slate-200 rounded-md mb-4" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <input type="password" className="w-full px-3 py-2 border border-slate-200 rounded-md mb-4" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="w-full py-2 bg-indigo-600 text-white rounded-md" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
      </form>
    </div>
  );
}