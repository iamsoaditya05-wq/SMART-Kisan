
import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, ShieldAlert, Zap, Activity, BrainCircuit, Sparkles, X, Info, Database, CloudSun, MapPin, ArrowRightLeft, RefreshCw, ExternalLink, TrendingUp, BarChart, Gift, Sprout } from 'lucide-react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, BarChart as ReBarChart, Bar, Cell, Legend
} from 'recharts';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../lib/supabase';
import { getWeatherFeedback, GroundingSource, predictYieldOutcome } from '../services/geminiService';

interface DashboardProps {
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ language }) => {
  const t = translations[language] || translations.en;
  const [xaiInsight, setXaiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [plotData, setPlotData] = useState<any>({
    plot_name: "Plot 01 (North)",
    moisture: 38.4,
    temperature: 24.8,
    health: 94,
    ph: 6.5,
    n: 45, p: 32, k: 68
  });

  // New States for Yield and Resource tracking
  const [yieldPrediction, setYieldPrediction] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [reputationScore, setReputationScore] = useState(850);
  const [resourceHistory] = useState([
    { name: 'Week 1', water: 400, fertilizer: 20 },
    { name: 'Week 2', water: 300, fertilizer: 15 },
    { name: 'Week 3', water: 500, fertilizer: 25 },
    { name: 'Week 4', water: 450, fertilizer: 22 },
  ]);

  // Weather Comparison State
  const [region1, setRegion1] = useState('Punjab');
  const [region2, setRegion2] = useState('Haryana');
  const [weatherFeedback, setWeatherFeedback] = useState<string | null>(null);
  const [weatherSources, setWeatherSources] = useState<GroundingSource[]>([]);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  useEffect(() => {
    fetchPlotData();
    const cachedYield = localStorage.getItem('last_yield_prediction');
    if (cachedYield) setYieldPrediction(cachedYield);
    
    const channel = supabase
      .channel('plots_realtime')
      .on('postgres_changes', { event: '*', table: 'plots' }, (payload) => {
        if (payload.new) setPlotData(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchPlotData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('plots').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (data) {
          setPlotData(data);
          localStorage.setItem('cached_plot_data', JSON.stringify(data));
        }
      }
    } catch (e) {
      const cached = localStorage.getItem('cached_plot_data');
      if (cached) setPlotData(JSON.parse(cached));
    }
  };

  const handlePredictYield = async () => {
    setIsPredicting(true);
    try {
      const result = await predictYieldOutcome(
        plotData.n, plotData.p, plotData.k, plotData.moisture, plotData.ph,
        "Wheat", "Loamy", "Ludhiana", language
      );
      setYieldPrediction(result);
      localStorage.setItem('last_yield_prediction', result);
      setReputationScore(prev => prev + 50); // Reward for using AI predictive features
    } catch (error) {
      console.error(error);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleCompareWeather = async () => {
    setIsWeatherLoading(true);
    try {
      const result = await getWeatherFeedback(region1, region2, language);
      setWeatherFeedback(result.text);
      setWeatherSources(result.sources);
    } catch (error) {
      console.error("Weather comparison error:", error);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  const getXAIExplanation = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const statusStr = `Moisture ${plotData.moisture}%, Temp ${plotData.temperature}°C, pH ${plotData.ph}, Health ${plotData.health}/100`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Explain the current farm state to a farmer: ${statusStr}. Provide human-readable reasoning for these values. Language: ${language}.`,
      });
      setXaiInsight(response.text || "Insight generation failed.");
    } catch (e) {
      setXaiInsight("Connection to AI Core lost.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900">{t.overview}</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500 font-medium text-sm">{plotData ? `Monitoring ${plotData.plot_name}` : t.activePlots}</p>
            <div className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Gift size={12} />
              <span className="text-[10px] font-black">{reputationScore} RP</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <button 
             onClick={handlePredictYield}
             disabled={isPredicting}
             className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20"
           >
             {isPredicting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp size={16} />}
             <span className="text-xs font-bold">Predict Yield</span>
           </button>
           <button 
             onClick={getXAIExplanation}
             disabled={isAnalyzing}
             className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
           >
             {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit size={16} />}
             <span className="text-xs font-bold">{isAnalyzing ? t.analyzing : t.explainXAI}</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard icon={Droplets} label={t.moisture} value={`${plotData.moisture}%`} trend="+2.1%" unit={t.optimal} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={Thermometer} label={t.temp} value={`${plotData.temperature}°C`} trend="-0.5%" unit={t.normal} color="text-orange-600" bg="bg-orange-50" />
        <StatCard icon={Activity} label="Soil pH Balance" value={plotData.ph} trend="Neutral" unit="Healthy" color="text-purple-600" bg="bg-purple-50" />
        <StatCard icon={Activity} label={t.health} value={`${plotData.health}/100`} trend="+4%" unit={t.excellent} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Yield Prediction Outcome */}
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full min-h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
              <Sprout size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Yield Outcome Predictor</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Feature 6: Predictive AI</p>
            </div>
          </div>
          <div className="flex-1 bg-slate-50 rounded-[2rem] p-6 overflow-y-auto">
            {yieldPrediction ? (
               <div className="text-sm text-slate-700 leading-relaxed prose prose-emerald whitespace-pre-wrap">
                 {yieldPrediction}
               </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <TrendingUp size={48} className="mb-4 opacity-20" />
                <p className="font-bold text-xs uppercase tracking-widest">Run Prediction Engine</p>
              </div>
            )}
          </div>
        </div>

        {/* Resource Tracking Chart */}
        <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
              <BarChart size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Resource Tracking</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Feature 10: Usage Analytics</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={resourceHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis hide />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                <Bar dataKey="water" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Water (L)" />
                <Bar dataKey="fertilizer" fill="#10b981" radius={[4, 4, 0, 0]} name="Fertilizer (Kg)" />
                <Legend iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold'}} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {xaiInsight && (
        <div className="bg-emerald-950 text-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden animate-fadeIn">
           <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center gap-2">
                 <BrainCircuit className="text-emerald-400" size={20} />
                 <h4 className="font-black text-sm uppercase tracking-widest text-emerald-400">XAI Live Feed</h4>
              </div>
              <button onClick={() => setXaiInsight(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><X size={18} /></button>
           </div>
           <p className="text-sm lg:text-base leading-relaxed text-emerald-50 font-medium relative z-10">{xaiInsight}</p>
        </div>
      )}

      {/* Weather Comparison Section */}
      <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
            <CloudSun size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Comparative Weather Intelligence</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grounded by Google Search</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Region</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={region1}
                onChange={(e) => setRegion1(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                placeholder="Region A..."
              />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-center">
            <div className="bg-slate-100 p-3 rounded-full text-slate-400">
              <ArrowRightLeft size={20} />
            </div>
          </div>

          <div className="md:col-span-5 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Market</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={region2}
                onChange={(e) => setRegion2(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                placeholder="Region B..."
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleCompareWeather}
          disabled={isWeatherLoading}
          className="mt-6 w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
        >
          {isWeatherLoading ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
          Compare Conditions
        </button>

        {weatherFeedback && (
          <div className="mt-8 bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 animate-fadeIn">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="text-blue-600" size={20} />
              <h4 className="font-black text-xs uppercase tracking-widest text-blue-600">Weather Insight</h4>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap mb-6">{weatherFeedback}</p>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-blue-100">
              {weatherSources.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-100 text-[10px] font-bold text-blue-600 rounded-full hover:bg-blue-100 transition-all">
                  <ExternalLink size={12} /> {s.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, unit, trend, color, bg }: any) => (
  <div className="p-5 lg:p-6 rounded-[2rem] shadow-sm border border-slate-100 bg-white group hover:shadow-xl transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`${bg} p-3 rounded-xl ${color}`}><Icon size={20} /></div>
      <div className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
        {trend}
      </div>
    </div>
    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-baseline gap-2">
      <span className="text-xl lg:text-2xl font-black text-slate-800">{value}</span>
      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${bg} ${color}`}>{unit}</span>
    </div>
  </div>
);

export default Dashboard;
