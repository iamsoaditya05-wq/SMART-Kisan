
import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplets, Thermometer, ShieldCheck, Camera as CameraIcon, Activity, Power, FlaskConical, RefreshCw, AlertTriangle, 
  Map as MapIcon, Info, Layers, Sprout, Sparkles, ClipboardList, Satellite, Waves, Zap, Globe, 
  TrendingUp, Scan, BrainCircuit, UploadCloud, Microscope, Navigation, MapPin, Eye, Filter, MousePointer2,
  ChevronDown, Gauge, Wind, Camera, Check, X
} from 'lucide-react';
import { analyzeLeafHealth, getFertilizerRecommendation, analyzeSatelliteNDVI, getNearbyAgriResources, detectSoilTypeFromImage, fetchBlynkMoisture, GroundingSource } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, AreaChart, Area
} from 'recharts';
import { supabase } from '../lib/supabase';

const soilTypes = ['Clayey', 'Sandy', 'Loamy', 'Silty'];
const crops = ['Wheat', 'Rice', 'Corn', 'Soybean', 'Cotton', 'Sugarcane', 'Potato'];

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
  health: Math.floor(Math.random() * 40) + 60,
  ndvi: 0.3 + Math.random() * 0.6,
  ph: 5.5 + Math.random() * 2,
  ec: 0.5 + Math.random() * 1.5,
  temp: 22 + Math.random() * 8,
  npk: { n: Math.random() * 100, p: Math.random() * 100, k: Math.random() * 100 }
}));

