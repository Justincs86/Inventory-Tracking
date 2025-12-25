
import React, { useState } from 'react';
import { TransactionLog } from '../types';
import { ShieldAlert, AlertTriangle, XCircle, Calendar, User, Package, Hash, Image as ImageIcon, X } from 'lucide-react';

interface IncidentLogProps {
  history: TransactionLog[];
}

const IncidentLog: React.FC<IncidentLogProps> = ({ history }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const incidentRecords = history.filter(log => log.condition === 'DAMAGED' || log.condition === 'LOST' || log.condition === 'PARTIAL');

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-400 p-4 rounded-r-xl transition-colors">
        <div className="flex">
          <div className="flex-shrink-0">
            <ShieldAlert className="h-5 w-5 text-orange-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-orange-700 dark:text-orange-300 font-medium leading-relaxed">
              This log tracks all equipment returned in non-optimal condition. 
              Visual proof is provided for damage assessment and procurement decisions.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2 text-orange-500" />
            Equipment Incident Log
          </h3>
          <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full font-bold">
            {incidentRecords.length} Incidents
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Units</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Proof</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Condition</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Specialist</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
              {incidentRecords.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">No incidents recorded yet.</td></tr>
              ) : (
                incidentRecords.map(log => (
                  <tr key={log.id} className="hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1 opacity-40" />
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">
                      <div className="flex items-center">
                        <Package className="w-3 h-3 mr-2 text-slate-400" />
                        {log.itemName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200">
                      <div className="flex items-center">
                        <Hash className="w-3 h-3 mr-1 opacity-40" />
                        <span className="font-bold">{log.quantity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.proofImage ? (
                        <button 
                          onClick={() => setPreviewImage(log.proofImage!)}
                          className="p-1 border dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
                        >
                          <img src={log.proofImage} alt="incident proof" className="w-8 h-8 object-cover rounded shadow-sm" />
                        </button>
                      ) : (
                        <div className="text-slate-300 dark:text-slate-700"><ImageIcon className="w-4 h-4" /></div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.condition === 'DAMAGED' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 
                        log.condition === 'PARTIAL' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {log.condition === 'DAMAGED' ? <AlertTriangle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {log.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1 opacity-40" />
                        {log.user}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 dark:text-slate-500 italic max-w-xs truncate">
                      {log.notes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewImage && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img src={previewImage} alt="Incident Proof" className="w-full h-auto rounded-xl" />
            <div className="p-4 text-center">
              <p className="text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest">Incident Investigation Proof</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentLog;
