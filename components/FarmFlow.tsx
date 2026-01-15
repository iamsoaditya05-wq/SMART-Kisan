
import React, { useState, useRef } from 'react';
import { 
  Droplets, Thermometer, ShieldCheck, Camera, Activity, Power, FlaskConical, RefreshCw, AlertTriangle, 
  Map as MapIcon, Info, Layers, Sprout, Sparkles, ClipboardList, Satellite, Waves, Zap, Globe, 
  TrendingUp, Scan, BrainCircuit, UploadCloud, Microscope, Navigation, MapPin, Eye, Filter, MousePointer2
} from 'lucide-react';
import { analyzeLeafHealth, getFertilizerRecommendation, analyzeSatelliteNDVI, getNearbyAgriResources, GroundingSource } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, AreaChart, Area
} from 'recharts';

const soilTypes = ['Clayey', 'Sandy', 'Loamy', 'Silty'];
const soilColors: Record<string, string> = {
  'Clayey': 'bg-[#D35400]', // Burnt Orange/Clay
  'Sandy': 'bg-[#F1C40F]',  // Sunflower Yellow/Sand
  'Loamy': 'bg-[#3E2723]',  // Dark Rich Brown/Loam
  'Silty': 'bg-[#78909C]'   // Blue Grey/Silt
};

const mockPlots = Array.from({ length: 25 }, (_, i) => ({
  id: `P-${i + 1}`,
  soilType: soilTypes[Math.floor(Math.random() * 4)],
  moisture: Math.floor(Math.random() * 60) + 15,
  health: Math.floor(Math.random() * 30) + 65,
  ndvi: 0.3 + Math.random() * 0.6,
  ph: 6.0 + Math.random(),
  ec: 0.8 + Math.random(),
  npk: { n: Math.random() * 100, p: Math.random() * 100, k: Math.random() * 100 }
}));

