import React from 'react';
import { useApp } from '../context/AppContext';
import { Job } from '../types';
import { ShieldCheck, CheckCircle2, Printer, X, DollarSign, Lock } from 'lucide-react';

interface EscrowInvoiceModalProps {
  job: Job;
  onClose: () => void;
}

export const EscrowInvoiceModal: React.FC<EscrowInvoiceModalProps> = ({ job, onClose }) => {
  const { releaseEscrow, currentUser } = useApp();

  const handleRelease = () => {
    releaseEscrow(job.id);
  };

  const handlePrint = () => {
    window.print();
  };

  const amount = job.escrowAmount || job.budget;
  const isReleased = job.escrowStatus === 'released';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full border border-neutral-200 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <span className="text-[11px] font-mono text-neutral-400">INVOICE & ESCROW STATEMENT</span>
            <h3 className="text-lg font-bold text-neutral-900 mt-0.5">Invoice #{job.id.slice(-8).toUpperCase()}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Escrow Status Banner */}
        <div className="mt-5 p-4 rounded-lg border bg-neutral-50/70 border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isReleased ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <Lock className="w-5 h-5 text-indigo-600" />
              )}
              <div>
                <div className="text-xs font-bold text-neutral-900">
                  {isReleased ? 'Escrow Released & Settled' : 'Funds Held in FixLocal Protected Escrow'}
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  {isReleased ? 'Payment released upon completed service' : 'Funds will be released upon your completion sign-off'}
                </div>
              </div>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isReleased ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
              {isReleased ? 'Settled' : 'Protected'}
            </span>
          </div>
        </div>

        {/* Invoice Item Breakdown */}
        <div className="mt-6 space-y-4">
          <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
            Service Details
          </div>

          <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100 text-xs font-mono">
            <div className="p-3 flex justify-between items-center">
              <span className="text-neutral-500">Service Category:</span>
              <span className="font-semibold text-neutral-900">{job.category}</span>
            </div>
            <div className="p-3 flex justify-between items-center">
              <span className="text-neutral-500">Service Location:</span>
              <span className="font-medium text-neutral-800 text-right max-w-xs truncate">{job.location}</span>
            </div>
            <div className="p-3 flex justify-between items-center">
              <span className="text-neutral-500">Contractor / Specialist:</span>
              <span className="font-semibold text-indigo-600">{job.hiredProviderName || 'Assigned Tradesperson'}</span>
            </div>
            <div className="p-3 flex justify-between items-center">
              <span className="text-neutral-500">Customer:</span>
              <span className="font-medium text-neutral-800">{job.customerName}</span>
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-4 space-y-2 text-xs font-mono tabular-nums">
            <div className="flex justify-between text-neutral-600">
              <span>Agreed Fixed Labor & Equipment:</span>
              <span>${amount}.00</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Platform Protection Guarantee:</span>
              <span className="text-emerald-600">$0.00 (Zero Markups)</span>
            </div>
            <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-100">
              <span>Total Invoice Amount:</span>
              <span>${amount}.00 USD</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-8 pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          <div className="flex items-center gap-2">
            {!isReleased && currentUser?.role === 'customer' && (
              <button
                type="button"
                onClick={handleRelease}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Release Funds to Provider</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
