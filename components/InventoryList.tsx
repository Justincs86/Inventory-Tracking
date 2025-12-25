
import React, { useState, useMemo, useEffect } from 'react';
import { InventoryItem } from '../types';
import { 
  Plus, 
  Tag, 
  MapPin, 
  Settings2, 
  Save, 
  X, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle, 
  Edit3, 
  Sparkles, 
  Edit2, 
  Settings,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import QuantityStepper from './QuantityStepper';

interface InventoryListProps {
  inventory: InventoryItem[];
  categories: string[];
  onAddStock: (item: Partial<InventoryItem>) => void;
  onAdjustStock: (itemId: string, newTotal: number, reason: string, newCategory?: string, newLocation?: string, newSku?: string) => void;
  onDeleteItem: (itemId: string) => void;
  onDeleteCategory: (categoryName: string) => void;
}

const CATEGORY_PREFIX_MAP: Record<string, string> = {
  'Tools': 'TOL',
  'Safety': 'SAF',
  'Testing': 'TST',
  'Mechanical': 'MEC',
  'Electrical': 'ELE',
  'General': 'GEN'
};

const InventoryList: React.FC<InventoryListProps> = ({ 
  inventory, 
  categories,
  onAddStock, 
  onAdjustStock, 
  onDeleteItem,
  onDeleteCategory
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [categoryToConfirm, setCategoryToConfirm] = useState<string | null>(null);
  
  const [editCategorySelection, setEditCategorySelection] = useState<string>('');
  const [editManualCategoryName, setEditManualCategoryName] = useState<string>('');
  const [editSku, setEditSku] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editLocation, setEditLocation] = useState<string>('');
  const [adjustValue, setAdjustValue] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [categorySelection, setCategorySelection] = useState<string>('');
  const [manualCategoryName, setManualCategoryName] = useState<string>('');
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    sku: '', name: '', category: '', quantity: 1, location: ''
  });

  const generateSKU = (category: string) => {
    let prefix = CATEGORY_PREFIX_MAP[category];
    if (!prefix) {
      prefix = category.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
      if (prefix.length < 3) prefix = prefix.padEnd(3, 'Z');
    }
    const regex = new RegExp(`^${prefix}-(\\d+)$`);
    const existingNumbers = inventory
      .filter(item => item.sku.startsWith(prefix))
      .map(item => {
        const match = item.sku.match(regex);
        return match ? parseInt(match[1], 10) : 0;
      });
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
  };

  useEffect(() => {
    if (categorySelection && categorySelection !== 'MANUAL') {
      const generated = generateSKU(categorySelection);
      setNewItem(prev => ({ ...prev, sku: generated, category: categorySelection }));
      setManualCategoryName('');
    } else if (categorySelection === 'MANUAL') {
      const generated = generateSKU('MANUAL');
      setNewItem(prev => ({ ...prev, sku: generated }));
    }
  }, [categorySelection, inventory]);

  useEffect(() => {
    if (categorySelection === 'MANUAL' && manualCategoryName.length >= 2) {
      const generated = generateSKU(manualCategoryName);
      setNewItem(prev => ({ ...prev, sku: generated }));
    }
  }, [manualCategoryName]);

  useEffect(() => {
    if (adjustingId) {
      if (editCategorySelection && editCategorySelection !== 'MANUAL') {
        const generated = generateSKU(editCategorySelection);
        setEditSku(generated);
        setEditCategory(editCategorySelection);
        setEditManualCategoryName('');
      }
    }
  }, [editCategorySelection]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchTerm, selectedCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = categorySelection === 'MANUAL' ? manualCategoryName : categorySelection;
    if (!newItem.sku || !newItem.name || !finalCategory) {
      alert("Please fill in all required fields.");
      return;
    }
    onAddStock({ ...newItem, category: finalCategory });
    setNewItem({ sku: '', name: '', category: '', quantity: 1, location: '' });
    setCategorySelection('');
    setManualCategoryName('');
    setShowAddForm(false);
  };

  const handleStartAdjust = (item: InventoryItem) => {
    setConfirmDeleteId(null);
    setAdjustingId(item.id);
    setAdjustValue(item.quantity);
    setEditCategory(item.category);
    setEditCategorySelection(item.category);
    setEditLocation(item.location);
    setEditSku(item.sku);
    setEditManualCategoryName('');
    setAdjustReason('Regular detail update');
  };

  const handleConfirmAdjust = (itemId: string) => {
    const finalCategory = editCategorySelection === 'MANUAL' ? editManualCategoryName : editCategorySelection;
    onAdjustStock(itemId, adjustValue, adjustReason, finalCategory, editLocation, editSku);
    setAdjustingId(null);
  };

  const handleStartDelete = (itemId: string) => {
    setAdjustingId(null);
    setConfirmDeleteId(itemId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Stock Book</h3>
          <button 
            onClick={() => {
              setShowCategoryManager(!showCategoryManager);
              setCategoryToConfirm(null);
            }}
            className={`p-2 transition-all rounded-lg border shadow-sm ${showCategoryManager ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:text-blue-600'}`}
            title="Manage Categories"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 ring-blue-500 outline-none w-full md:w-48 lg:w-64 text-slate-800 dark:text-slate-100 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 ring-blue-500 outline-none appearance-none cursor-pointer w-full sm:min-w-[120px] text-slate-800 dark:text-slate-100 transition-colors"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={() => {
                setShowAddForm(!showAddForm);
                setShowCategoryManager(false);
              }}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2 hover:bg-blue-700 shadow-md transition-all active:scale-95 flex-1 sm:flex-initial"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-bold whitespace-nowrap">Receive Stock</span>
            </button>
          </div>
        </div>
      </div>

      {showCategoryManager && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg animate-in slide-in-from-top-4 transition-colors">
          <div className="flex items-center justify-between mb-4 pb-4 border-b dark:border-slate-800">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100">Category Manager</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Managing organizational segments and storage protocols.</p>
            </div>
            <button onClick={() => setShowCategoryManager(false)} className="text-slate-400 hover:text-red-500"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map(cat => {
              const isConfirming = categoryToConfirm === cat;
              const itemCount = inventory.filter(i => i.category === cat).length;
              return (
                <div 
                  key={cat} 
                  className={`group relative flex flex-col justify-center p-4 rounded-xl border transition-all duration-200 ${
                    isConfirming 
                      ? 'bg-red-600 border-red-700 shadow-inner' 
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-blue-200 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'
                  }`}
                >
                  {!isConfirming ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                          <Tag className={`w-4 h-4 ${cat === 'General' ? 'text-slate-400' : 'text-blue-500'}`} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block truncate max-w-[120px]">{cat}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{itemCount} items linked</span>
                        </div>
                      </div>
                      {cat !== 'General' && (
                        <button 
                          onClick={() => setCategoryToConfirm(cat)}
                          className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2 animate-in fade-in zoom-in-95">
                      <div className="flex items-center space-x-2 text-white">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Confirm Delete?</span>
                      </div>
                      <div className="flex space-x-2 w-full">
                        <button 
                          onClick={() => { onDeleteCategory(cat); setCategoryToConfirm(null); }}
                          className="flex-1 bg-white text-red-600 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors"
                        >
                          DELETE
                        </button>
                        <button 
                          onClick={() => setCategoryToConfirm(null)}
                          className="px-3 bg-red-700/50 text-white py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-blue-200 dark:border-blue-900 shadow-lg animate-in slide-in-from-top-4 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-blue-800 dark:text-blue-400">Register Incoming Shipment</h4>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-red-500"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Category</label>
              <select 
                required
                className="w-full border-2 border-slate-100 dark:border-slate-800 h-14 px-4 rounded-xl focus:ring-4 ring-blue-50 dark:ring-blue-900/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                value={categorySelection}
                onChange={e => setCategorySelection(e.target.value)}
              >
                <option value="">Select Category...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="MANUAL" className="font-bold text-blue-600 dark:text-blue-400 italic">+ Manual Input...</option>
              </select>
            </div>
            {categorySelection === 'MANUAL' && (
              <div className="space-y-1 animate-in slide-in-from-left-2">
                <label className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase">New Category Name</label>
                <input 
                  required autoFocus
                  className="w-full border-2 border-blue-100 dark:border-blue-900 h-14 px-4 rounded-xl focus:ring-4 ring-blue-50 dark:ring-blue-900/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100" 
                  placeholder="e.g. Hydraulics"
                  value={manualCategoryName}
                  onChange={e => setManualCategoryName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">SKU / Serial</label>
              <input 
                readOnly={categorySelection !== 'MANUAL'}
                className={`w-full border-2 h-14 px-4 rounded-xl outline-none transition-all font-mono ${
                  categorySelection === 'MANUAL' 
                  ? 'border-orange-100 dark:border-orange-900 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100' 
                  : 'border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-600'
                }`} 
                value={newItem.sku}
                onChange={e => setNewItem({...newItem, sku: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Product Name</label>
              <input 
                required
                className="w-full border-2 border-slate-100 dark:border-slate-800 h-14 px-4 rounded-xl focus:ring-4 ring-blue-50 dark:ring-blue-900/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100" 
                placeholder="Item Name"
                value={newItem.name}
                onChange={e => setNewItem({...newItem, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <QuantityStepper 
                label="Quantity" 
                value={newItem.quantity || 1} 
                onChange={(val) => setNewItem({...newItem, quantity: val})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Storage Location</label>
              <input 
                className="w-full border-2 border-slate-100 dark:border-slate-800 h-14 px-4 rounded-xl focus:ring-4 ring-blue-50 dark:ring-blue-900/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100" 
                placeholder="Shelf B1"
                value={newItem.location}
                onChange={e => setNewItem({...newItem, location: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full h-14 bg-blue-600 text-white py-2 px-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl transition-all active:scale-95">
                Confirm Receipt
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quantity (Avail/Total)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInventory.map(item => (
                <React.Fragment key={item.id}>
                  <tr className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${confirmDeleteId === item.id ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded ${confirmDeleteId === item.id ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 font-mono uppercase">{item.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.availableQuantity} / {item.quantity}</div>
                        <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div 
                            className={`h-full ${item.availableQuantity === 0 ? 'bg-red-500' : 'bg-blue-500'}`} 
                            style={{ width: `${(item.availableQuantity / item.quantity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{item.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        {confirmDeleteId === item.id ? (
                          <div className="flex items-center bg-white dark:bg-slate-800 border-2 border-red-200 dark:border-red-900 rounded-xl shadow-md overflow-hidden animate-in fade-in zoom-in-95">
                            <button 
                              onClick={() => { onDeleteItem(item.id); setConfirmDeleteId(null); }}
                              className="px-4 py-3 text-[10px] font-black bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center uppercase"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" /> CONFIRM
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-3 text-[10px] font-black text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 uppercase">
                              CANCEL
                            </button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => handleStartAdjust(item)} className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                              <Settings2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleStartDelete(item.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {adjustingId === item.id && (
                    <tr className="bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900">
                      <td colSpan={5} className="px-6 py-8">
                        <div className="flex flex-col space-y-6">
                          <h4 className="flex items-center text-sm font-bold text-indigo-800 dark:text-indigo-400 space-x-2 uppercase tracking-wide">
                            <Edit3 className="w-4 h-4" />
                            <span>Editing Record: {item.name}</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="flex flex-col">
                              <label className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-1 ml-1">Category</label>
                              <select 
                                className="border-2 border-indigo-200 dark:border-indigo-900 h-14 px-4 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                                value={editCategorySelection}
                                onChange={e => setEditCategorySelection(e.target.value)}
                              >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                <option value="MANUAL">+ Manual Input...</option>
                              </select>
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-1 ml-1">SKU / Serial</label>
                              <input 
                                className="border-2 border-indigo-200 dark:border-indigo-900 h-14 px-4 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono uppercase outline-none"
                                value={editSku}
                                onChange={e => setEditSku(e.target.value.toUpperCase())}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-1 ml-1">Storage Location</label>
                              <input 
                                className="border-2 border-indigo-200 dark:border-indigo-900 h-14 px-4 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                                value={editLocation}
                                onChange={e => setEditLocation(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 pt-2">
                            <button onClick={() => handleConfirmAdjust(item.id)} className="flex-1 h-14 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl transition-all">
                              <Save className="w-5 h-5 inline mr-2" /> Save Changes
                            </button>
                            <button onClick={() => setAdjustingId(null)} className="flex-1 h-14 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-black uppercase transition-all">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;
