
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PriceWatcher from './components/PriceWatcher';
import FarmFlow from './components/FarmFlow';
import BuyersConnect from './components/BuyersConnect';
import TechStack from './components/TechStack';
import ImplementationGuide from './components/ImplementationGuide';
import Profile from './components/Profile';
import { AppView, FarmerNotification, Language } from './types';
import { 
  Bell, User, LayoutGrid, X, AlertTriangle, ShieldAlert, ChevronRight, Settings, Languages, Menu,
  Droplets, LayoutDashboard, TrendingUp, ShoppingCart, Cpu, Workflow 
} from 'lucide-react';
import { translations } from './utils/translations';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [language, setLanguage] = useState<Language>('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<FarmerNotification[]>([
    {
      id: '1',
      title: 'Moisture Restoration',
      message: 'Plot 7 moisture normalized. Auto-irrigation sequence completed.',
      severity: 'info',
      timestamp: new Date(),
      read: false,
      category: 'soil'
    },
    {
      id: '2',
      title: 'Precision Tip',
      message: 'UV levels rising. Adjusting irrigation timing for reduced transpiration.',
      severity: 'info',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      category: 'pesticide'
    }
  ]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [toast, setToast] = useState<FarmerNotification | null>(null);

  const t = translations[language] || translations.en;

  useEffect(() => {
    const timer = setTimeout(() => {
      const newAlert: FarmerNotification = {
        id: Date.now().toString(),
        title: 'Market Opportunity',
        message: 'Soybean prices spiked 4.2% in local mandi. Review selling strategy.',
        severity: 'info',
        timestamp: new Date(),
        read: false,
        category: 'market'
      };
      setNotifications(prev => [newAlert, ...prev]);
      setToast(newAlert);
      setTimeout(() => setToast(null), 8000);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard language={language} />;
      case AppView.PRICE_WATCHER: return <PriceWatcher />;
      case AppView.FARM_FLOW: return <FarmFlow language={language} />;
      case AppView.BUYERS_CONNECT: return <BuyersConnect />;
      case AppView.PROFILE: return <Profile />;
      case AppView.TECH_STACK: return <TechStack />;
      case AppView.IMPLEMENTATION: return <ImplementationGuide />;
      default: return <Dashboard language={language} />;
    }
  };

  const languages: { code: Language, label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' }
  ];

  const getViewTitle = () => {
    const key = currentView.toLowerCase().replace('_', '');
    const localized = t[key];
    return typeof localized === 'string' ? localized : currentView.replace('_', ' ').toLowerCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <Sidebar currentView={currentView} setView={setCurrentView} language={language} />
      
      <main className="lg:pl-64 min-h-screen transition-all duration-300">
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-xl text-slate-500">
                 <LayoutGrid size={18} />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-slate-900 capitalize tracking-tight">
                  {getViewTitle()}
                </span>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-slate-400 font-medium">{String(t.searchHub || 'Search Hub')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-6">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <Languages size={14} className="ml-2 lg:ml-3 text-slate-400" />
              <select 
                className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest px-1 lg:px-2 py-1.5 cursor-pointer appearance-none"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-1 lg:gap-2 lg:pr-6 lg:border-r border-slate-100">
              <button className="hidden sm:block p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                 <Settings size={20} />
              </button>
              <div className="relative cursor-pointer group" onClick={() => setShowNotificationCenter(!showNotificationCenter)}>
                <div className={`p-2 lg:p-2.5 rounded-xl transition-all ${showNotificationCenter ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-50 text-slate-400 hover:text-emerald-600'}`}>
                  <Bell size={20} />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-emerald-500 text-white text-[9px] w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full flex items-center justify-center font-black border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-3 group cursor-pointer ml-2" onClick={() => setCurrentView(AppView.PROFILE)}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800 tracking-tight group-hover:text-emerald-600 transition-colors">Krishan F.</p>
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-1.5 py-0.5 rounded">{String(t.regionalLead || 'Regional Lead')}</p>
              </div>
              <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl lg:rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <User size={22} />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-10 max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 z-[45] lg:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-emerald-950 z-[50] lg:hidden transform transition-transform duration-300 p-6 flex flex-col">
             <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2">
                   <Droplets className="text-emerald-500" />
                   <h1 className="text-white font-black">SMART Kisan</h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                   <X size={20} />
                </button>
             </div>
             <nav className="flex-1 space-y-2">
                {[
                   { id: AppView.DASHBOARD, label: t.dashboard, icon: LayoutDashboard },
                   { id: AppView.PRICE_WATCHER, label: t.market, icon: TrendingUp },
                   { id: AppView.FARM_FLOW, label: t.precision, icon: Droplets },
                   { id: AppView.BUYERS_CONNECT, label: t.trade, icon: ShoppingCart },
                   { id: AppView.PROFILE, label: "My Profile", icon: User },
                   { id: AppView.TECH_STACK, label: t.infrastructure, icon: Cpu },
                   { id: AppView.IMPLEMENTATION, label: t.setup, icon: Workflow }
                ].map(item => (
                   <button
                      key={item.id}
                      onClick={() => { setCurrentView(item.id); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${currentView === item.id ? 'bg-emerald-600 text-white' : 'text-emerald-200/60'}`}
                   >
                      <item.icon size={18} />
                      <span className="font-bold text-sm">{String(item.label)}</span>
                   </button>
                ))}
             </nav>
          </div>
        </>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 lg:bottom-10 lg:right-10 z-[100] animate-fadeIn w-[calc(100%-2rem)] sm:w-96">
          <div className="p-5 rounded-[2rem] shadow-2xl bg-slate-900 text-white border border-slate-800 flex gap-4 ring-1 ring-white/10">
            <div className="shrink-0 p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/30">
              <ShieldAlert size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-black text-white text-sm tracking-tight">{toast.title}</h4>
                <button onClick={() => setToast(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {showNotificationCenter && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 z-[50] backdrop-blur-md transition-all duration-500" onClick={() => setShowNotificationCenter(false)} />
          <div className="fixed right-0 top-0 bottom-0 lg:right-4 lg:top-4 lg:bottom-4 w-full sm:w-[420px] bg-white z-[60] shadow-2xl lg:rounded-[3rem] animate-fadeIn p-6 lg:p-8 flex flex-col border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">{String(t.logs || 'System Logs')}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{String(t.stream || 'Sensor Stream')}</p>
              </div>
              <button onClick={() => setShowNotificationCenter(false)} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {notifications.map(n => (
                <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-5 rounded-[2rem] border transition-all cursor-pointer group ${n.read ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 rounded-lg ${n.severity === 'critical' ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-600'}`}>
                      {n.severity === 'critical' ? <AlertTriangle size={14} /> : <ShieldAlert size={14} />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{n.category}</span>
                  </div>
                  <h5 className="font-black text-slate-800 text-sm mb-1 tracking-tight">{n.title}</h5>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{n.message}</p>
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-[10px] text-slate-400 font-bold">{n.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
