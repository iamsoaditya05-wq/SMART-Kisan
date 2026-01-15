
import React, { useState, useRef, useMemo } from 'react';
import { 
  Droplets, Thermometer, ShieldCheck, Camera, Activity, Power, FlaskConical, RefreshCw, AlertTriangle, 
  Map as MapIcon, Info, Layers, Sprout, Sparkles, ClipboardList, Satellite, Waves, Zap, Globe, 
  TrendingUp, Scan, BrainCircuit, UploadCloud, Microscope, Navigation, MapPin
} from 'lucide-react';
import { analyzeLeafHealth, getFertilizerRecommendation, analyzeSatelliteNDVI, getNearbyAgriResources, GroundingSource } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, AreaChart, Area
} from 'recharts';

const mockPlots = Array.from({ length: 25 }, (_, i) => ({
  id: `P-${i + 1}`,
  soilType: ['Clayey', 'Sandy', 'Loamy', 'Silty'][Math.floor(Math.random() * 4)],
  moisture: Math.floor(Math.random() * 60) + 15,
  health: Math.floor(Math.random() * 30) + 65,
  ndvi: 0.3 + Math.random() * 0.6,
  ph: 6.0 + Math.random(),
  ec: 0.8 + Math.random(),
  npk: { n: Math.random() * 100, p: Math.random() * 100, k: Math.random() * 100 }
}));

const FarmFlow: React.FC<{ language: string }> = ({ language }) => {
  const [selectedPlot, setSelectedPlot] = useState(mockPlots[12]);
  const [nearbyResults, setNearbyResults] = useState<string | null>(null);
  const [nearbySources, setNearbySources] = useState<GroundingSource[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [fertilizerAdvice, setFertilizerAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchResources = async (type: string) => {
    setNearbyLoading(true);
    // Use fallback coordinates if geolocation is blocked (e.g., Delhi)
    const lat = 28.6139;
    const lng = 77.2090;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const res = await getNearbyAgriResources(pos.coords.latitude, pos.coords.longitude, type, language);
        setNearbyResults(res.text);
        setNearbySources(res.sources);
        setNearbyLoading(false);
      }, async () => {
        const res = await getNearbyAgriResources(lat, lng, type, language);
        setNearbyResults(res.text);
        setNearbySources(res.sources);
        setNearbyLoading(false);
      });
    }
  };

  const handleFertilizerAdvice = async () => {
    setLoading(true);
    const result = await getFertilizerRecommendation(selectedPlot.npk, `${selectedPlot.soilType} soil for Wheat`, language);
    setFertilizerAdvice(result);
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            <BrainCircuit size={14} /> Grounded AI
          </div>
          <h2 className="text-4xl font-black mb-3">Precision Ecosystem</h2>
          <p className="opacity-90 font-medium">Connect your field with real-world resources and laboratory support.</p>
        </div>
        <Satellite className="absolute right-[-20px] top-[-20px] text-white/10 w-64 h-64 rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Nearby Resources Finder */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <MapPin className="text-blue-500" /> Ground Support
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={() => fetchResources("Soil Testing Lab")} className="p-4 bg-blue-50 text-blue-700 rounded-2xl text-xs font-bold hover:bg-blue-100 transition-all flex flex-col items-center gap-2">
                <Microscope size={20} /> Soil Labs
              </button>
              <button onClick={() => fetchResources("Fertilizer Wholesale Store")} className="p-4 bg-orange-50 text-orange-700 rounded-2xl text-xs font-bold hover:bg-orange-100 transition-all flex flex-col items-center gap-2">
                <Sprout size={20} /> Fertilizers
              </button>
            </div>

            {nearbyLoading && (
              <div className="flex items-center gap-3 text-blue-600 animate-pulse bg-blue-50 p-4 rounded-2xl font-black text-xs uppercase">
                <RefreshCw size={18} className="animate-spin" /> Querying Google Maps...
              </div>
            )}

            {nearbyResults && (
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 animate-fadeIn space-y-4">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{nearbyResults}</p>
                <div className="flex flex-col gap-2">
                   {nearbySources.map((source, i) => (
                     <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:border-blue-400 transition-all">
                       <span className="flex items-center gap-2"><MapIcon size={14} className="text-blue-500" /> {source.title}</span>
                       <Navigation size={14} />
                     </a>
                   ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-800 mb-6">Spatial Plot Matrix</h3>
            <div className="grid grid-cols-5 gap-2 aspect-square max-w-[320px] mx-auto">
              {mockPlots.map(p => (
                <div key={p.id} onClick={() => setSelectedPlot(p)} className={`rounded-xl cursor-pointer ${selectedPlot.id === p.id ? 'ring-4 ring-emerald-200' : ''} bg-emerald-500`} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <FlaskConical className="text-orange-500" /> Nutrient Intelligence
            </h3>
            {!fertilizerAdvice ? (
              <button 
                onClick={handleFertilizerAdvice}
                disabled={loading}
                className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                Generate Fertilizer Plan
              </button>
            ) : (
              <div className="bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100 animate-fadeIn">
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{fertilizerAdvice}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmFlow;
