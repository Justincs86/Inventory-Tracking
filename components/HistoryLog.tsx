
import React, { useState } from 'react';
import { TransactionLog, ReturnCondition } from '../types';
import { FileSpreadsheet, ArrowDownLeft, ArrowUpRight, CheckCircle, HelpCircle, XCircle, AlertTriangle, Settings2, Image as ImageIcon, X } from 'lucide-react';

interface HistoryLogProps { history: TransactionLog[]; }

const HistoryLog: React.FC<HistoryLogProps> = ({ history }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const getConditionIcon = (condition?: ReturnCondition) => {
    switch (condition) {
      case 'GOOD': return <CheckCircle className="w-3 h-3 mr-1 text-green-500" />;
      case 'DAMAGED': return <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" />;
      case 'PARTIAL': return <HelpCircle className="w-3 h-3 mr-1 text-blue-500" />;
      case 'LOST': return <XCircle className="w-3 h-3 mr-1 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center">
            <FileSpreadsheet className="w-4 h-4 mr-2 text-blue-500" />
            Maintenance Audit Trail
          </h3>
          <button className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors">
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qty Delta</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Proof</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Condition</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
              {history.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">No historical records found.</td></tr>
              ) : (
                history.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {new Date(log.timestamp).toLocaleString([], { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`flex items-center font-bold ${
                        log.type === 'RECEIVE' ? 'text-green-600 dark:text-green-400' :
                        log.type === 'BORROW' ? 'text-blue-600 dark:text-blue-400' :
                        log.type === 'RETURN' ? 'text-amber-600 dark:text-amber-400' : 
                        log.type === 'ADJUST' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600'
                      }`}>
                        {log.type === 'ADJUST' ? <Settings2 className="w-3 h-3 mr-1" /> : <ArrowUpRight className="w-3 h-3 mr-1" />}
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-800 dark:text-slate-100">{log.itemName}</td>
                    <td className="px-6 py-3 font-bold text-slate-800 dark:text-slate-200">{log.quantity > 0 ? `+${log.quantity}` : log.quantity}</td>
                    <td className="px-6 py-3">
                      {log.proofImage ? (
                        <button 
                          onClick={() => setPreviewImage(log.proofImage!)}
                          className="p-1 border dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-700 transition-colors"
                        >
                          <img src={log.proofImage} alt="proof" className="w-8 h-8 object-cover rounded shadow-sm" />
                        </button>
                      ) : (
                        <div className="text-slate-300 dark:text-slate-700"><ImageIcon className="w-4 h-4" /></div>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center text-slate-800 dark:text-slate-200">
                        {getConditionIcon(log.condition)}
                        <span className="font-bold text-[9px]">{log.condition || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-400 dark:text-slate-500 italic max-w-xs truncate">{log.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewImage && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img src={previewImage} alt="Full Proof" className="w-full h-auto rounded-xl shadow-inner" />
            <div className="p-4 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Transaction Proof Capture</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryLog;
