
import React from 'react';
import { Cpu, Server, Globe, Bot, Layers, Smartphone } from 'lucide-react';

const TechStack: React.FC = () => {
  const stacks = [
    {
      title: "Hardware & IoT",
      icon: Cpu,
      items: ["ESP32 Microcontroller", "NPK Soil Sensors", "DHT11 (Temp/Hum)", "Solenoid Water Valves", "LoRaWAN / MQTT"],
      color: "border-orange-500 text-orange-600 bg-orange-50"
    },
    {
      title: "Backend & Cloud",
      icon: Server,
      items: ["Python (FastAPI)", "PostgreSQL (Database)", "AWS IoT Core", "Docker Containers", "Firebase (Push Notify)"],
      color: "border-blue-500 text-blue-600 bg-blue-50"
    },
    {
      title: "AI & ML Engine",
      icon: Bot,
      items: ["Google Gemini API", "TensorFlow (Vision)", "Scikit-Learn (Analytics)", "Sentinel-2 Satellite API", "OpenWeatherMap API"],
      color: "border-purple-500 text-purple-600 bg-purple-50"
    },
    {
      title: "Frontend & UI",
      icon: Globe,
      items: ["React.js & TypeScript", "Tailwind CSS", "Recharts (Data Viz)", "D3.js (Spatial Maps)", "Mermaid.js"],
      color: "border-emerald-500 text-emerald-600 bg-emerald-50"
    }
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">SMART Kisan Block Diagram</h2>
        <p className="text-slate-500 italic">Full architecture overview of the intelligent automation platform.</p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          {stacks.map((stack, idx) => (
            <div key={idx} className={`p-8 rounded-[2.5rem] border-2 shadow-xl bg-white ${stack.color}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-2xl ${stack.color}`}>
                  <stack.icon size={32} />
                </div>
                <h3 className="text-xl font-extrabold">{stack.title}</h3>
              </div>
              <ul className="space-y-3">
                {stack.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium">
                    <div className="w-2 h-2 rounded-full bg-current opacity-40"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Connection Visuals */}
        <div className="hidden lg:block absolute inset-0 -z-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1000 600">
            <path d="M500 0 V600 M0 300 H1000" stroke="#10b981" strokeWidth="4" strokeDasharray="10 10" />
            <circle cx="500" cy="300" r="100" fill="none" stroke="#10b981" strokeWidth="4" />
          </svg>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Smartphone className="text-emerald-400" /> Unified Mobile Experience
            </h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              The entire tech stack is accessible via a progressive web app (PWA), ensuring that farmers receive real-time push notifications even on low bandwidth networks.
            </p>
            <div className="flex gap-4">
              <span className="bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 uppercase tracking-widest">PWA Ready</span>
              <span className="bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 uppercase tracking-widest">Offline First</span>
            </div>
          </div>
          <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-inner">
             <Layers className="text-emerald-400 mx-auto mb-4" size={48} />
             <p className="text-center text-sm font-bold opacity-80">Full-Stack Interoperability</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechStack;
