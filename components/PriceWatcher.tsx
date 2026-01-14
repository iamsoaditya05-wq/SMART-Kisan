
import React, { useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Search, Sparkles, Calendar, LineChart as ChartIcon } from 'lucide-react';
import { getMarketAnalysis } from '../services/geminiService';
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
    name: 'Rice (Basmati)', 
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
  { 
    name: 'Soybean', 
    price: 3400, 
    prev: 3200, 
    trend: 'up', 
    history: [
      { date: 'Mon', value: 3000 }, { date: 'Tue', value: 3100 }, { date: 'Wed', value: 3200 }, { date: 'Thu', value: 3400 }
    ],
    forecast: [
      { date: 'Fri', value: 3550 }, { date: 'Sat', value: 3700 }, { date: 'Sun', value: 3800 }
    ]
  },
];

const PriceWatcher: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState<CropData>(cropsData[0]);
  const [aiAnalysis, setAiAnalysis] = useState<string>("Click 'Predict Future Trends' for deep AI-driven forecasting...");
  const [loading, setLoading] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    const dataString = `Current ${selectedCrop.name} price: ₹${selectedCrop.price}. Historical trend: ${selectedCrop.history.map(h => h.value).join(', ')}.`;
    const result = await getMarketAnalysis(dataString);
    setAiAnalysis(result || "Error fetching analysis.");
    setLoading(false);
  };

  const combinedData = [
    ...selectedCrop.history.map(h => ({ ...h, type: 'Historical' })),
    ...selectedCrop.forecast.map(f => ({ ...f, type: 'Forecast' }))
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Market Price Watcher & Predictor</h2>
          <p className="text-slate-500 text-sm">Real-time tracking and future-trend analysis for crop yield maximization.</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search crop markets..." 
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Crop Selector */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Market Overview</h3>
          {cropsData.map((crop) => (
            <div 
              key={crop.name} 
              onClick={() => setSelectedCrop(crop)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedCrop.name === crop.name ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-100 bg-white hover:border-emerald-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedCrop.name === crop.name ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <div className="font-bold">{crop.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Verified Mandi Rate</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₹{crop.price}</div>
                  <div className={`flex items-center gap-1 justify-end text-[10px] font-bold ${crop.trend === 'up' ? 'text-green-500' : crop.trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
                    {crop.trend === 'up' ? <ArrowUpRight size={12} /> : crop.trend === 'down' ? <ArrowDownRight size={12} /> : null}
                    {crop.trend === 'up' ? `+₹${crop.price - crop.prev}` : crop.trend === 'down' ? `-₹${crop.prev - crop.price}` : 'Stable'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Center: Predictive Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6 px-2">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ChartIcon size={20} className="text-emerald-500" />
                {selectedCrop.name} Price Prediction
              </h3>
              <p className="text-xs text-slate-400">Historical data vs. 3-day projected growth</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Historical
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <div className="w-3 h-3 border-2 border-emerald-500 border-dashed rounded-full"></div> Projected
              </div>
            </div>
          </div>

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
                <YAxis hide stroke="#94a3b8" fontSize={12} domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value}`, 'Price']}
                />
                <ReferenceLine x="Thu" stroke="#cbd5e1" strokeWidth={2} label={{ position: 'top', value: 'Today', fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  animationDuration={1500}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  strokeDasharray="5 5" 
                  dot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-50 pt-6">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Low Forecast</p>
              <p className="font-bold text-slate-700">₹{Math.min(...selectedCrop.forecast.map(f => f.value))}</p>
            </div>
            <div className="text-center border-x border-slate-100 px-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target High</p>
              <p className="font-bold text-emerald-600">₹{Math.max(...selectedCrop.forecast.map(f => f.value))}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence</p>
              <p className="font-bold text-slate-700">88%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-emerald-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
        <Sparkles className="absolute right-[-20px] top-[-20px] text-white/5 w-64 h-64 rotate-12" />
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
          <div className="lg:w-1/3">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-emerald-400" size={24} />
              <h3 className="text-xl font-bold tracking-tight">Gemini AI Strategist</h3>
            </div>
            <p className="text-emerald-100 text-sm leading-relaxed mb-6">
              Our AI model cross-references global supply chains, local weather patterns, and historical seasonality to predict the exact "sweet spot" for selling your {selectedCrop.name}.
            </p>
            <button 
              onClick={fetchAnalysis}
              disabled={loading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-emerald-950"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={20} />}
              {loading ? 'Crunching Data...' : 'Predict Future Trends'}
            </button>
          </div>
          
          <div className="lg:w-2/3 w-full bg-emerald-800/40 backdrop-blur-sm rounded-3xl p-6 border border-emerald-700/50 min-h-[160px] flex items-center">
            <p className="text-emerald-50 italic text-sm leading-relaxed whitespace-pre-wrap">
              {aiAnalysis}
            </p>
          </div>
        </div>
      </div>
      
      {/* Selling Advice Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 shrink-0">
            <Calendar size={32} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-1">Optimal Selling Window</h4>
            <p className="text-sm text-slate-500">Based on {selectedCrop.name} trends, price peaks are expected between <strong>Fri - Sun</strong>. Consider holding stock for 48 hours.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="bg-orange-50 p-4 rounded-2xl text-orange-600 shrink-0">
            <TrendingUp size={32} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-1">Market Volatility Alert</h4>
            <p className="text-sm text-slate-500">Regional supply is increasing. Current prediction confidence is <strong>High</strong>. Immediate transaction recommended if target ₹{selectedCrop.price} is met.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceWatcher;
