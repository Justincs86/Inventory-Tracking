
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { InventoryItem, BorrowRecord, TransactionLog } from '../types';
import { getInventoryInsights } from '../services/geminiService';
import { AlertCircle, TrendingUp, Package, Clock, Sparkles } from 'lucide-react';

interface DashboardProps {
  inventory: InventoryItem[];
  loans: BorrowRecord[];
  history: TransactionLog[];
  isDarkMode?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ inventory, loans, history, isDarkMode }) => {
  const [aiInsights, setAiInsights] = useState<{ summary: string, alerts: string[], recommendations: string[] } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const fetchAi = async () => {
      setLoadingAi(true);
      const res = await getInventoryInsights(inventory, history);
      setAiInsights(res);
      setLoadingAi(false);
    };
    fetchAi();
  }, [inventory, history]);

  const stockChartData = inventory.slice(0, 5).map(item => ({
    name: item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name,
    total: item.quantity,
    available: item.availableQuantity,
    borrowed: item.quantity - item.availableQuantity
  }));

  const chartTheme = {
    grid: isDarkMode ? '#334155' : '#f1f5f9',
    text: isDarkMode ? '#94a3b8' : '#64748b',
    tooltipBg: isDarkMode ? '#0f172a' : '#ffffff',
    tooltipBorder: isDarkMode ? '#334155' : '#e2e8f0',
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">+4%</span>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Items</h3>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{inventory.reduce((acc, i) => acc + i.quantity, 0)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full">Alert</span>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Loans</h3>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{loans.length}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Transactions (24h)</h3>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{history.length}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Stock Health</h3>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">Optimal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Stock Allocation (Top 5 Items)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: chartTheme.text}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: chartTheme.text}} />
                <Tooltip 
                   cursor={{fill: isDarkMode ? '#1e293b' : '#f8fafc'}}
                   contentStyle={{
                     borderRadius: '12px', 
                     border: `1px solid ${chartTheme.tooltipBorder}`, 
                     backgroundColor: chartTheme.tooltipBg,
                     boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                     color: isDarkMode ? '#f1f5f9' : '#1e293b'
                   }}
                />
                <Bar dataKey="available" fill="#3b82f6" radius={[4, 4, 0, 0]} name="In Store" />
                <Bar dataKey="borrowed" fill="#ef4444" radius={[4, 4, 0, 0]} name="Borrowed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 dark:from-indigo-700 dark:to-blue-900 text-white p-6 rounded-xl shadow-lg flex flex-col">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="text-lg font-bold">AI Stock Analyst</h3>
          </div>
          
          {loadingAi ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              <p className="text-sm opacity-80">Scanning inventory...</p>
            </div>
          ) : aiInsights ? (
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-1 custom-scrollbar">
              <p className="text-sm text-blue-50 leading-relaxed italic">"{aiInsights.summary}"</p>
              
              {aiInsights.alerts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-2">Priority Alerts</h4>
                  <ul className="space-y-2">
                    {aiInsights.alerts.map((alert, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm bg-white/10 p-2 rounded">
                        <AlertCircle className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                        <span>{alert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiInsights.recommendations.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-2">Next Actions</h4>
                  <ul className="space-y-2">
                    {aiInsights.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-300 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
             <p className="text-sm opacity-60">Insights will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
