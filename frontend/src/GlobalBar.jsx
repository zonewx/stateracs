import { useState, useEffect, useRef } from 'react';

export default function GlobalBar({ isDark, authUsername, onNavigate, onLogout }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [profile, setProfile] = useState(null);
  const timerRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    fetch(`/api/users/${authUsername}/profile`, {
      headers: { 'X-User': authUsername }
    }).then(r => r.json()).then(setProfile).catch(() => {});
  }, [authUsername]);

  // Listen for profile updates
  useEffect(() => {
    const handler = () => {
      fetch(`/api/users/${authUsername}/profile`, {
        headers: { 'X-User': authUsername }
      }).then(r => r.json()).then(setProfile).catch(() => {});
    };
    window.addEventListener('profile-updated', handler);
    return () => window.removeEventListener('profile-updated', handler);
  }, [authUsername]);

  function handleSearchInput(e) {
    const q = e.target.value;
    setSearch(q);
    clearTimeout(timerRef.current);
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/users', { headers: { 'X-User': authUsername } });
        const users = await res.json();
        setResults(users.filter(u => u.username.toLowerCase().includes(q.toLowerCase()) || (u.bio || '').toLowerCase().includes(q.toLowerCase())));
      } catch(e) {}
      setSearching(false);
    }, 250);
  }

  function handleSelectUser(username) {
    setSearch(''); setResults([]);
    onNavigate('view-profile', username);
  }

  // Close on outside click
  useEffect(() => {
    const close = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setResults([]); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const avatarContent = profile?.avatarBase64
    ? <img src={profile.avatarBase64} alt="avatar" className="w-full h-full object-cover" />
    : <span className="text-sm font-bold">{authUsername[0].toUpperCase()}</span>;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-4 gap-3 border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      {/* Left — Logo + Home */}
      <button onClick={() => onNavigate('home')} className="flex items-center gap-2 shrink-0 hover:opacity-80 transition">
        <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="6" fill="#0f1e3c"/>
          <path d="M6 18l4-5 4 3 4-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-sm font-bold hidden sm:block">Statera</span>
      </button>

      {/* Middle — Community search */}
      <div ref={searchRef} className="flex-1 max-w-md mx-auto relative">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isDark ? 'text-gray-500' : 'text-gray-400'}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={handleSearchInput}
            placeholder="Search users..."
            className="bg-transparent outline-none flex-1 text-sm placeholder-gray-400"
          />
          {searching && <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0"/>}
        </div>
        {results.length > 0 && (
          <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl overflow-hidden z-50 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {results.map(u => (
              <button key={u.username} onClick={() => handleSelectUser(u.username)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} last:border-0`}>
                <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                  {u.avatarBase64 ? <img src={u.avatarBase64} className="w-full h-full object-cover" /> : u.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold">{u.username}</span>
                  {u.bio && <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{u.bio}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  {u.steamId && <span className="text-xs text-orange-400 bg-orange-900/30 px-1.5 py-0.5 rounded-full">Steam</span>}
                  {u.publicInventory && <span className="text-xs text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded-full">Inv.</span>}
                </div>
              </button>
            ))}
          </div>
        )}
        {search.length >= 2 && !searching && results.length === 0 && (
          <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl px-4 py-3 text-sm ${isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
            No users found for "{search}"
          </div>
        )}
      </div>

      {/* Right — Profile + Logout */}
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => onNavigate('profile')} className="flex items-center gap-2 hover:opacity-80 transition" title="My Profile">
          <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white overflow-hidden">
            {avatarContent}
          </div>
          <span className={`text-xs font-semibold hidden sm:block ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{authUsername}</span>
        </button>
        <button onClick={onLogout} title="Sign out" className={`p-1.5 rounded-lg ${isDark ? 'text-gray-500 hover:text-red-400 hover:bg-gray-800' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'} transition`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
