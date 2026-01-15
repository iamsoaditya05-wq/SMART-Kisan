
import React, { useState } from 'react';
import { 
  ShoppingBag, Star, MapPin, CheckCircle2, ShieldCheck, CreditCard, ArrowRight, ArrowLeft,
  ChevronRight, Package, FileText, BadgeCheck, Lock, QrCode, Fingerprint, FileCheck, ShieldAlert, Database
} from 'lucide-react';
import { BuyerListing } from '../types';
import { supabase } from '../lib/supabase';

const mockBuyers: BuyerListing[] = [
  { id: '1', name: 'FreshGro Exports', type: 'Exporter', rating: 4.9, location: 'Mumbai Port Hub', verified: true },
  { id: '2', name: 'Reliance Retail', type: 'Retailer', rating: 4.8, location: 'Pan India', verified: true },
  { id: '3', name: 'Mandi Direct Wholesalers', type: 'Wholesaler', rating: 4.5, location: 'Local Market A', verified: true },
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
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    cropType: 'Wheat',
    quantity: '',
    expectedPrice: '',
    deliveryDate: ''
  });

  const handleLockContract = async () => {
    if (!isAgreed || !digitalSignature) {
      alert("Please sign and agree to terms.");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('contracts')
      .insert({
        buyer_name: selectedBuyer?.name,
        crop_type: formData.cropType,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.expectedPrice),
        contract_hash: `0x${Math.random().toString(16).slice(2, 10)}...`
      });

    if (error) {
      console.error(error);
      alert("Failed to sync with Supabase ledger.");
    } else {
      setWizardStep(4);
    }
    setSaving(false);
  };

  const renderStepContent = () => {
    switch (wizardStep) {
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
            {mockBuyers.map((buyer) => (
              <div 
                key={buyer.id}
                onClick={() => setSelectedBuyer(buyer)}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                  selectedBuyer?.id === buyer.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white'
                }`}
              >
                <h4 className="font-bold flex items-center gap-2">{buyer.name} <CheckCircle2 size={14} className="text-blue-500"/></h4>
                <p className="text-xs text-slate-500">{buyer.type}</p>
              </div>
            ))}
          </div>
        );
      case 2:
        return (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-[2.5rem] border border-slate-100 animate-fadeIn space-y-4">
             <input type="number" placeholder="Quantity" className="w-full p-4 bg-slate-50 rounded-2xl border-none" onChange={(e) => setFormData({...formData, quantity: e.target.value})}/>
             <input type="number" placeholder="Price" className="w-full p-4 bg-slate-50 rounded-2xl border-none" onChange={(e) => setFormData({...formData, expectedPrice: e.target.value})}/>
          </div>
        );
      case 3:
        return (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Database size={18} className="text-emerald-600" />
                <span className="text-xs font-black uppercase text-emerald-600">Syncing with Supabase Ledger</span>
              </div>
              <input type="password" placeholder="Digital Signature PIN" className="w-full p-4 bg-slate-50 rounded-2xl border-none" value={digitalSignature} onChange={(e) => setDigitalSignature(e.target.value)}/>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" onChange={(e) => setIsAgreed(e.target.checked)}/> I agree to smart-locked payment.</label>
              <button 
                onClick={handleLockContract} 
                disabled={saving}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock size={18} />}
                Lock Contract to Supabase
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="text-center p-10 bg-white rounded-[3rem] border border-emerald-100 animate-bounce-in">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40}/></div>
             <h2 className="text-2xl font-bold mb-2">Supabase Sync Successful</h2>
             <p className="text-slate-500">The contract is now immutable in your private cloud ledger.</p>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="flex gap-4">
          {steps.map(s => (
            <div key={s.id} className={`w-10 h-10 rounded-full flex items-center justify-center ${wizardStep >= s.id ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}><s.icon size={16}/></div>
          ))}
        </div>
      </div>
      {renderStepContent()}
      {wizardStep < 3 && (
        <div className="flex justify-between max-w-2xl mx-auto mt-10">
          <button onClick={() => setWizardStep(prev => prev - 1)} disabled={wizardStep === 1} className="px-6 py-2 text-slate-400">Back</button>
          <button onClick={() => setWizardStep(prev => prev + 1)} className="px-10 py-3 bg-emerald-600 text-white rounded-2xl font-bold">Next</button>
        </div>
      )}
    </div>
  );
};

export default BuyersConnect;
