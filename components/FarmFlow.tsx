
import React, { useState, useRef, useMemo } from 'react';
import { 
  Droplets, Thermometer, ShieldCheck, Camera, Activity, Power, FlaskConical, RefreshCw, AlertTriangle, 
  Map as MapIcon, Info, Layers, Sprout, Sparkles, ClipboardList, Satellite, Waves, Zap, Globe, 
  TrendingUp, Scan, BrainCircuit, UploadCloud, Microscope
} from 'lucide-react';
import { analyzeLeafHealth, getFertilizerRecommendation, analyzeSatelliteNDVI } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, AreaChart, Area
} from 'recharts';

const soilColors = {
  Clayey: 'bg-amber-800',
  Sandy: 'bg-yellow-200',
  Loamy: 'bg-emerald-800',
  Silty: 'bg-slate-400'
};

const soilProfiles = {
  Clayey: { n: [60, 85], p: [30, 50], k: [70, 95] },
  Sandy: { n: [10, 35], p: [5, 25], k: [15, 40] },
  Loamy: { n: [40, 65], p: [25, 45], k: [45, 75] },
  Silty: { n: [35, 55], p: [40, 65], k: [35, 60] }
};

const getRandomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const mockPlots = Array.from({ length: 25 }, (_, i) => {
  const type = ['Clayey', 'Sandy', 'Loamy', 'Silty'][Math.floor(Math.random() * 4)] as keyof typeof soilProfiles;
  const profile = soilProfiles[type];
  return {
    id: `P-${i + 1}`,
    soilType: type,
    moisture: getRandomInRange(15, 75),
    health: getRandomInRange(65, 98),
    ndvi: 0.3 + Math.random() * 0.6,
    ph: type === 'Clayey' ? 6.8 + Math.random() : 6.0 + Math.random(),
    ec: type === 'Clayey' ? 1.8 + Math.random() : 0.8 + Math.random(),
    npk: {
      n: getRandomInRange(profile.n[0], profile.n[1]),
      p: getRandomInRange(profile.p[0], profile.p[1]),
      k: getRandomInRange(profile.k[0], profile.k[1])
    }
  };
});

