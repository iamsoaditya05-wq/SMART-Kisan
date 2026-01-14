
import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Star, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight,
  Package,
  FileText,
  BadgeCheck,
  Lock,
  QrCode,
  Fingerprint,
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { BuyerListing } from '../types';

const mockBuyers: BuyerListing[] = [
  { id: '1', name: 'FreshGro Exports', type: 'Exporter', rating: 4.9, location: 'Mumbai Port Hub', verified: true },
  { id: '2', name: 'Reliance Retail', type: 'Retailer', rating: 4.8, location: 'Pan India', verified: true },
  { id: '3', name: 'Mandi Direct Wholesalers', type: 'Wholesaler', rating: 4.5, location: 'Local Market A', verified: true },
  { id: '4', name: 'Organic Roots Co.', type: 'Exporter', rating: 5.0, location: 'International', verified: false },
];

const steps = [
  { id: 1, label: 'Select Partner', icon: ShoppingBag },
  { id: 2, label: 'Crop Details', icon: Package },
  { id: 3, label: 'Lock Contract', icon: Lock },
  { id: 4, label: 'Digital Receipt', icon: FileCheck },
];

const BuyersConnect: React.FC = () => {
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerListing | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState('');
  const [formData, setFormData] = useState({
    cropType: 'Wheat',
    quantity: '',
    expectedPrice: '',
    deliveryDate: ''
  });

  const handleNext = () => {
    if (wizardStep === 3 && (!isAgreed || !digitalSignature)) {
      alert("Please sign and agree to the terms to lock the contract.");
      return;
    }
    setWizardStep(prev => Math.min(prev + 1, 4));
  };
  
  const handleBack = () => setWizardStep(prev => Math.max(prev - 1, 1));

  const renderProgress = () => (
    <div className="flex items-center justify-between mb-12 max-w-3xl mx-auto">
      {steps.map((s, idx) => (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center gap-2 relative group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              wizardStep >= s.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-110' 
                : 'bg-white text-slate-300 border border-slate-200'
            }`}>
              <s.icon size={20} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
              wizardStep >= s.id ? 'text-emerald-700' : 'text-slate-400'
            }`}>
              {s.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-4 rounded-full transition-all duration-500 ${
              wizardStep > s.id ? 'bg-emerald-600' : 'bg-slate-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (wizardStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-slate-800">Choose your verified buyer</h3>
              <p className="text-sm text-slate-500">Only verified buyers with active security deposits are shown.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockBuyers.map((buyer) => (
                <div 
                  key={buyer.id}
                  onClick={() => setSelectedBuyer(buyer)}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer group ${
                    selectedBuyer?.id === buyer.id 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-slate-100 bg-white hover:border-emerald-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl transition-colors ${
                      selectedBuyer?.id === buyer.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <ShoppingBag size={24} />
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-lg text-xs font-bold">
                      <Star size={12} fill="currentColor" />
                      {buyer.rating}
                    </div>
                  </div>
                  <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                    {buyer.name}
                    {buyer.verified && <CheckCircle2 size={16} className="text-blue-500" />}
                  </h4>
                  <p className="text-slate-500 text-sm mb-3">{buyer.type}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <MapPin size={14} />
                      {buyer.location}
                    </div>
                    {selectedBuyer?.id === buyer.id && (
                      <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                        Selected <ChevronRight size={14} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-fadeIn">
            <h3 className="text-xl font-bold mb-6">Listing Specifications</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Crop Variety</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.cropType}
                  onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                >
                  <option>Wheat (HD-2967)</option>
                  <option>Basmati Rice</option>
                  <option>Yellow Corn</option>
                  <option>Organic Soybean</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Quantity (Quintals)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 50"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Price (per Qtl)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 2150"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.expectedPrice}
                    onChange={(e) => setFormData({...formData, expectedPrice: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Harvest/Delivery Date</label>
                <input 
                  type="date" 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-emerald-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
              <ShieldCheck className="absolute right-[-20px] top-[-20px] text-white/5 w-48 h-48 rotate-12" />
              <div className="relative z-10 flex items-center gap-4 mb-6">
                <div className="bg-emerald-500 p-3 rounded-2xl">
                  <Lock size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Fraud-Proof Smart Contract</h3>
                  <p className="text-emerald-200 text-xs">Immutable Ledger Registration</p>
                </div>
              </div>
              
              <div className="space-y-4 text-sm bg-emerald-800/40 p-6 rounded-3xl border border-emerald-700/50">
                <div className="flex justify-between border-b border-emerald-700/50 pb-2">
                  <span className="text-emerald-300">Selected Buyer:</span>
                  <span className="font-bold">{selectedBuyer?.name}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-700/50 pb-2">
                  <span className="text-emerald-300">Agreed Price:</span>
                  <span className="font-bold">₹{formData.expectedPrice} / Qtl</span>
                </div>
                <div className="flex justify-between border-b border-emerald-700/50 pb-2">
                  <span className="text-emerald-300">Escrow Security:</span>
                  <span className="font-bold text-emerald-400">Guaranteed by Quasar Reserve</span>
                </div>
                <div className="flex justify-between border-b border-emerald-700/50 pb-2">
                  <span className="text-emerald-300">Total Contract Value:</span>
                  <span className="font-bold text-emerald-400 text-lg">₹{Number(formData.quantity) * Number(formData.expectedPrice)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                <ShieldAlert className="text-amber-500 shrink-0" size={20} />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Transparency Lock:</strong> Once signed, this price is locked on the blockchain. Any attempt at side-deals or payment delays will trigger the buyer's security deposit.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={isAgreed} 
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                    I confirm the crop quality meets "A-Grade" standards and agree to the <strong>Locked Smart Payout</strong> terms.
                  </span>
                </label>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Farmer Digital Signature / Aadhaar PIN</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      placeholder="Enter secure signature PIN"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
                      value={digitalSignature}
                      onChange={(e) => setDigitalSignature(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="max-w-2xl mx-auto space-y-6 animate-bounce-in">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-emerald-100 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                 <QrCode size={120} />
              </div>

              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-emerald-50">
                <CheckCircle2 size={48} />
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Contract Successfully Locked</h2>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                Immutable proof of trade generated. Both parties are now bound by the digital escrow.
              </p>

              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-left space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Certificate</p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">
                    <ShieldCheck size={12} /> VERIFIED BY SMART KISAN LEDGER
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Contract Hash:</span>
                    <span className="text-sm font-mono font-bold text-slate-700 truncate block">0x7f4a...92de1b</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Timestamp:</span>
                    <span className="text-sm font-bold text-slate-700">{new Date().toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Buyer ID:</span>
                    <span className="text-sm font-bold text-slate-700">{selectedBuyer?.id}-V</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Status:</span>
                    <span className="text-sm font-bold text-blue-600">Locked & Active</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center gap-4">
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <QrCode size={64} className="text-slate-800" />
                  </div>
                  <div className="text-xs text-slate-500">
                    Scan this QR code during cargo inspection to verify contract terms without a middleman.
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  onClick={() => window.print()}
                >
                  <FileText size={18} /> Download PDF
                </button>
                <button 
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all"
                  onClick={() => {
                    setWizardStep(1);
                    setSelectedBuyer(null);
                    setDigitalSignature('');
                    setIsAgreed(false);
                  }}
                >
                  Return Home
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Smart Trade Wizard</h2>
          <p className="text-slate-500 text-sm">Automated contract enforcement and transparency layer.</p>
        </div>
      </div>

      {renderProgress()}

      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      {wizardStep < 4 && (
        <div className="flex justify-between items-center max-w-3xl mx-auto mt-12 pt-8 border-t border-slate-100">
          <button 
            onClick={handleBack}
            disabled={wizardStep === 1}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all disabled:opacity-0"
          >
            <ArrowLeft size={18} />
            Previous
          </button>

          {wizardStep === 1 && !selectedBuyer ? (
            <p className="text-xs text-slate-400 font-medium italic">Please select a buyer to continue</p>
          ) : (
            <button 
              onClick={handleNext}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${
                wizardStep === 3 
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-100' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'
              }`}
            >
              {wizardStep === 3 ? (
                <>
                  <Lock size={18} /> Sign & Lock Smart Contract
                </>
              ) : (
                <>
                  Continue <ArrowRight size={18} />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BuyersConnect;
