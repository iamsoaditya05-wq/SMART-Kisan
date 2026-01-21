import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplets, Thermometer, FlaskConical, RefreshCw, Info, Sprout, Sparkles, Waves, Zap, BrainCircuit, Loader2, Gauge, CheckCircle2, ChevronRight, Beaker, Camera, Upload, BarChart3, PieChart, ShieldCheck, Globe, Key, ShieldAlert, Binary
} from 'lucide-react';
import { getNpkFertilizerAdvice, detectSoilTypeFromImage, analyzeCropHealth } from '../services/geminiService';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell, Legend, PieChart as RePieChart, Pie
} from 'recharts';
import { supabase } from '../lib/supabase';

export default function FarmFlow({ language }: { language: string }) {
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [npkHistory, setNpkHistory] = useState<any[]>([]);
  const [aiNutrientAdvice, setAiNutrientAdvice] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isGrounded, setIsGrounded] = useState(false);
  const [authError, setAuthError] = useState(false);
  
  // Soil Analysis States
  const [soilImage, setSoilImage] = useState<string | null>(null);
  const [isDetectingSoil, setIsDetectingSoil] = useState(false);
  const [soilComposition, setSoilComposition] = useState<any>(null);
  const soilInputRef = useRef<HTMLInputElement>(null);

  // Crop Health Vision States
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [isAnalyzingCrop, setIsAnalyzingCrop] = useState(false);
  const [cropHealthResult, setCropHealthResult] = useState<any>(null);
  const cropInputRef = useRef<HTMLInputElement>(null);

  // Default target NPK (will be updated by web search)
  const [targetNPK, setTargetNPK] = useState({ N: 100, P: 60, K: 80 });

  useEffect(() => {
    fetchProfileAndData();
    const channel = supabase
      .channel('npk_realtime_stream')
      .on('postgres_changes', { event: 'INSERT', table: 'npk_readings' }, (payload) => {
        const newReading = payload.new;
        setNpkHistory(prev => [...prev.slice(-9), {
          time: new Date(newReading.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          N: newReading.n_value,
          P: newReading.p_value,
          K: newReading.k_value,
          pH: newReading.ph_value || 6.8
        }]);
        setSelectedPlot(newReading);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchProfileAndData = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      const localProfile = localStorage.getItem('guest_profile');
      // Set default regional benchmark to Bhopal, MP
      const baseProfile = localProfile ? JSON.parse(localProfile) : { preferred_crop: "Soybean", soil_type: "Black Soil", district: "Bhopal", state: "Madhya Pradesh" };

      if (user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        setProfile(prof || baseProfile);
        const { data: readings } = await supabase.from('npk_readings').select('*').eq('user_id', user.id).order('captured_at', { ascending: true }).limit(10);
        
        if (readings && readings.length > 0) {
          setNpkHistory(readings.map(r => ({
            time: new Date(r.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            N: r.n_value,
            P: r.p_value,
            K: r.k_value,
            pH: r.ph_value || 6.8
          })));
          setSelectedPlot(readings[readings.length - 1]);
        } else {
          setSelectedPlot({ n_value: 45, p_value: 32, k_value: 68, ph_value: 6.8 });
        }
      } else {
        setProfile(baseProfile);
        setSelectedPlot({ n_value: 45, p_value: 32, k_value: 68, ph_value: 6.8 });
        setNpkHistory([{ time: '08:00', N: 40, P: 30, K: 60, pH: 6.5 }, { time: '12:00', N: 45, P: 32, K: 68, pH: 6.8 }]);
      }
    } catch (e) {
      console.error("Telemetry fetch error:", e);
    }
  };

  const onSoilImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setSoilImage(base64);
        setIsDetectingSoil(true);
        setAuthError(false);
        try {
          const base64Data = base64.split(',')[1];
          const result = await detectSoilTypeFromImage(base64Data, language);
          setSoilComposition(result);
          setIsGrounded(true);
          handleDeepNutrientAnalysis(result.type, result.analysis);
        } catch (error: any) {
          if (error.message?.includes("AUTH_REQUIRED")) setAuthError(true);
          else alert("Soil analysis failed.");
        } finally {
          setIsDetectingSoil(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setCropImage(base64);
        setIsAnalyzingCrop(true);
        try {
          const base64Data = base64.split(',')[1];
          const result = await analyzeCropHealth(base64Data, language);
          setCropHealthResult(result);
        } catch (error) {
          alert("Crop analysis failed.");
        } finally {
          setIsAnalyzingCrop(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeepNutrientAnalysis = async (detectedSoilType?: string, visionContext?: string) => {
    setIsAnalyzing(true);
    try {
      const soilType = detectedSoilType || profile?.soil_type || "Black Soil";
      const advice = await getNpkFertilizerAdvice(
        selectedPlot?.n_value || 0, selectedPlot?.p_value || 0, selectedPlot?.k_value || 0,
        profile?.preferred_crop || "Soybean", soilType, "Bhopal, Madhya Pradesh", language, visionContext
      );
      setAiNutrientAdvice(String(advice || 'Analysis complete.'));
    } catch (e: any) {
      if (e.message?.includes("AUTH_REQUIRED")) setAuthError(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const soilTypePieData = soilComposition ? [
    { name: 'Sand', value: soilComposition.sand, color: '#fcd34d' },
    { name: 'Clay', value: soilComposition.clay, color: '#fb923c' },
    { name: 'Silt', value: soilComposition.silt, color: '#94a3b8' },
  ] : [
    { name: 'Sand', value: 33, color: '#fcd34d' },
    { name: 'Clay', value: 33, color: '#fb923c' },
    { name: 'Silt', value: 34, color: '#94a3b8' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {authError && (
        <div className="bg-orange-50 border border-orange-200 p-6 rounded-[2rem] flex items-center gap-6 animate-fadeIn">
          <Key size={32} className="text-orange-600" />
          <div className="flex-1"><h4 className="font-black">Paid API Key Required</h4><p className="text-sm">Connect a paid key in 'My Profile'.</p></div>
        </div>
      )}

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Sprout className="text-emerald-500" /> Crop Pattern Vision AI
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Anomaly Detection</p>
          </div>
          <button 
            onClick={() => cropInputRef.current?.click()}
            className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg hover:bg-emerald-600 transition-all"
          >
            <Camera size={16} /> Scan Field Patterns
          </button>
          <input type="file" ref={cropInputRef} className="hidden" accept="image/*" onChange={onCropImageChange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative aspect-video rounded-[2rem] bg-slate-50 overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center min-h-[300px]">
             {cropImage ? (
               <img src={cropImage} alt="Crop" className="w-full h-full object-cover" />
             ) : (
               <div className="text-center p-6"><Upload className="mx-auto text-slate-300 mb-2" size={40} /><p className="text-xs font-bold text-slate-400">Capture Crop Patterns</p></div>
             )}
             {isAnalyzingCrop && <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-white" size={40} /></div>}
          </div>
          <div className="space-y-4">
             {cropHealthResult ? (
               <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 h-full">
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full">{cropHealthResult.status}</span>
                    <div className="flex items-center gap-2 text-emerald-600 font-black">
                      <Binary size={16} />
                      <span>{cropHealthResult.confidence_pct}% Confidence</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 italic mb-6">"{cropHealthResult.analysis}"</p>
                  <div className="space-y-2">
                    {cropHealthResult.recommendations?.map((rec: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <CheckCircle2 size={14} className="text-emerald-500" /> {rec}
                      </div>
                    ))}
                  </div>
               </div>
             ) : (
               <div className="bg-slate-50 p-10 rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center h-full">
                 <ShieldAlert size={48} className="text-slate-200 mb-2" />
                 <p className="text-[10px] font-black text-slate-400 uppercase">Pattern Engine Standby</p>
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div><h3 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Camera className="text-emerald-500" /> Soil Vision Analysis</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Central India Benchmark Data</p></div>
          <button onClick={() => soilInputRef.current?.click()} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg"><Camera size={16} /> Analyze Sample</button>
          <input type="file" ref={soilInputRef} className="hidden" accept="image/*" onChange={onSoilImageChange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative aspect-video rounded-[2rem] bg-slate-50 overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center min-h-[300px]">
             {soilImage ? <img src={soilImage} alt="Soil" className="w-full h-full object-cover" /> : <div className="text-center p-6"><Upload className="mx-auto text-slate-300 mb-2" size={40} /><p className="text-xs font-bold text-slate-400">Capture Soil for Web Analysis</p></div>}
             {isDetectingSoil && <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-white" size={40} /></div>}
          </div>
          <div className="bg-slate-50 p-6 rounded-[2rem] h-full flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><PieChart className="text-emerald-600" size={20} /><h4 className="text-xs font-black uppercase tracking-widest text-slate-500">{soilComposition ? `${soilComposition.type} Profile` : 'Soil Composition'}</h4></div></div>
            <div className="flex-1 flex flex-col md:flex-row items-center justify-around gap-4 min-h-[200px]">
              <div className="h-44 w-44 min-h-[176px] min-w-[176px]">
                <ResponsiveContainer width="100%" height="100%"><RePieChart><Pie data={soilTypePieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value">{soilTypePieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip /></RePieChart></ResponsiveContainer>
              </div>
              <div className="space-y-2">{soilTypePieData.map((s, i) => (<div key={i} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: s.color}}></div><span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{s.name}: {s.value}%</span></div>))}</div>
            </div>
            {soilComposition && <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-200 animate-fadeIn"><p className="text-xs text-slate-700 leading-relaxed font-medium italic">{soilComposition.analysis}</p></div>}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div><h3 className="text-2xl font-black text-slate-900">Soil Monitoring Stream</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Sensor Pattern Tracking</p></div>
        </div>
        <div className="h-64 w-full min-h-[256px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={npkHistory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
              <Tooltip contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
              <Line type="monotone" dataKey="N" stroke="#10b981" strokeWidth={4} dot={{r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} />
              <Line type="monotone" dataKey="P" stroke="#3b82f6" strokeWidth={4} dot={{r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} />
              <Line type="monotone" dataKey="K" stroke="#a855f7" strokeWidth={4} dot={{r: 5, fill: '#a855f7', strokeWidth: 2, stroke: '#fff'}} />
              <Line type="monotone" dataKey="pH" stroke="#f59e0b" strokeWidth={4} dot={{r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden h-full min-h-[400px]">
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-2xl font-black mb-2 flex items-center gap-2"><Sparkles className="text-emerald-400" /> AI Nutrient Strategist</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium">Bhopal Hub Decision Engine</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <NPKStat label="N" val={selectedPlot?.n_value || 0} color="text-emerald-400" />
              <NPKStat label="P" val={selectedPlot?.p_value || 0} color="text-blue-400" />
              <NPKStat label="pH" val={selectedPlot?.ph_value || 6.8} color="text-amber-400" />
            </div>
            <button onClick={() => handleDeepNutrientAnalysis(soilComposition?.type, soilComposition?.analysis)} disabled={isAnalyzing} className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/30 mt-auto">
              {isAnalyzing ? <RefreshCw className="animate-spin" /> : <BrainCircuit />} {isAnalyzing ? "Analyzing Regional Patterns..." : "Prescribe Solution"}
            </button>
          </div>
          <Waves className="absolute right-[-40px] bottom-[-40px] text-white/5 w-64 h-64" />
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-emerald-100 shadow-sm animate-fadeIn flex flex-col h-full min-h-[400px]">
          {aiNutrientAdvice ? (
            <div className="flex flex-col h-full"><h4 className="text-xl font-black text-slate-900 mb-6">Regional Prescription Plan</h4><div className="flex-1 overflow-y-auto pr-2 custom-scrollbar"><div className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{aiNutrientAdvice}</div></div></div>
          ) : (
            <div className="bg-slate-50 p-10 rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center h-full"><FlaskConical size={32} className="text-slate-300 mb-6" /><h4 className="text-lg font-black text-slate-400 uppercase">Strategist Standby</h4></div>
          )}
        </div>
      </div>
    </div>
  );
}

const NPKStat = ({ label, val, color }: any) => (
  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{label}</p>
    <p className={`text-xl font-black ${color}`}>{val}</p>
  </div>
);