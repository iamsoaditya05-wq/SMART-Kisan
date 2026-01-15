
import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, ShieldAlert, Zap, Activity, BrainCircuit, Sparkles, X, Info, Database, CloudSun, MapPin, ArrowRightLeft, RefreshCw, ExternalLink } from 'lucide-react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis
} from 'recharts';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../lib/supabase';
import { getWeatherFeedback, GroundingSource } from '../services/geminiService';

interface DashboardProps {
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ language }) => {
  const t = translations[language] || translations.en;
  const [xaiInsight, setXaiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [plotData, setPlotData] = useState<any>(null);

  // Weather Comparison State
  const [region1, setRegion1] = useState('Punjab');
  const [region2, setRegion2] = useState('Haryana');
  const [weatherFeedback, setWeatherFeedback] = useState<string | null>(null);
  const [weatherSources, setWeatherSources] = useState<GroundingSource[]>([]);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  useEffect(() => {
    fetchPlotData();
    const subscription = supabase
      .channel('plots_realtime')
      .on('postgres_changes', { event: '*', table: 'plots' }, (payload) => {
        if (payload.new) setPlotData(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  const fetchPlotData = async () => {
    try {
      const { data } = await supabase
        .from('plots')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data) setPlotData(data);
    } catch (e) {
      console.error("Supabase Plot Fetch Error:", e);
    }
  };

  const handleCompareWeather = async () => {
    setIsWeatherLoading(true);
    try {
      const result = await getWeatherFeedback(region1, region2, language);
      setWeatherFeedback(result.text);
      setWeatherSources(result.sources);

      // Persist weather comparison meta to Supabase
      await supabase.from('weather_readings').insert({
        region: `${region1} vs ${region2}`,
        conditions: result.text.slice(0, 2000), // Extended length for detailed feedback
        captured_at: new Date().toISOString()
      });
    } catch (error) {
      console.error("Weather comparison save error:", error);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  const getXAIExplanation = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const statusStr = plotData 
        ? `Moisture ${plotData.moisture || 38.4}%, Soil Type ${plotData.soil_type || 'Loamy'}, Health ${plotData.health || 94}/100` 
        : "Moisture 38.4%, Soil Temp 24.8°C, Health 94/100";

      const langName = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : language === 'pa' ? 'Punjabi' : 'English';
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide an Explainable AI (XAI) summary for a farmer. Current status: ${statusStr}. Explain why these values are good or bad and what the AI logic suggests for tomorrow. Language: ${langName}.`,
      });
      
      const text = response.text || "Insight generation failed.";
      setXaiInsight(text);

      // Log the XAI insight to Supabase
      await supabase.from('xai_explanations').insert({
        reference_type: 'plot_status',
        reference_id: plotData?.id || 'GLOBAL',
        language_code: language,
        explanation_text: text,
        created_at: new Date().toISOString()
      });
      
    } catch (e) {
      console.error("XAI Supabase Log Error:", e);
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
          <p className="text-slate-500 font-medium text-sm lg:text-base">{t.activePlots}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
              <Database size={14} className="text-blue-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase">Supabase Linked</span>
           </div>
           <button 
             onClick={getXAIExplanation}
             disabled={isAnalyzing}
             className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
           >
             {isAnalyzing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <BrainCircuit size={16} />}
             <span className="text-xs font-bold">{isAnalyzing ? t.analyzing : t.explainXAI}</span>
           </button>
        </div>
      </div>

      {/* Weather Comparison Section */}
      <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
            <CloudSun size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Real-Time Weather Comparison</h3>
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
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 transition-all"
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Market/Region</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={region2}
                onChange={(e) => setRegion2(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 transition-all"
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
          Analyze Comparative Weather
        </button>

        {weatherFeedback && (
          <div className="mt-8 bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 animate-fadeIn">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="text-blue-600" size={20} />
              <h4 className="font-black text-xs uppercase tracking-widest text-blue-600">Crop Viability Insight</h4>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard icon={Droplets} label={t.moisture} value={`${plotData?.moisture || 38.4}%`} trend="+2.1%" unit={t.optimal} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={Thermometer} label={t.temp} value={`${plotData?.temperature || 24.8}°C`} trend="-0.5%" unit={t.normal} color="text-orange-600" bg="bg-orange-50" />
        <StatCard icon={Zap} label={t.energy} value="12.2 kWh" trend="Stable" unit={t.efficient} color="text-yellow-600" bg="bg-yellow-50" />
        <StatCard icon={Activity} label={t.health} value={`${plotData?.health || 94}/100`} trend="+4%" unit={t.excellent} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl h-64 flex flex-col items-center justify-center text-center gap-4">
         <Database className="text-emerald-500 animate-pulse" size={32} />
         <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Real-time Telemetry Visualization Stream</p>
            <p className="text-[10px] text-slate-500 font-bold mt-2">Active Plot: {plotData?.plot_name || 'Main Field'}</p>
         </div>
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
