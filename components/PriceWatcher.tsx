
import React, { useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Search, Sparkles, Calendar, LineChart as ChartIcon, Globe, ExternalLink } from 'lucide-react';
import { getMarketAnalysis, getLiveMarketPrices, GroundingSource } from '../services/geminiService';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine
} from 'recharts';

interface CropData {
  name: string;
  price: number;
  prev: number;
  trend: 'up' | 'down' | 'stable';
  history: { date: string; value: number }[];
  forecast: { date: string; value: number }[];
}

const cropsData: CropData[] = [
  { 
    name: 'Wheat', 
    price: 2150, 
    prev: 2100, 
    trend: 'up', 
    history: [
      { date: 'Mon', value: 2000 }, { date: 'Tue', value: 2050 }, { date: 'Wed', value: 2100 }, { date: 'Thu', value: 2150 }
    ],
    forecast: [
      { date: 'Fri', value: 2180 }, { date: 'Sat', value: 2210 }, { date: 'Sun', value: 2240 }
    ]
  },
  { 
    name: 'Rice', 
    price: 4200, 
    prev: 4350, 
    trend: 'down', 
    history: [
      { date: 'Mon', value: 4500 }, { date: 'Tue', value: 4400 }, { date: 'Wed', value: 4350 }, { date: 'Thu', value: 4200 }
    ],
    forecast: [
      { date: 'Fri', value: 4150 }, { date: 'Sat', value: 4100 }, { date: 'Sun', value: 4080 }
    ]
  },
  { 
    name: 'Corn', 
    price: 1850, 
    prev: 1850, 
    trend: 'stable', 
    history: [
      { date: 'Mon', value: 1800 }, { date: 'Tue', value: 1820 }, { date: 'Wed', value: 1850 }, { date: 'Thu', value: 1850 }
    ],
    forecast: [
      { date: 'Fri', value: 1860 }, { date: 'Sat', value: 1875 }, { date: 'Sun', value: 1880 }
    ]
  },
];

const PriceWatcher: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState<CropData>(cropsData[0]);
  const [aiAnalysis, setAiAnalysis] = useState<string>("Analyze trends for deep forecasting.");
  const [liveData, setLiveData] = useState<string | null>(null);
  const [liveSources, setLiveSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    const dataString = `Current ${selectedCrop.name} price: ₹${selectedCrop.price}.`;
    const result = await getMarketAnalysis(dataString);
    setAiAnalysis(result.text);
    setLoading(false);
  };

  const fetchLiveMarketPulse = async () => {
    setLiveLoading(true);
    const result = await getLiveMarketPrices(selectedCrop.name, "North India");
    setLiveData(result.text);
    setLiveSources(result.sources);
    setLiveLoading(false);
  };

  const combinedData = [
    ...selectedCrop.history.map(h => ({ ...h, type: 'Historical' })),
    ...selectedCrop.forecast.map(f => ({ ...f, type: 'Forecast' }))
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Market Price Watcher</h2>
          <p className="text-slate-500 text-sm">Now powered by Real-Time Google Search data.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={fetchLiveMarketPulse}
             disabled={liveLoading}
             className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2 hover:bg-emerald-200 transition-all disabled:opacity-50"
           >
             {liveLoading ? <div className="w-3 h-3 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"></div> : <Globe size={14} />}
             Live Market Pulse
           </button>
        </div>
      </div>

      {liveData && (
        <div className="bg-white p-6 rounded-[2rem] border border-blue-100 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 mb-3">
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
             <h4 className="font-black text-xs text-blue-600 uppercase tracking-widest">Grounded Real-Time Data</h4>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">{liveData}</p>
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
             {liveSources.map((source, i) => (
               <a 
                 key={i} 
                 href={source.uri} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-bold rounded-full transition-all"
               >
                 <ExternalLink size={10} /> {source.title}
               </a>
             ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {cropsData.map((crop) => (
            <div 
              key={crop.name} 
              onClick={() => setSelectedCrop(crop)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedCrop.name === crop.name ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="font-bold">{crop.name}</div>
                <div className="text-right">
                  <div className="font-bold">₹{crop.price}</div>
                  <div className={`text-[10px] font-bold ${crop.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {crop.trend === 'up' ? '▲' : '▼'} {crop.trend === 'up' ? `+₹${crop.price - crop.prev}` : `-₹${crop.prev - crop.price}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value}`, 'Price']}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-emerald-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
        <Sparkles className="absolute right-[-20px] top-[-20px] text-white/5 w-64 h-64 rotate-12" />
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
          <div className="lg:w-1/3">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-emerald-400" size={24} />
              <h3 className="text-xl font-bold tracking-tight">AI Strategist</h3>
            </div>
            <button 
              onClick={fetchAnalysis}
              disabled={loading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={20} />}
              Predict Future Trends
            </button>
          </div>
          <div className="lg:w-2/3 w-full bg-emerald-800/40 rounded-3xl p-6 border border-emerald-700/50 min-h-[120px]">
            <p className="text-emerald-50 text-sm italic">{aiAnalysis}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceWatcher;
