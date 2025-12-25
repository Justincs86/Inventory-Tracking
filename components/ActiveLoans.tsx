
import React, { useState } from 'react';
import { BorrowRecord, ReturnCondition } from '../types';
import { Clock, RotateCcw, User, ShieldCheck, CheckCircle, AlertTriangle, XCircle, Hash, X, Sparkles } from 'lucide-react';
import CameraCapture from './CameraCapture';
import QuantityStepper from './QuantityStepper';

interface ActiveLoansProps {
  loans: BorrowRecord[];
  onReturn: (loanId: string, condition: ReturnCondition, processedQty: number, proof?: string) => void;
}

const HelpCircle = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-help-circle"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
);

const ActiveLoans: React.FC<ActiveLoansProps> = ({ loans, onReturn }) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);
  const [returnState, setReturnState] = useState<{
    condition: ReturnCondition | null;
    inputQty: number;
    proof: string | null;
  }>({
    condition: null,
    inputQty: 1,
    proof: null
  });

  if (loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed transition-colors">
        <Clock className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">No items are currently borrowed.</p>
      </div>
    );
  }

  const handleStartReturn = (loan: BorrowRecord) => {
    setProcessingId(loan.id);
    setShowSuccessFeedback(false);
    setReturnState({
      condition: null,
      inputQty: loan.quantity,
      proof: null
    });
  };

  const handleSelectCondition = (cond: ReturnCondition, loanQty: number) => {
    setReturnState(prev => ({ 
      ...prev, 
      condition: cond,
      inputQty: (cond === 'LOST' || cond === 'DAMAGED') ? 1 : (cond === 'PARTIAL' ? Math.max(1, loanQty - 1) : loanQty)
    }));
  };

  const finalizeReturn = (loan: BorrowRecord) => {
    if (!returnState.condition || !returnState.proof) {
      alert("Please capture return proof first.");
      return;
    }

    // The quantity we are processing in THIS specific transaction
    const processedQty = returnState.condition === 'GOOD' ? loan.quantity : returnState.inputQty;
    
    // Check if there's still a balance out on this loan after this transaction
    const isPartialWithBalance = processedQty < loan.quantity;

    onReturn(loan.id, returnState.condition, processedQty, returnState.proof);

    if (isPartialWithBalance) {
      setShowSuccessFeedback(true);
      // Reset the form state for the remaining items
      setReturnState({ 
        condition: null, 
        inputQty: loan.quantity - processedQty, 
        proof: null 
      });
      // Hide feedback after a few seconds
      setTimeout(() => setShowSuccessFeedback(false), 3000);
    } else {
      setProcessingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loans.map(loan => {
        const isOverdue = new Date(loan.expectedReturnDate) < new Date();
        const isProcessing = processingId === loan.id;
        
        return (
          <div key={loan.id} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all relative ${isProcessing ? 'ring-2 ring-blue-500' : ''}`}>
            {isProcessing && (
              <button onClick={() => setProcessingId(null)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 z-10">
                <X className="w-4 h-4" />
              </button>
            )}
            <div className={`h-1.5 w-full rounded-t-xl ${isOverdue ? 'bg-red-500' : 'bg-blue-500'}`} />
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight pr-6 transition-colors">{loan.itemName}</h4>
                  <div className="flex items-center text-[9px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-bold tracking-wider">
                    <ShieldCheck className="w-2.5 h-2.5 mr-1" />
                    <span>ID: {loan.id}</span>
                  </div>
                </div>
                {!isProcessing && (
                  <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${isOverdue ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                    {isOverdue ? 'Overdue' : 'Active'}
                  </div>
                )}
              </div>

              {!isProcessing ? (
                <>
                  <div className="space-y-2 mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-400">
                      <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>Specialist: <b className="text-slate-800 dark:text-slate-200">{loan.specialistName}</b></span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-400">
                      <Hash className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>Borrowed: <b className="text-slate-800 dark:text-slate-200">{loan.quantity}</b></span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>Due: <b className="text-slate-800 dark:text-slate-200">{loan.expectedReturnDate}</b></span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleStartReturn(loan)}
                    className="w-full bg-slate-900 dark:bg-slate-800 text-white py-3 rounded-xl flex items-center justify-center space-x-2 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-md active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Process Return</span>
                  </button>
                </>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  {showSuccessFeedback && (
                    <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center justify-center space-x-2 text-xs font-bold border border-green-100 dark:border-green-800 animate-in slide-in-from-top-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Partial Record Updated</span>
                    </div>
                  )}

                  {!returnState.condition ? (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Item Condition</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleSelectCondition('GOOD', loan.quantity)} className="flex flex-col items-center justify-center py-3 rounded-xl bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/20 transition-all">
                          <CheckCircle className="w-5 h-5 mb-1" /> <span className="text-[10px] font-bold uppercase">Good</span>
                        </button>
                        <button onClick={() => handleSelectCondition('DAMAGED', loan.quantity)} className="flex flex-col items-center justify-center py-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-all">
                          <AlertTriangle className="w-5 h-5 mb-1" /> <span className="text-[10px] font-bold uppercase">Damaged</span>
                        </button>
                        <button onClick={() => handleSelectCondition('PARTIAL', loan.quantity)} className="flex flex-col items-center justify-center py-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all">
                          <HelpCircle className="w-5 h-5 mb-1" /> <span className="text-[10px] font-bold uppercase">Partial</span>
                        </button>
                        <button onClick={() => handleSelectCondition('LOST', loan.quantity)} className="flex flex-col items-center justify-center py-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all">
                          <XCircle className="w-5 h-5 mb-1" /> <span className="text-[10px] font-bold uppercase">Lost</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Reporting: </span>
                        <div className="flex items-center">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">{returnState.condition}</span>
                          <button onClick={() => setReturnState({...returnState, condition: null})} className="ml-2 text-[8px] font-bold text-slate-400 underline uppercase tracking-tighter">Change</button>
                        </div>
                      </div>
                      {(returnState.condition === 'PARTIAL' || returnState.condition === 'LOST' || returnState.condition === 'DAMAGED') && (
                        <QuantityStepper 
                          label={
                            returnState.condition === 'PARTIAL' ? 'Returned (Good)' : 
                            returnState.condition === 'DAMAGED' ? 'Damaged Units' : 'Lost Units'
                          }
                          value={returnState.inputQty}
                          min={1} max={loan.quantity}
                          onChange={(val) => setReturnState({...returnState, inputQty: val})}
                        />
                      )}
                      <CameraCapture label="Visual Verification" onCapture={(base64) => setReturnState({...returnState, proof: base64})} compact={true} />
                      <button 
                        onClick={() => finalizeReturn(loan)}
                        disabled={!returnState.proof}
                        className={`w-full py-3 h-14 rounded-xl flex items-center justify-center space-x-2 text-xs font-bold shadow-lg transition-all active:scale-95 ${
                          returnState.proof ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Finalize Return</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActiveLoans;
