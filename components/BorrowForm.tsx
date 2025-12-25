
import React, { useState, useMemo } from 'react';
import { InventoryItem, BorrowRecord } from '../types';
import { User, Briefcase, Calendar, PenTool, CheckCircle2, Hash, Camera } from 'lucide-react';
import CameraCapture from './CameraCapture';
import QuantityStepper from './QuantityStepper';

interface BorrowFormProps {
  inventory: InventoryItem[];
  onBorrow: (record: BorrowRecord, qty: number) => void;
}

const BorrowForm: React.FC<BorrowFormProps> = ({ inventory, onBorrow }) => {
  const [formData, setFormData] = useState({
    itemId: '',
    specialistName: '',
    department: '',
    returnDate: '',
    quantity: 1,
    acknowledged: false,
    proofImage: null as string | null
  });

  const selectedItem = useMemo(() => 
    inventory.find(i => i.id === formData.itemId), 
  [formData.itemId, inventory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !formData.acknowledged || !formData.proofImage) {
      if (!formData.proofImage) alert("Please capture a proof photo first.");
      return;
    }
    if (formData.quantity > selectedItem.availableQuantity) {
      alert("Cannot borrow more than available stock!");
      return;
    }
    const newLoan: BorrowRecord = {
      id: Math.random().toString(36).substr(2, 9),
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      specialistName: formData.specialistName,
      department: formData.department,
      borrowDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: formData.returnDate,
      quantity: formData.quantity,
      status: 'ACTIVE',
      acknowledgementSignature: `${formData.specialistName}-Signed-${Date.now()}`,
      borrowProof: formData.proofImage
    };
    onBorrow(newLoan, formData.quantity);
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
        <div className="bg-blue-600 dark:bg-blue-700 p-6 text-white">
          <h3 className="text-xl font-bold">Request for Repair Equipment</h3>
          <p className="text-blue-100 dark:text-blue-200 text-sm opacity-80">Fill in the details for tool check-out</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                <PenTool className="w-4 h-4" />
                <span>Select Item for Repair</span>
              </label>
              <select 
                required
                className="w-full border dark:border-slate-700 p-3.5 rounded-xl focus:ring-2 ring-blue-500 outline-none appearance-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm transition-colors"
                value={formData.itemId}
                onChange={e => setFormData({ ...formData, itemId: e.target.value, quantity: 1 })}
              >
                <option value="">Select an available product...</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.availableQuantity} available)
                  </option>
                ))}
              </select>
            </div>
            {formData.itemId && (
              <QuantityStepper 
                label="Borrow Quantity"
                value={formData.quantity}
                min={1} max={selectedItem?.availableQuantity || 1}
                onChange={(val) => setFormData({...formData, quantity: val})}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Specialist Name</span>
              </label>
              <input 
                required
                className="w-full border dark:border-slate-700 p-3.5 rounded-xl focus:ring-2 ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm transition-colors" 
                placeholder="Full Name"
                value={formData.specialistName}
                onChange={e => setFormData({...formData, specialistName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                <Briefcase className="w-4 h-4" />
                <span>Department</span>
              </label>
              <input 
                required
                className="w-full border dark:border-slate-700 p-3.5 rounded-xl focus:ring-2 ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm transition-colors" 
                placeholder="e.g. Electrical"
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Expected Return Date</span>
            </label>
            <input 
              required type="date"
              className="w-full border dark:border-slate-700 p-3.5 rounded-xl focus:ring-2 ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm transition-colors" 
              value={formData.returnDate}
              onChange={e => setFormData({...formData, returnDate: e.target.value})}
            />
          </div>

          <CameraCapture label="Verification Photo (Item + Specialist ID)" onCapture={(base64) => setFormData({...formData, proofImage: base64})} compact={true} />

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input 
                  id="acknowledge" type="checkbox"
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 dark:border-slate-700 focus:ring-blue-500 cursor-pointer bg-white dark:bg-slate-800"
                  checked={formData.acknowledged}
                  onChange={e => setFormData({...formData, acknowledged: e.target.checked})}
                />
              </div>
              <label htmlFor="acknowledge" className="text-xs text-slate-600 dark:text-slate-400 leading-tight font-medium cursor-pointer">
                I hereby acknowledge that I am borrowing {formData.quantity} of {selectedItem?.name || 'this item'} and promise to return it in the same condition.
              </label>
            </div>
            
            {(formData.acknowledged && formData.proofImage) && (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded p-4 bg-white dark:bg-slate-800 flex flex-col items-center justify-center animate-in zoom-in-95 transition-colors">
                <div className="w-full h-16 border-b border-slate-200 dark:border-slate-700 flex items-end justify-center pb-1 mb-1 italic text-slate-800 dark:text-slate-100 font-serif text-xl text-center">
                  {formData.specialistName || 'Digital Signature'}
                </div>
                <p className="text-[8px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Authorized Specialist Digital ID</p>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={!formData.acknowledged || !formData.itemId || !formData.proofImage}
            className={`w-full p-4 h-14 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg transition-all ${
              (formData.acknowledged && formData.proofImage)
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-500/20' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Confirm Borrow Record</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default BorrowForm;
