
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Mail, Lock, LogIn, Sprout, ShieldCheck } from 'lucide-react';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) alert(signUpError.message);
      else alert('Check your email for confirmation!');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center">
        <div className="bg-emerald-500 p-6 rounded-[2.5rem] shadow-2xl inline-block mb-6 shadow-emerald-500/30">
          <Sprout size={48} className="text-white" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter">SMART Kisan</h1>
        <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] mt-2">Intelligent Agriculture Platform</p>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-emerald-900/10">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Farmer Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700" 
                placeholder="email@field.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700" 
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
            Login / Create Account
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest bg-white px-4 text-slate-300">Or Connect With</div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
          Sign in with Google
        </button>
      </div>

      <div className="mt-12 flex items-center gap-2 text-emerald-500/50">
        <ShieldCheck size={14} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Cloud Storage & Ledger</span>
      </div>
    </div>
  );
};

export default Login;
