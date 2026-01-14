
import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Droplets, 
  ShoppingCart, 
  Cpu, 
  Workflow,
  ShieldCheck
} from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Control Center', icon: LayoutDashboard },
    { id: AppView.PRICE_WATCHER, label: 'Market Analytics', icon: TrendingUp },
    { id: AppView.FARM_FLOW, label: 'Precision Ag', icon: Droplets },
    { id: AppView.BUYERS_CONNECT, label: 'Trade Network', icon: ShoppingCart },
    { id: AppView.TECH_STACK, label: 'Infrastructure', icon: Cpu },
    { id: AppView.IMPLEMENTATION, label: 'System Setup', icon: Workflow },
  ];

  return (
    <div className="w-64 bg-emerald-950 h-screen fixed left-0 top-0 text-white flex flex-col p-6 shadow-2xl z-20 border-r border-emerald-900/50">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
          <Droplets size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight leading-none">SMART Kisan</h1>
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Enterprise Ag-Tech</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              currentView === item.id 
                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/50 translate-x-1' 
                : 'text-emerald-300/70 hover:bg-emerald-900/50 hover:text-white'
            }`}
          >
            <item.icon size={20} className={`${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
            <span className="font-semibold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-emerald-900/50">
        <div className="bg-emerald-900/30 p-4 rounded-2xl border border-emerald-800/50">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">System Status</span>
          </div>
          <p className="text-xs font-semibold text-emerald-100">Global Network: Online</p>
          <div className="mt-2 w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[98%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