const FarmFlow: React.FC<{ language: string }> = ({ language }) => {
  const [selectedPlot, setSelectedPlot] = useState(mockPlots[12]);
  const [targetCrop, setTargetCrop] = useState('Wheat');
  const [mapMode, setMapMode] = useState<'health' | 'soil'>('health');
  const [nearbyResults, setNearbyResults] = useState<string | null>(null);
  const [nearbySources, setNearbySources] = useState<GroundingSource[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [fertilizerAdvice, setFertilizerAdvice] = useState<string | null>(null);
  const [satelliteAnalysis, setSatelliteAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [spectralLoading, setSpectralLoading] = useState(false);

  // Blynk & Camera States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [soilAnalysisResult, setSoilAnalysisResult] = useState<string | null>(null);
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const [blynkData, setBlynkData] = useState<{ moisture: number; suggestedIrrigation: number } | null>(null);
  const [isBlynkLoading, setIsBlynkLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied:", err);
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const captureAndAnalyzeSoil = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsVisionLoading(true);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
    
    try {
      const result = await detectSoilTypeFromImage(base64Image, language);
      setSoilAnalysisResult(result);
      
      // Persist to Supabase soil_detections
      await supabase.from('soil_detections').insert({
        detected_soil_type: result.split('\n')[0].replace('Soil Type: ', ''),
        analysis_explanation: result,
        confidence_score: 0.92 // Simulated
      });
      
      stopCamera();
    } catch (error) {
      console.error("Vision Analysis Error:", error);
    } finally {
      setIsVisionLoading(false);
    }
  };

  const syncWithBlynk = async () => {
    setIsBlynkLoading(true);
    try {
      const data = await fetchBlynkMoisture("YOUR_BLYNK_TOKEN", "V1");
      setBlynkData(data);

      // Persist to Supabase blynk_telemetry
      await supabase.from('blynk_telemetry').insert({
        device_id: 'NODE-001',
        moisture_level: data.moisture,
        suggested_irrigation_liters: data.suggestedIrrigation,
        status: 'sync_success'
      });
    } catch (error) {
      console.error("Blynk Sync Failed:", error);
    } finally {
      setIsBlynkLoading(false);
    }
  };

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
    try {
      const result = await getFertilizerRecommendation(
        selectedPlot.npk, 
        `${targetCrop} on ${selectedPlot.soilType} soil`, 
        language
      );
      setFertilizerAdvice(result);

      const { data: recData } = await supabase.from('fertilizer_recommendations').insert({
        crop_type: targetCrop,
        recommendation_text: result,
        target_nutrients: selectedPlot.npk,
        created_at: new Date().toISOString()
      }).select();

      if (recData?.[0]) {
        await supabase.from('xai_explanations').insert({
          reference_type: 'fertilizer_rec',
          reference_id: recData[0].id,
          language_code: language,
          explanation_text: result,
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Supabase Save Error (Fertilizer):", error);
    }
    setLoading(false);
  };

  const getHealthColor = (val: number) => {
    if (val > 85) return 'bg-emerald-500';
    if (val > 70) return 'bg-yellow-400';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Globe size={14} className="animate-spin-slow" /> GIS Plot Manager
          </div>
          <h2 className="text-4xl font-black mb-3">Farm Matrix Explorer</h2>
          <p className="opacity-90 font-medium">Interactive spatial mapping for real-time plot monitoring and nutrient lifecycle management.</p>
        </div>
        <Satellite className="absolute right-[-20px] top-[-20px] text-white/10 w-64 h-64 rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Spatial Map Column */}
        <div className="lg:col-span-5 space-y-8">
          {/* Blynk IoT Widget */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Zap size={20} /></div>
                <h3 className="text-xl font-black text-slate-800">Blynk IoT Telemetry</h3>
              </div>
              <button 
                onClick={syncWithBlynk}
                disabled={isBlynkLoading}
                className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                <RefreshCw className={isBlynkLoading ? 'animate-spin' : ''} size={18} />
              </button>
            </div>
            
            {!blynkData ? (
              <div className="text-center py-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active session</p>
                <button onClick={syncWithBlynk} className="mt-2 text-emerald-600 font-black text-xs hover:underline">Connect Sensors</button>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Blynk Moisture</p>
                    <p className="text-2xl font-black text-emerald-900">{blynkData.moisture.toFixed(1)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Suggested Water</p>
                    <p className="text-2xl font-black text-emerald-900">{blynkData.suggestedIrrigation.toFixed(2)}L/m²</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-900 rounded-2xl text-white flex items-center gap-3">
                   <Info className="text-emerald-400" size={16} />
                   <p className="text-[10px] font-medium leading-relaxed">Irrigation deficit calculated from 80% saturation target for {targetCrop}.</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Spatial Topology</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select plot to inspect</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setMapMode('health')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${mapMode === 'health' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Health
                </button>
                <button 
                  onClick={() => setMapMode('soil')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${mapMode === 'soil' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Soil
                </button>
              </div>
            </div>

            <div className="relative group p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <div className="grid grid-cols-5 gap-3 aspect-square max-w-[360px] mx-auto">
                {mockPlots.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => { setSelectedPlot(p); setFertilizerAdvice(null); setSatelliteAnalysis(null); }} 
                    className={`rounded-2xl cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 flex flex-col items-center justify-center text-[10px] font-black shadow-sm ${
                      selectedPlot.id === p.id 
                      ? 'ring-[6px] ring-emerald-500/20 ring-offset-2 z-20 scale-110 shadow-xl' 
                      : 'hover:z-10 opacity-90 hover:opacity-100'
                    } ${
                      mapMode === 'health' 
                      ? getHealthColor(p.health)
                      : soilColors[p.soilType]
                    }`}
                  >
                    <span className="text-white drop-shadow-sm">{p.id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sensor Data Column */}
        <div className="lg:col-span-7 space-y-8">
          {/* Soil Detection Camera Widget */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <CameraIcon className="text-emerald-600" /> Ground Vision AI
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detect Soil Type from Camera</p>
              </div>
              {!isCameraOpen && !soilAnalysisResult && (
                <button 
                  onClick={startCamera}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  Open Camera
                </button>
              )}
              {(isCameraOpen || soilAnalysisResult) && (
                <button 
                  onClick={() => { stopCamera(); setSoilAnalysisResult(null); }}
                  className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-100 aspect-video border-4 border-slate-50 shadow-inner flex items-center justify-center">
              {isCameraOpen ? (
                <div className="relative w-full h-full">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-emerald-500/40 m-12 rounded-[2rem] pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/50 rounded-full animate-pulse"></div>
                  </div>
                  <button 
                    onClick={captureAndAnalyzeSoil}
                    disabled={isVisionLoading}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 px-10 py-4 bg-emerald-600 text-white rounded-full font-black shadow-2xl flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    {isVisionLoading ? <RefreshCw className="animate-spin" /> : <Scan />}
                    {isVisionLoading ? 'Analyzing...' : 'Analyze Ground'}
                  </button>
                </div>
              ) : soilAnalysisResult ? (
                <div className="p-8 w-full h-full bg-emerald-50 flex flex-col justify-center animate-fadeIn overflow-y-auto custom-scrollbar">
                  <div className="flex items-center gap-2 mb-4">
                    <Check className="text-emerald-600" size={24} />
                    <h4 className="font-black text-emerald-900">Analysis Complete</h4>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm text-emerald-900 leading-relaxed font-medium whitespace-pre-wrap italic bg-white/50 p-6 rounded-2xl border border-emerald-100">
                      {soilAnalysisResult}
                    </p>
                    <button 
                      onClick={() => { setSoilAnalysisResult(null); startCamera(); }}
                      className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                    >
                      New Scan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-12">
                   <CameraIcon size={48} className="mx-auto text-slate-300 mb-4" />
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Camera Offline</p>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Plot {selectedPlot.id} Intelligence</h3>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white ${getHealthColor(selectedPlot.health)}`}>
                    {selectedPlot.health}% Health
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Real-time Telemetry Stream</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SensorDetail icon={Droplets} label="Moisture" value={`${selectedPlot.moisture}%`} color="text-blue-500" bg="bg-blue-50" />
              <SensorDetail icon={Thermometer} label="Temperature" value={`${selectedPlot.temp.toFixed(1)}°C`} color="text-orange-500" bg="bg-orange-50" />
              <SensorDetail icon={Gauge} label="pH Level" value={selectedPlot.ph.toFixed(1)} color="text-indigo-500" bg="bg-indigo-50" />
              <SensorDetail icon={Zap} label="Conductivity" value={`${selectedPlot.ec.toFixed(2)} mS/cm`} color="text-purple-500" bg="bg-purple-50" />
            </div>

            <div className="mt-8 p-8 bg-slate-900 rounded-[2.5rem] text-white">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Waves className="text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-widest">Active NPK Profile</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 opacity-60">OPTIMAL RANGE</span>
              </div>
              <div className="space-y-6">
                <NPKBar label="N (Nitrogen)" value={selectedPlot.npk.n} color="bg-blue-500" />
                <NPKBar label="P (Phosphorus)" value={selectedPlot.npk.p} color="bg-orange-500" />
                <NPKBar label="K (Potassium)" value={selectedPlot.npk.k} color="bg-purple-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SensorDetail = ({ icon: Icon, label, value, color, bg }: any) => (
  <div className={`p-5 ${bg} rounded-[2rem] border border-slate-100/50 flex flex-col items-center text-center transition-transform hover:scale-105`}>
    <div className={`p-3 rounded-2xl ${bg} ${color} mb-3 shadow-sm border border-current/10`}><Icon size={18} /></div>
    <div className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</div>
    <div className={`text-sm font-black text-slate-800`}>{value}</div>
  </div>
);

const NPKBar = ({ label, value, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
      <span>{label}</span>
      <span className="text-emerald-400">{Math.round(value)}%</span>
    </div>
    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
      <div className={`h-full ${color} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default FarmFlow;
