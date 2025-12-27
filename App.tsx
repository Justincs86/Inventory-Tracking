
import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  UserPlus,
  History,
  LayoutDashboard,
  PlusCircle,
  ArrowLeftRight,
  ClipboardList,
  Search,
  AlertTriangle,
  FileSpreadsheet,
  ShieldAlert,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';
import { InventoryItem, BorrowRecord, TransactionLog, ReturnCondition, AppUser } from './types';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import BorrowForm from './components/BorrowForm';
import ActiveLoans from './components/ActiveLoans';
import HistoryLog from './components/HistoryLog';
import IncidentLog from './components/IncidentLog';

// Main App Component
const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'inventory' | 'borrow' | 'loans' | 'history' | 'incidents'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('mainti_theme') === 'dark');

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('mainti_inventory');
    return saved ? JSON.parse(saved) : [
      { id: '1', sku: 'TOL-001', name: 'Fluke Multimeter', category: 'Testing', quantity: 5, availableQuantity: 3, location: 'Shelf A1', lastUpdated: new Date().toISOString() },
      { id: '2', sku: 'MEC-042', name: 'Hydraulic Jack 2T', category: 'Mechanical', quantity: 2, availableQuantity: 2, location: 'Floor B', lastUpdated: new Date().toISOString() },
      { id: '3', sku: 'SAF-109', name: 'Welding Mask Pro', category: 'Safety', quantity: 10, availableQuantity: 8, location: 'Safety Cabinet', lastUpdated: new Date().toISOString() },
    ];
  });

  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('mainti_categories');
    return saved ? JSON.parse(saved) : ['Tools', 'Safety', 'Testing', 'Mechanical', 'Electrical', 'General'];
  });

  const [loans, setLoans] = useState<BorrowRecord[]>(() => {
    const saved = localStorage.getItem('mainti_loans');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState<TransactionLog[]>(() => {
    const saved = localStorage.getItem('mainti_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('mainti_inventory', JSON.stringify(inventory));
    localStorage.setItem('mainti_loans', JSON.stringify(loans));
    localStorage.setItem('mainti_history', JSON.stringify(history));
    localStorage.setItem('mainti_categories', JSON.stringify(customCategories));
  }, [inventory, loans, history, customCategories]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mainti_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mainti_theme', 'light');
    }
  }, [isDarkMode]);


  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogin = (user: AppUser) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);

  const handleBorrow = (newLoan: BorrowRecord, qty: number) => {
    setLoans(prev => [...prev, newLoan]);
    setInventory(prev => prev.map(item =>
      item.id === newLoan.itemId
        ? { ...item, availableQuantity: item.availableQuantity - qty }
        : item
    ));
    const log: TransactionLog = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'BORROW',
      itemId: newLoan.itemId,
      itemName: newLoan.itemName,
      quantity: qty,
      user: newLoan.specialistName,
      operator: 'System',
      timestamp: new Date().toISOString(),
      notes: `Borrowed ${qty} units for ${newLoan.department}`,
      proofImage: newLoan.borrowProof
    };
    setHistory(prev => [log, ...prev]);
    setView('loans');
  };

  const handleReturn = (loanId: string, condition: ReturnCondition, processedQty: number, proof?: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const totalBorrowedAtStart = loan.quantity || 1;
    const balanceRemaining = totalBorrowedAtStart - processedQty;

    // 1. Update Loans State: Only remove if no units remain
    if (balanceRemaining <= 0) {
      setLoans(prev => prev.filter(l => l.id !== loanId));
    } else {
      setLoans(prev => prev.map(l => l.id === loanId ? { ...l, quantity: balanceRemaining } : l));
    }

    // 2. Update Inventory State
    setInventory(prev => prev.map(item => {
      if (item.id === loan.itemId) {
        let updatedTotalQuantity = item.quantity;
        let updatedAvailableQuantity = item.availableQuantity;

        if (condition === 'GOOD' || condition === 'PARTIAL') {
          // Items go back to store and are usable
          updatedAvailableQuantity += processedQty;
        } else if (condition === 'LOST') {
          // Items are gone from the world
          updatedTotalQuantity -= processedQty;
        } else if (condition === 'DAMAGED') {
          // Items are back in store total but NOT available for reuse
          // No change to availableQuantity, total stays same
        }

        return {
          ...item,
          quantity: updatedTotalQuantity,
          availableQuantity: updatedAvailableQuantity,
          lastUpdated: new Date().toISOString()
        };
      }
      return item;
    }));

    // 3. Log the Transaction
    const log: TransactionLog = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'RETURN',
      itemId: loan.itemId,
      itemName: loan.itemName,
      quantity: processedQty,
      user: loan.specialistName,
      operator: 'System',
      timestamp: new Date().toISOString(),
      condition: condition,
      proofImage: proof,
      notes: `Processed ${processedQty}/${totalBorrowedAtStart} units. Status: ${condition}${balanceRemaining > 0 ? `. Remaining on loan: ${balanceRemaining}` : ''}`
    };
    setHistory(prev => [log, ...prev]);
  };

  const handleReceiveStock = (newItem: Partial<InventoryItem>) => {
    const finalCategory = newItem.category || 'General';
    if (!customCategories.includes(finalCategory)) {
      setCustomCategories(prev => [...prev, finalCategory]);
    }

    const existing = inventory.find(i => i.sku === newItem.sku);
    if (existing) {
      setInventory(prev => prev.map(i =>
        i.sku === newItem.sku
          ? { ...i, quantity: i.quantity + (newItem.quantity || 0), availableQuantity: i.availableQuantity + (newItem.quantity || 0), lastUpdated: new Date().toISOString() }
          : i
      ));
    } else {
      const item: InventoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        sku: newItem.sku || 'N/A',
        name: newItem.name || 'New Item',
        category: finalCategory,
        quantity: newItem.quantity || 0,
        availableQuantity: newItem.quantity || 0,
        location: newItem.location || 'Pending',
        lastUpdated: new Date().toISOString(),
      };
      setInventory(prev => [...prev, item]);
    }

    const log: TransactionLog = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'RECEIVE',
      itemId: existing?.id || 'new',
      itemName: newItem.name || 'Stock Update',
      quantity: newItem.quantity || 0,
      user: 'System',
      operator: 'System',
      timestamp: new Date().toISOString(),
      notes: 'Received new stock shipment'
    };
    setHistory(prev => [log, ...prev]);
  };

  const handleAdjustStock = (itemId: string, newTotal: number, reason: string, newCategory?: string, newLocation?: string, newSku?: string) => {
    if (newCategory && !customCategories.includes(newCategory)) {
      setCustomCategories(prev => [...prev, newCategory]);
    }

    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const currentlyBorrowed = item.quantity - item.availableQuantity;
        const newAvailable = Math.max(0, newTotal - currentlyBorrowed);

        const log: TransactionLog = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'ADJUST',
          itemId: item.id,
          itemName: item.name,
          quantity: newTotal - item.quantity,
          user: 'System',
          operator: currentUser?.name || 'Unknown',
          timestamp: new Date().toISOString(),
          notes: `Stock adjustment/Update. Reason: ${reason}`
        };
        setHistory(prevH => [log, ...prevH]);

        return {
          ...item,
          sku: newSku || item.sku,
          quantity: newTotal,
          availableQuantity: newAvailable,
          category: newCategory || item.category,
          location: newLocation || item.location,
          lastUpdated: new Date().toISOString()
        };
      }
      return item;
    }));
  };

  const handleDeleteItem = (itemId: string) => {
    const itemToDelete = inventory.find(i => i.id === itemId);
    if (!itemToDelete) return;

    if (itemToDelete.availableQuantity < itemToDelete.quantity) {
      alert("Cannot delete item: Some units are currently borrowed. Please process returns first.");
      return;
    }

    setInventory(prev => prev.filter(i => i.id !== itemId));

    const log: TransactionLog = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'ADJUST',
      itemId: itemToDelete.id,
      itemName: itemToDelete.name,
      quantity: -itemToDelete.quantity,
      user: 'System',
      operator: currentUser?.name || 'Unknown',
      timestamp: new Date().toISOString(),
      notes: `Permanently removed item "${itemToDelete.name}" from store records.`
    };
    setHistory(prev => [log, ...prev]);
  };

  const handleDeleteCategory = (categoryName: string) => {
    if (categoryName === 'General') {
      alert("The 'General' category cannot be deleted as it is the system fallback.");
      return;
    }

    const itemsInCategory = inventory.filter(i => i.category === categoryName);
    if (itemsInCategory.length > 0) {
      const confirmMove = window.confirm(`There are ${itemsInCategory.length} items in "${categoryName}". Deleting this category will move them to "General". Proceed?`);
      if (!confirmMove) return;

      setInventory(prev => prev.map(item =>
        item.category === categoryName ? { ...item, category: 'General' } : item
      ));
    }

    setCustomCategories(prev => prev.filter(c => c !== categoryName));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <aside className="w-full md:w-64 bg-slate-900 dark:bg-slate-900/50 dark:backdrop-blur-xl text-white md:sticky md:top-0 md:h-screen flex-shrink-0 z-20">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight">MaintiTrack</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors md:hidden"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>


        <nav className="mt-2 px-4 space-y-2">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${view === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button onClick={() => setView('inventory')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${view === 'inventory' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <ClipboardList className="w-5 h-5" />
            <span>Inventory</span>
          </button>
          <button onClick={() => setView('borrow')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${view === 'borrow' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <UserPlus className="w-5 h-5" />
            <span>Borrow Item</span>
          </button>
          <button onClick={() => setView('loans')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${view === 'loans' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <ArrowLeftRight className="w-5 h-5" />
            <span>Active Loans</span>
            {loans.length > 0 && <span className="ml-auto bg-red-500 text-xs px-2 py-0.5 rounded-full">{loans.length}</span>}
          </button>
          <button onClick={() => setView('incidents')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${view === 'incidents' ? 'bg-orange-600' : 'hover:bg-slate-800'}`}>
            <ShieldAlert className="w-5 h-5" />
            <span>Incident Log</span>
          </button>
          <button onClick={() => setView('history')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${view === 'history' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <History className="w-5 h-5" />
            <span>Audit Trail</span>
          </button>
        </nav>

        <div className="absolute bottom-8 left-4 right-4 hidden md:block">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize">{view.replace('-', ' ')}</h2>
            <p className="text-slate-500 dark:text-slate-400">Managing maintenance stock and repair equipment</p>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {view === 'dashboard' && <Dashboard inventory={inventory} loans={loans} history={history} isDarkMode={isDarkMode} />}
          {view === 'inventory' && (
            <InventoryList
              inventory={inventory}
              categories={customCategories}
              onAddStock={handleReceiveStock}
              onAdjustStock={handleAdjustStock}
              onDeleteItem={handleDeleteItem}
              onDeleteCategory={handleDeleteCategory}
            />
          )}
          {view === 'borrow' && <BorrowForm inventory={inventory.filter(i => i.availableQuantity > 0)} onBorrow={handleBorrow} />}
          {view === 'loans' && <ActiveLoans loans={loans} onReturn={handleReturn} />}
          {view === 'history' && <HistoryLog history={history} />}
          {view === 'incidents' && <IncidentLog history={history} />}
        </div>
      </main>
    </div>
  );
};

export default App;
