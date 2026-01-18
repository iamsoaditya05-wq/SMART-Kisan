
import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Sprout, Save, LayoutGrid, Loader2, Key, ExternalLink, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    getProfile();
    checkApiKey();
  }, []);

  async function checkApiKey() {
    try {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    } catch (e) {
      console.error("Key check error:", e);
    }
  }

  async function handleOpenKeySelection() {
    try {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        setHasApiKey(true); // Assume success per instructions
      }
    } catch (e) {
      console.error("Key selection error:", e);
    }
  }

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const localProfile = localStorage.getItem('guest_profile');
        if (localProfile) {
          setProfile(JSON.parse(localProfile));
        } else {
          setProfile({ 
            id: 'demo-user', 
            full_name: 'Krishan Farmer', 
            phone_number: '+91 98765 43210', 
            state: 'Punjab', 
            district: 'Ludhiana', 
            farm_size_acres: 12.5, 
            soil_type: 'Loamy', 
            preferred_crop: 'Wheat' 
          });
        }
        setLoading(false);
        return;
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select(`*`)
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (profileData) {
        setProfile(profileData as UserProfile);
      } else {
        setProfile({ 
          id: user.id, 
          full_name: '', 
          phone_number: '', 
          state: '', 
          district: '', 
          farm_size_acres: 0, 
          soil_type: '', 
          preferred_crop: '' 
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    if (!profile) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        localStorage.setItem('guest_profile', JSON.stringify(profile));
        alert('Guest profile updated locally!');
        setSaving(false);
        return;
      }

      const { error } = await supabase.from('profiles').upsert(profile);
      if (error) throw error;
      alert('Profile synced to cloud successfully!');
    } catch (error) {
      console.error(error);
      alert('Error updating profile data.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin text-emerald-600" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-20">
      <div className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Farmer Profile</h2>
            <p className="text-slate-500 text-sm font-medium">Digital Identity & Farm Details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup label="Full Name" icon={User} value={profile?.full_name} onChange={(v: string) => setProfile(p => p ? {...p, full_name: v} : null)} />
          <InputGroup label="Phone Number" icon={Phone} value={profile?.phone_number} onChange={(v: string) => setProfile(p => p ? {...p, phone_number: v} : null)} />
          <InputGroup label="State" icon={MapPin} value={profile?.state} onChange={(v: string) => setProfile(p => p ? {...p, state: v} : null)} />
          <InputGroup label="District" icon={MapPin} value={profile?.district} onChange={(v: string) => setProfile(p => p ? {...p, district: v} : null)} />
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Farm Size (Acres)</label>
            <div className="relative">
              <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="number" 
                value={profile?.farm_size_acres || 0} 
                onChange={(e) => setProfile(p => p ? {...p, farm_size_acres: parseFloat(e.target.value) || 0} : null)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-emerald-100 outline-none" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Soil Type</label>
            <select 
              value={profile?.soil_type || ''} 
              onChange={(e) => setProfile(p => p ? {...p, soil_type: e.target.value} : null)}
              className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-emerald-100 outline-none appearance-none"
            >
              <option value="">Select Soil</option>
              <option value="Loamy">Loamy</option>
              <option value="Clayey">Clayey</option>
              <option value="Sandy">Sandy</option>
              <option value="Silty">Silty</option>
            </select>
          </div>

          <InputGroup label="Preferred Crop" icon={Sprout} value={profile?.preferred_crop} onChange={(v: string) => setProfile(p => p ? {...p, preferred_crop: v} : null)} />
        </div>

        <button 
          onClick={updateProfile}
          disabled={saving}
          className="mt-10 w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Sync Profile Data
        </button>
      </div>

      <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden relative group">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
               <div className={`p-2 rounded-lg ${hasApiKey ? 'bg-emerald-500' : 'bg-orange-500'} text-white`}>
                 <Key size={20} />
               </div>
               <h3 className="text-xl font-black text-white tracking-tight">Authorize Advanced AI</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              To use **Soil Vision AI** and **Real-Time Market Grounding**, you must connect a paid API key from a billable GCP project. This ensures unlimited access to Gemini 3 Pro features.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button 
                onClick={handleOpenKeySelection}
                className={`px-8 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all ${hasApiKey ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-white text-slate-900 hover:bg-slate-100'}`}
              >
                {hasApiKey ? <ShieldCheck size={18} /> : <Key size={18} />}
                {hasApiKey ? 'Key Connected' : 'Connect Paid Key'}
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                className="px-8 py-3 rounded-xl font-black text-sm flex items-center gap-2 text-slate-400 border border-slate-800 hover:bg-slate-800 transition-all"
              >
                <ExternalLink size={18} /> Billing Info
              </a>
            </div>
          </div>
          <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
            <BotIcon className="text-emerald-500" size={64} />
          </div>
        </div>
      </div>
    </div>
  );
}

const BotIcon = ({ className, size }: any) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
  </svg>
);

const InputGroup = ({ label, icon: Icon, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">{String(label)}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input 
        type="text" 
        value={String(value || '')} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-emerald-100 outline-none" 
      />
    </div>
  </div>
);
