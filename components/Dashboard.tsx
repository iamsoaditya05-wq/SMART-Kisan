
import React from 'react';
import { Thermometer, Droplets, Wind, Sun, AlertTriangle, ShieldAlert, Bug, Droplet, Zap, Activity } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const mockData = [
  { time: '08:00', moisture: 45, temp: 24 },
  { time: '10:00', moisture: 42, temp: 26 },
  { time: '12:00', moisture: 38, temp: 29 },
  { time: '14:00', moisture: 35, temp: 31 },
  { time: '16:00', moisture: 48, temp: 28 },
  { time: '18:00', moisture: 50, temp: 26 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Farm Overview</h2>
          <p className="text-slate-500 font-medium">Monitoring 24 Active Plots across Region A-4</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Gateway Live</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Droplets} label="Avg. Moisture" value="38.4%" trend="+2.1%" unit="Optimal" color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={Thermometer} label="Soil Temperature" value="24.8°C" trend="-0.5%" unit="Normal" color="text-orange-600" bg="bg-orange-50" />
        <StatCard icon={Zap} label="Energy Usage" value="12.2 kWh" trend="Stable" unit="Efficient" color="text-yellow-600" bg="bg-yellow-50" />
        <StatCard icon={Activity} label="Crop Health" value="94/100" trend="+4%" unit="Excellent" color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Soil Hydration Telemetry</h3>
              <p className="text-xs text-slate-400 font-medium">Real-time multispectral sensor aggregate</p>
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-2xl text-xs font-bold border border-emerald-100">
              Automation: Enabled
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} fontWeight="600" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={11} fontWeight="600" axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="moisture" stroke="#10b981" fillOpacity={1} fill="url(#colorMoisture)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <ShieldAlert size={120} />
          </div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
            <ShieldAlert className="text-emerald-400" size={24} />
            System Intelligence
          </h3>
          <div className="flex-1 space-y-5 relative z-10">
            <AlertItem 
              type="critical" 
              title="Critical Moisture" 
              message="Plot 4 sensor detected 18%. Emergency valve override successful." 
            />
            <AlertItem 
              type="warning" 
              title="Anomaly Detected" 
              message="Unusual thermal signature in North Sector. Drone dispatch suggested." 
            />
            <AlertItem 
              type="info" 
              title="Efficiency Insight" 
              message="Night irrigation cycles could save 12% water loss via evaporation." 
            />
          </div>
          <button className="mt-8 w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-950/20 active:scale-[0.98] relative z-10">
            Resolve All Tasks
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, unit, trend, color, bg }: any) => (
  <div className="p-6 rounded-[2rem] shadow-sm border border-slate-100 bg-white group hover:shadow-xl hover:border-emerald-100 transition-all cursor-default">
    <div className="flex justify-between items-start mb-4">
      <div className={`${bg} p-3.5 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
        {trend}
      </div>
    </div>
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-slate-800">{value}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bg} ${color}`}>{unit}</span>
      </div>
    </div>
  </div>
);

const AlertItem = ({ type, title, message }: any) => {
  const styles = {
    critical: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400'
  }[type as 'critical' | 'warning' | 'info'];

  return (
    <div className={`${styles} p-4 rounded-2xl flex gap-3 items-start border backdrop-blur-sm`}>
      <div className="shrink-0 mt-0.5">
        {type === 'critical' ? <AlertTriangle size={18} /> : type === 'warning' ? <Bug size={18} /> : <Droplet size={18} />}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{title}</p>
        <p className="text-xs text-emerald-50 leading-relaxed font-medium">
          {message}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
