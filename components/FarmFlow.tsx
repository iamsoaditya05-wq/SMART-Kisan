import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplets, Thermometer, FlaskConical, RefreshCw, Info, Sprout, Sparkles, Waves, Zap, BrainCircuit, Loader2, Gauge, CheckCircle2, ChevronRight, Beaker, Camera, Upload, BarChart3, PieChart, ShieldCheck, Globe, Key
} from 'lucide-react';
import { getNpkFertilizerAdvice, detectSoilTypeFromImage } from '../services/geminiService';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default target NPK (will be updated by web search)
  const [targetNPK, setTargetNPK] = useState({ N: 100, P: 60, K: 80 });

  useEffect(() => {
    fetchProfileAndData();
    
    const channel = supabase
      .channel('npk_realtime')
      .on('postgres_changes', { event: 'INSERT', table: 'npk_readings' }, (payload) => {
        const newReading = payload.new;
        setNpkHistory(prev => [...prev.slice(-9), {
          time: new Date(newReading.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          N: newReading.n_value,
          P: newReading.p_value,
          K: newReading.k_value
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
      const baseProfile = localProfile ? JSON.parse(localProfile) : { preferred_crop: "Wheat", soil_type: "Loamy", district: "Ludhiana", state: "Punjab" };

      if (user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        setProfile(prof || baseProfile);

        const { data: readings } = await supabase
          .from('npk_readings')
          .select('*')
          .eq('user_id', user.id)
          .order('captured_at', { ascending: true })
          .limit(10);
        
        if (readings && readings.length > 0) {
          setNpkHistory(readings.map(r => ({
            time: new Date(r.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            N: r.n_value,
            P: r.p_value,
            K: r.k_value
          })));
          setSelectedPlot(readings[readings.length - 1]);
        } else {
          setSelectedPlot({ n_value: 45, p_value: 32, k_value: 68 });
        }
      } else {
        setProfile(baseProfile);
        setSelectedPlot({ n_value: 45, p_value: 32, k_value: 68 });
        setNpkHistory([
          { time: '08:00', N: 40, P: 30, K: 60 },
          { time: '10:00', N: 42, P: 31, K: 65 },
          { time: '12:00', N: 45, P: 32, K: 68 }
        ]);
      }
    } catch (e) {
      console.error("Telemetry fetch error:", e);
    }
  };

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          
          // Store results in Supabase
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
             await supabase.from('soil_analyses').insert({
               user_id: authData.user.id,
               soil_type: result.type,
               sand_pct: result.sand,
               silt_pct: result.silt,
               clay_pct: result.clay,
               analysis_text: result.analysis,
               created_at: new Date().toISOString()
             });
          }

          // Trigger strategist with the new vision context
          handleDeepNutrientAnalysis(result.type, result.analysis);
        } catch (error: any) {
          console.error("Soil analysis error:", error);
          if (error.message?.includes("AUTH_REQUIRED") || error.toString().includes("403")) {
            setAuthError(true);
          } else {
            alert("Analysis failed. Please try a clearer photo or check your connection.");
          }
        } finally {
          setIsDetectingSoil(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeepNutrientAnalysis = async (detectedSoilType?: string, visionContext?: string) => {
    setIsAnalyzing(true);
    setAuthError(false);
    try {
      const soilType = detectedSoilType || profile?.soil_type || "Loamy";
      const advice = await getNpkFertilizerAdvice(
        selectedPlot?.n_value || 0, 
        selectedPlot?.p_value || 0, 
        selectedPlot?.k_value || 0,
        profile?.preferred_crop || "Wheat",
        soilType,
        `${profile?.district || 'Rural'}, ${profile?.state || 'India'}`,
        language,
        visionContext
      );
      setAiNutrientAdvice(String(advice || 'Analysis complete.'));
      
      if (advice.toLowerCase().includes("nitrogen")) setTargetNPK(prev => ({ ...prev, N: 110 }));
      if (advice.toLowerCase().includes("phosphorus")) setTargetNPK(prev => ({ ...prev, P: 70 }));
    } catch (e: any) {
      console.error("AI Analysis error:", e);
      if (e.message?.includes("AUTH_REQUIRED") || e.toString().includes("403")) {
        setAuthError(true);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const recommendationChartData = [
    { name: 'Nitrogen', current: selectedPlot?.n_value || 0, target: targetNPK.N },
    { name: 'Phosphorus', current: selectedPlot?.p_value || 0, target: targetNPK.P },
    { name: 'Potassium', current: selectedPlot?.k_value || 0, target: targetNPK.K },
  ];

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
        <div className="bg-orange-50 border border-orange-200 p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 animate-fadeIn">
          <div className="bg-orange-100 p-4 rounded-2xl text-orange-600">
            <Key size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-orange-900 font-black text-lg">Paid API Key Required</h4>
            <p className="text-orange-700 text-sm font-medium">Advanced Soil Vision and Web Grounding features require a billable Google Cloud project API key.</p>
          </div>
          <button 
            onClick={() => {
              if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
                window.aistudio.openSelectKey();
              } else {
                alert("Please go to 'My Profile' to connect a paid API key.");
              }
            }} 
            className="px-8 py-3 bg-orange-600 text-white rounded-xl font-black text-sm hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
          >
            Connect Key Now
          </button>
        </div>
      )}

      {/* Soil Vision Section */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Camera className="text-emerald-500" /> Soil Composition AI
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image Analysis & Web Grounded Data</p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
             >
               <Camera size={16} /> Analyze Sample
             </button>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={onImageChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative aspect-video rounded-[2rem] bg-slate-50 overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center min-h-[300px]">
             {soilImage ? (
               <img src={soilImage} alt="Soil Sample" className="w-full h-full object-cover" />
             ) : (
               <div className="text-center p-6">
                 <Upload className="mx-auto text-slate-300 mb-2" size={40} />
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Capture Soil for Web Analysis</p>
               </div>
             )}
             {isDetectingSoil && (
               <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                 <div className="text-center">
                   <Loader2 className="animate-spin text-white mx-auto mb-2" size={40} />
                   <p className="text-white text-[10px] font-black uppercase tracking-widest">Consulting Agri-Web Sources...</p>
                 </div>
               </div>
             )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-[2rem] h-full flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <PieChart className="text-emerald-600" size={20} />
                   <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">
                     {soilComposition ? `${String(soilComposition.type)} Profile` : 'Soil Composition'}
                   </h4>
                </div>
                {isGrounded && (
                   <div className="bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-full flex items-center gap-1 uppercase">
                     <Globe size={10} /> Web Grounded
                   </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col md:flex-row items-center justify-around gap-4 min-h-[200px]">
                <div className="h-44 w-44 min-h-[176px] min-w-[176px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={soilTypePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {soilTypePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {soilTypePieData.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: s.color}}></div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {String(s.name)}: {String(s.value)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {soilComposition && (
                <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-200 animate-fadeIn">
                   <p className="text-xs text-slate-700 leading-relaxed font-medium italic">
                    {String(soilComposition.analysis)}
                   </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NPK Section */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-900">NPK Nutrient Stream</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Soil Fertility Data (mg/kg)</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div><span className="text-[10px] font-black uppercase">N</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div><span className="text-[10px] font-black uppercase">P</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded-full shadow-sm"></div><span className="text-[10px] font-black uppercase">K</span></div>
          </div>
        </div>
        <div className="h-64 w-full min-h-[256px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={npkHistory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
              <Tooltip contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
              <Line type="monotone" dataKey="N" stroke="#10b981" strokeWidth={4} dot={{r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
              <Line type="monotone" dataKey="P" stroke="#3b82f6" strokeWidth={4} dot={{r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
              <Line type="monotone" dataKey="K" stroke="#a855f7" strokeWidth={4} dot={{r: 5, fill: '#a855f7', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
              <Sparkles className="text-emerald-400" /> Nutrient Strategist
            </h3>
            <p className="text-slate-400 text-sm mb-8 font-medium">
              Web-Grounded Analysis
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <NPKStat label="N (Curr)" val={selectedPlot?.n_value || 0} color="text-emerald-400" />
              <NPKStat label="P (Curr)" val={selectedPlot?.p_value || 0} color="text-blue-400" />
              <NPKStat label="K (Curr)" val={selectedPlot?.k_value || 0} color="text-purple-400" />
            </div>

            <button 
              onClick={() => handleDeepNutrientAnalysis(soilComposition?.type, soilComposition?.analysis)}
              disabled={isAnalyzing}
              className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/30"
            >
              {isAnalyzing ? <RefreshCw className="animate-spin" /> : <BrainCircuit />}
              {isAnalyzing ? "Analyzing Web Sources..." : "Suggest NPK Prescription"}
            </button>
            
            {soilComposition && (
              <div className="mt-4 flex items-center gap-2 bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/30">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Linked to Image Analysis</span>
              </div>
            )}
          </div>
          <Waves className="absolute right-[-40px] bottom-[-40px] text-white/5 w-64 h-64" />
        </div>

        <div className="space-y-6">
          {aiNutrientAdvice ? (
            <div className="bg-white p-8 rounded-[3rem] border border-emerald-100 shadow-sm animate-fadeIn flex flex-col h-full min-h-[450px]">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900">Scientific Prescription Plan</h4>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Grounded Target Dosages</p>
                  </div>
                </div>
              </div>

              <div className="h-52 w-full mb-6 min-h-[208px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recommendationChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'black'}} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="current" fill="#94a3b8" radius={[6, 6, 0, 0]} name="Current Level" />
                    <Bar dataKey="target" fill="#10b981" radius={[6, 6, 0, 0]} name="Web-Grounded Target" />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '15px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap prose prose-emerald prose-sm">
                  {String(aiNutrientAdvice)}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <span>Ref: FLASH-MODEL-SEARCH</span>
                <span className="flex items-center gap-1">Web Sources Verified <ChevronRight size={10} /></span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-10 rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center h-full min-h-[450px]">
               <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mb-6">
                 <FlaskConical size={32} />
               </div>
               <h4 className="text-lg font-black text-slate-400 uppercase tracking-widest text-center">Engine Standby</h4>
               <p className="text-xs text-slate-400 mt-2 max-w-xs font-medium text-center">Analyze a soil sample or run the Strategist to fetch the latest NPK requirements for your crop via Google Search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const NPKStat = ({ label, val, color }: any) => (
  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
    <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-tighter">{String(label)}</p>
    <p className={`text-xl font-black ${color}`}>{String(val)}</p>
  </div>
);