
import React from 'react';
import { Map, Settings, Play, CheckCircle, Search, Rocket } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: "1. Site Audit",
    desc: "Soil testing & field boundary mapping using satellites.",
    color: "bg-blue-100 text-blue-600",
    farmerAction: "Register field on app and order sensor kit."
  },
  {
    icon: Settings,
    title: "2. Sensor Deployment",
    desc: "Placing IoT probes (NPK, Moisture) in specific grids.",
    color: "bg-orange-100 text-orange-600",
    farmerAction: "Insert sensors into soil; connect to gateway."
  },
  {
    icon: Play,
    title: "3. Calibration",
    desc: "AI model learns soil patterns & local micro-climate.",
    color: "bg-purple-100 text-purple-600",
    farmerAction: "Wait 48h for data baseline generation."
  },
  {
    icon: Map,
    title: "4. Automation Set",
    desc: "Link solenoid valves to moisture triggers.",
    color: "bg-emerald-100 text-emerald-600",
    farmerAction: "Set moisture thresholds for auto-irrigation."
  },
  {
    icon: Rocket,
    title: "5. Active Farming",
    desc: "Receive disease alerts & market price updates.",
    color: "bg-pink-100 text-pink-600",
    farmerAction: "Follow daily AI tasks and fertilization advice."
  },
  {
    icon: CheckCircle,
    title: "6. Direct Trade",
    desc: "Post harvest to Buyers Connect & secure payment.",
    color: "bg-indigo-100 text-indigo-600",
    farmerAction: "Accept pitches and lock smart contracts."
  }
];

const ImplementationGuide: React.FC = () => {
  return (
    <div className="space-y-12 animate-fadeIn max-w-4xl mx-auto pb-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 text-emerald-900">Implementation Methodology</h2>
        <p className="text-slate-500">Step-by-step process for a farmer to transition to SMART Kisan platform.</p>
      </div>

      <div className="relative space-y-12">
        {/* The Connection Line */}
        <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-1 bg-emerald-100 -z-0"></div>

        {steps.map((step, idx) => (
          <div key={idx} className={`relative z-10 flex flex-col md:flex-row items-start gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
            <div className={`flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
              <h3 className="font-bold text-lg mb-2 text-slate-900">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">{step.desc}</p>
              <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${step.color}`}>
                Platform Logic
              </div>
            </div>

            <div className="shrink-0 flex items-center justify-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4 border-white ${step.color}`}>
                <step.icon size={32} />
              </div>
            </div>

            <div className="flex-1 bg-emerald-900 text-white p-6 rounded-3xl shadow-lg border-b-4 border-emerald-500">
              <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Farmer Action</h4>
              <p className="text-sm font-medium leading-relaxed italic">
                "{step.farmerAction}"
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="bg-emerald-200 p-6 rounded-3xl text-emerald-800">
            <CheckCircle size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-900 mb-2">Benefit Summary</h3>
            <p className="text-emerald-700 text-sm leading-relaxed">
              By following this 6-step roadmap, farmers reduce water wastage by <span className="font-bold">40%</span>, increase yields by <span className="font-bold">25%</span>, and bypass middlemen to gain <span className="font-bold">15-20%</span> higher profit margins through direct buyer connections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImplementationGuide;