const FarmFlow: React.FC<{ language: string }> = ({ language }) => {
  const [selectedPlot, setSelectedPlot] = useState(mockPlots[12]);
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [fertilizerAdvice, setFertilizerAdvice] = useState<string | null>(null);
  const [satResult, setSatResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [satLoading, setSatLoading] = useState(false);
  const [mapMode, setMapMode] = useState<'soil' | 'ndvi' | 'moisture'>('soil');
  const leafInputRef = useRef<HTMLInputElement>(null);
  const satInputRef = useRef<HTMLInputElement>(null);

  const npkData = useMemo(() => [
    { name: 'N', value: selectedPlot.npk.n, color: '#ef4444' },
    { name: 'P', value: selectedPlot.npk.p, color: '#3b82f6' },
    { name: 'K', value: selectedPlot.npk.k, color: '#f59e0b' },
  ], [selectedPlot]);

  const handleSatelliteUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSatLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      const result = await analyzeSatelliteNDVI(base64String, language);
      setSatResult(result);
      setSatLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFertilizerAdvice = async () => {
    setLoading(true);
    const result = await getFertilizerRecommendation(selectedPlot.npk, `${selectedPlot.soilType} soil for ${selectedCrop}`, language);
    setFertilizerAdvice(result);
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header with XAI Highlight */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            <BrainCircuit size={14} /> Explainable AI Enabled
          </div>
          <h2 className="text-4xl font-black mb-3 leading-tight">Precision Ag & XAI Dashboard</h2>
          <p className="opacity-90 font-medium">Fusing IoT telemetry with Multilingual Satellite Intelligence for transparent farming decisions.</p>
        </div>
        <Satellite className="absolute right-[-20px] top-[-20px] text-white/10 w-64 h-64 rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Satellite Data Upload & Read Feature */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Globe className="text-blue-500" /> Satellite Spectral Analysis
              </h3>
              <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full">SENTINEL-2 SYNC</span>
            </div>
            
            <div 
              onClick={() => satInputRef.current?.click()}
              className="border-2 border-dashed border-blue-100 bg-blue-50/30 rounded-[2rem] p-10 text-center hover:bg-blue-50 transition-all cursor-pointer group"
            >
              <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="text-blue-500" size={32} />
              </div>
              <p className="font-black text-slate-800">Upload Satellite GeoTIFF / JPEG</p>
              <p className="text-xs text-slate-400 mt-1">Detect Soil Type & Nutrient Deficiencies via Spectral Reading</p>
              <input type="file" ref={satInputRef} className="hidden" onChange={handleSatelliteUpload} />
            </div>

            {satLoading && (
              <div className="mt-6 flex items-center gap-3 text-blue-600 animate-pulse bg-blue-50 p-4 rounded-2xl font-black text-xs uppercase">
                <RefreshCw size={18} className="animate-spin" /> Analyzing Multiband Radiance...
              </div>
            )}

            {satResult && (
              <div className="mt-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 animate-fadeIn">
                <div className="flex items-center gap-2 mb-4">
                  <Microscope className="text-blue-500" size={18} />
                  <h4 className="font-black text-slate-800 text-sm">XAI Satellite Interpretation</h4>
                </div>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {satResult}
                </div>
              </div>
            )}
          </div>

          {/* Plot Analysis Map */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Scan className="text-emerald-500" /> Spatial Plot Matrix
              </h3>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {(['soil', 'ndvi', 'moisture'] as const).map(m => (
                  <button key={m} onClick={() => setMapMode(m)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mapMode === m ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>{m}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2 aspect-square max-w-[360px] mx-auto mb-8">
              {mockPlots.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedPlot(p)}
                  className={`rounded-xl cursor-pointer transition-all hover:scale-110 border-2 ${selectedPlot.id === p.id ? 'border-white ring-4 ring-emerald-100 scale-110 z-10' : 'border-transparent'} ${mapMode === 'soil' ? soilColors[p.soilType] : p.ndvi > 0.6 ? 'bg-emerald-500' : 'bg-yellow-400'}`}
                />
              ))}
            </div>
            <div className="grid grid-cols-4 gap-4 p-5 bg-slate-50 rounded-3xl">
              <div><p className="text-[9px] font-black text-slate-400 uppercase">Moisture</p><p className="font-black text-slate-800">{selectedPlot.moisture}%</p></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase">Soil pH</p><p className="font-black text-slate-800">{selectedPlot.ph.toFixed(1)}</p></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase">Type</p><p className="font-black text-emerald-600">{selectedPlot.soilType}</p></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase">NDVI</p><p className="font-black text-blue-600">{selectedPlot.ndvi.toFixed(2)}</p></div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* XAI Fertilizer Recommendation */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <FlaskConical className="text-orange-500" /> Nutrient Intelligence
              </h3>
              <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black" value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}>
                <option>Wheat</option><option>Rice</option><option>Corn</option><option>Soybean</option>
              </select>
            </div>
            
            <div className="h-44 w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={npkData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} fontWeight="900" width={40} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                    {npkData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {!fertilizerAdvice ? (
              <button 
                onClick={handleFertilizerAdvice}
                disabled={loading}
                className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl"
              >
                {loading ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                {loading ? 'Thinking Multilingually...' : 'Generate XAI Fertilizer Plan'}
              </button>
            ) : (
              <div className="bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100 animate-fadeIn space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-orange-700 font-black text-xs uppercase tracking-widest">
                    <BrainCircuit size={16} /> Explainable Recommendation
                  </div>
                  <button onClick={() => setFertilizerAdvice(null)} className="text-[10px] font-black text-orange-600 hover:underline uppercase">Reset</button>
                </div>
                <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto pr-2 custom-scrollbar font-medium">
                  {fertilizerAdvice}
                </div>
              </div>
            )}
          </div>

          {/* Leaf Analysis remains for diagnostic synergy */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" /> Foliage XAI Health Check
             </h3>
             <div 
               onClick={() => leafInputRef.current?.click()}
               className="border-2 border-dashed border-emerald-100 bg-emerald-50/20 rounded-[2rem] p-8 text-center hover:bg-emerald-50 transition-all cursor-pointer group"
             >
                <Camera className="text-emerald-500 mx-auto mb-3 group-hover:scale-110 transition-transform" size={40} />
                <p className="font-black text-slate-700">Diagnosis via Visual Patterns</p>
                <input type="file" ref={leafInputRef} className="hidden" accept="image/*" />
             </div>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default FarmFlow;