const FarmFlow: React.FC<{ language: string }> = ({ language }) => {
  const [selectedPlot, setSelectedPlot] = useState(mockPlots[12]);
  const [mapMode, setMapMode] = useState<'health' | 'soil'>('health');
  const [nearbyResults, setNearbyResults] = useState<string | null>(null);
  const [nearbySources, setNearbySources] = useState<GroundingSource[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [fertilizerAdvice, setFertilizerAdvice] = useState<string | null>(null);
  const [satelliteAnalysis, setSatelliteAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [spectralLoading, setSpectralLoading] = useState(false);

  const fetchResources = async (type: string) => {
    setNearbyLoading(true);
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

  const handleSpectralAnalysis = async () => {
    setSpectralLoading(true);
    // Simulating a base64 encoded satellite crop image
    const placeholderImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const result = await analyzeSatelliteNDVI(placeholderImage, language);
    setSatelliteAnalysis(result);
    setSpectralLoading(false);
  };

  const getHealthColor = (val: number) => {
    if (val > 85) return 'bg-emerald-500';
    if (val > 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getNdviStatus = (val: number) => {
    if (val > 0.7) return 'Excellent Biomass';
    if (val > 0.4) return 'Moderate Growth';
    return 'Stress Detected';
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            <BrainCircuit size={14} /> Grounded AI
          </div>
          <h2 className="text-4xl font-black mb-3">Precision Ecosystem</h2>
          <p className="opacity-90 font-medium">Connect your field with real-world resources, satellite spectral data, and topographical soil mapping.</p>
        </div>
        <Satellite className="absolute right-[-20px] top-[-20px] text-white/10 w-64 h-64 rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Spatial Plot Matrix & Topography */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-800">Field Topology Map</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Plot Monitoring</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setMapMode('health')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${mapMode === 'health' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Health
                </button>
                <button 
                  onClick={() => setMapMode('soil')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${mapMode === 'soil' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Soil Type
                </button>
              </div>
            </div>

            <div className="relative mb-8 group">
              <div className="grid grid-cols-5 gap-3 aspect-square max-w-[340px] mx-auto p-4 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                {mockPlots.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => { setSelectedPlot(p); setFertilizerAdvice(null); setSatelliteAnalysis(null); }} 
                    className={`rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center text-[8px] font-black ${
                      selectedPlot.id === p.id 
                      ? 'ring-4 ring-emerald-200 z-10 scale-105 shadow-xl' 
                      : 'hover:z-10'
                    } ${
                      mapMode === 'health' 
                      ? getHealthColor(p.health)
                      : soilColors[p.soilType]
                    }`}
                  >
                    <span className="text-white/40 group-hover:text-white/80 transition-colors">{p.id}</span>
                  </div>
                ))}
              </div>
              
              {/* Legend Overlay */}
              <div className="mt-6 flex flex-wrap justify-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                {mapMode === 'health' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-[9px] font-black text-slate-500 uppercase">Optimal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-[9px] font-black text-slate-500 uppercase">Attention</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-[9px] font-black text-slate-500 uppercase">Critical</span>
                    </div>
                  </>
                ) : (
                  soilTypes.map(type => (
                    <div key={type} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${soilColors[type]}`}></div>
                      <span className="text-[9px] font-black text-slate-500 uppercase">{type}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-900 text-white rounded-[2rem] shadow-lg relative overflow-hidden group">
                <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-2 opacity-60">
                     <Layers size={14} className="text-emerald-400" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Soil Composition</span>
                   </div>
                   <div className="text-2xl font-black">{selectedPlot.soilType}</div>
                   <p className="text-[10px] font-medium text-emerald-400/80 mt-1">Rich in organic matter and nutrients</p>
                </div>
                <div className={`absolute right-[-10px] bottom-[-10px] w-20 h-20 rounded-full opacity-20 blur-2xl ${soilColors[selectedPlot.soilType]}`}></div>
              </div>
              <div className="p-5 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Moisture Profile</span>
                </div>
                <div className="text-2xl font-black text-slate-800">{selectedPlot.moisture}%</div>
                <div className="w-full bg-white h-1.5 rounded-full mt-3 overflow-hidden">
                   <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${selectedPlot.moisture}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Ground Support Finder */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6">
              <MapPin className="text-blue-500" /> Ground Support
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={() => fetchResources("Soil Testing Lab")} className="p-4 bg-blue-50 text-blue-700 rounded-2xl text-xs font-bold hover:bg-blue-100 transition-all flex flex-col items-center gap-2 group">
                <Microscope size={20} className="group-hover:scale-110 transition-transform" /> Soil Labs
              </button>
              <button onClick={() => fetchResources("Fertilizer Wholesale Store")} className="p-4 bg-orange-50 text-orange-700 rounded-2xl text-xs font-bold hover:bg-orange-100 transition-all flex flex-col items-center gap-2 group">
                <Sprout size={20} className="group-hover:scale-110 transition-transform" /> Fertilizers
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
        </div>

        <div className="space-y-8">
          {/* Satellite NDVI Section */}
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl border border-slate-800 overflow-hidden relative">
            <Satellite className="absolute right-[-10px] bottom-[-10px] text-white/5 w-32 h-32" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <Globe className="text-emerald-400" /> Satellite Index
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">NDVI Vegetative Reading</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-400">{selectedPlot.ndvi.toFixed(2)}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{getNdviStatus(selectedPlot.ndvi)}</div>
                </div>
              </div>

              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-6 relative">
                <div className="flex h-full w-full">
                  <div className="bg-red-500 h-full w-[30%]" />
                  <div className="bg-yellow-500 h-full w-[40%]" />
                  <div className="bg-emerald-500 h-full w-[30%]" />
                </div>
                <div className="absolute h-6 w-1 bg-white top-[-6px] rounded-full shadow-lg transition-all duration-1000" style={{ left: `${selectedPlot.ndvi * 100}%` }} />
              </div>

              {!satelliteAnalysis ? (
                <button 
                  onClick={handleSpectralAnalysis}
                  disabled={spectralLoading}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {spectralLoading ? <RefreshCw className="animate-spin" size={18} /> : <Scan size={18} />}
                  Run Spectral Breakdown
                </button>
              ) : (
                <div className="bg-emerald-950/50 p-6 rounded-2xl border border-emerald-900/50 animate-fadeIn max-h-[200px] overflow-y-auto custom-scrollbar">
                  <div className="flex items-center gap-2 mb-3 text-emerald-400">
                    <Eye size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">XAI Spectral Insight</span>
                  </div>
                  <p className="text-xs text-emerald-50 leading-relaxed whitespace-pre-wrap italic">{satelliteAnalysis}</p>
                </div>
              )}
            </div>
          </div>

          {/* Nutrient Intelligence Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <FlaskConical className="text-orange-500" /> Nutrient Intelligence
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {Object.entries(selectedPlot.npk).map(([key, val]) => (
                <div key={key} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center relative overflow-hidden group">
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-1 relative z-10">{key}</div>
                  <div className="text-lg font-black text-slate-800 relative z-10">{Math.round(val)}%</div>
                  <div className="absolute bottom-0 left-0 h-1 bg-orange-400/20 w-full transition-all group-hover:h-full group-hover:bg-orange-400/5" style={{ height: `${val}%` }}></div>
                </div>
              ))}
            </div>
            {!fertilizerAdvice ? (
              <button 
                onClick={handleFertilizerAdvice}
                disabled={loading}
                className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
                Generate Fertilizer Plan
              </button>
            ) : (
              <div className="bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100 animate-fadeIn">
                <div className="flex items-center gap-2 mb-3 text-orange-600">
                  <Info size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Laboratory Recommendation</span>
                </div>
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
