import React, { useState, useEffect } from 'react';
import { FolderLock, ArrowRight, Shield, Building, PlusCircle } from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressBar } from '../components/ProgressBar';

interface TransactionsListPageProps {
  navigate: (path: string) => void;
}

export const TransactionsListPage: React.FC<TransactionsListPageProps> = ({ navigate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.transactions
      .list()
      .then((res) => setTransactions(res.transactions || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            My Legal Transactions
          </h1>
          <p className="text-xs text-slate-500">
            Private legal workspaces for your ongoing and completed property acquisitions
          </p>
        </div>

        <button
          onClick={() => navigate('/property-request')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center gap-2 self-start"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" /> New Property Request
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <FolderLock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Active Transactions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Submit a property requirement specification to initiate a dedicated legal transaction workspace.
          </p>
          <button
            onClick={() => navigate('/property-request')}
            className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-md shadow-xs hover:bg-slate-800"
          >
            Submit Property Request
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {tx.id}
                    </span>
                    <StatusBadge status={tx.status} />
                  </div>
                  <h2 className="font-serif text-xl font-bold text-slate-900">
                    {tx.property_name}
                  </h2>
                  <p className="text-xs text-slate-500">{tx.property_address}</p>
                </div>

                <button
                  onClick={() => navigate(`/transactions/${tx.id}`)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center gap-2 self-start sm:self-center"
                >
                  <FolderLock className="w-4 h-4 text-amber-400" />
                  Enter Workspace <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress Indicator */}
              <ProgressBar currentStep={tx.current_step} />

              {/* Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Agreed Purchase Price</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {tx.currency} {tx.agreed_price.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Assigned Legal Counsel</span>
                  <span className="font-semibold text-slate-900">{tx.legal_officer_name || 'Counsel'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Transaction Officer</span>
                  <span className="font-semibold text-slate-900">{tx.transaction_officer_name || 'Manager'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Cadastral Identification</span>
                  <span className="font-mono text-slate-700">{tx.cadastral_id || 'Pending Notary Extract'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
