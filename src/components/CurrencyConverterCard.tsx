import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  RefreshCw,
  Lock,
  ArrowRightLeft,
  ShieldCheck,
  Info
} from 'lucide-react';
import { CurrencyRate } from '../types';

interface CurrencyConverterCardProps {
  amountInEur: number;
}

export const CurrencyConverterCard: React.FC<CurrencyConverterCardProps> = ({ amountInEur }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [isHedgingLocked, setIsHedgingLocked] = useState(false);

  const RATES: Record<string, { symbol: string; rate: number; name: string }> = {
    USD: { symbol: '$', rate: 1.085, name: 'US Dollar' },
    GBP: { symbol: '£', rate: 0.855, name: 'British Pound' },
    CHF: { symbol: 'CHF', rate: 0.965, name: 'Swiss Franc' },
    AED: { symbol: 'AED', rate: 3.985, name: 'UAE Dirham' },
    SGD: { symbol: 'S$', rate: 1.455, name: 'Singapore Dollar' },
    CAD: { symbol: 'C$', rate: 1.485, name: 'Canadian Dollar' },
  };

  const current = RATES[selectedCurrency] || RATES.USD;
  const convertedAmount = Math.round(amountInEur * current.rate);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-4">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
              FX Institutional Rates
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Live Bloomberg FX Fix
            </span>
          </div>
          <h3 className="font-serif text-lg font-bold text-white">
            Multi-Currency Foreign Exchange & FX Hedging Lock
          </h3>
          <p className="text-xs text-slate-300">
            Real-time equivalent valuation for international cross-border funds settlement
          </p>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 text-white border border-slate-700 rounded-lg text-xs font-bold focus:outline-hidden"
          >
            {Object.keys(RATES).map((cur) => (
              <option key={cur} value={cur}>
                {cur} ({RATES[cur].name})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Main FX Comparison Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Notarial Base Price (EUR)</span>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
              € {amountInEur.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 block">Official French Deed Currency</span>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-amber-900 block font-bold">
                {current.name} Equivalent ({selectedCurrency})
              </span>
              <span className="text-[10px] font-mono text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                1 EUR = {current.rate} {selectedCurrency}
              </span>
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-slate-950 font-mono">
              {current.symbol} {convertedAmount.toLocaleString()}
            </div>
            <span className="text-[11px] text-amber-800 block">
              Calculated at spot benchmark (zero spread)
            </span>
          </div>
        </div>

        {/* FX Hedging Rate Lock Toggle */}
        <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">Forward Rate Lock Protection (30–90 Days)</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Lock the current exchange rate against Euro volatility through BNP Paribas Wealth FX Forward Desk.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsHedgingLocked(!isHedgingLocked)}
            className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${
              isHedgingLocked
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            {isHedgingLocked ? 'Rate Locked (1.085)' : 'Simulate 60-Day FX Lock'}
          </button>
        </div>
      </div>
    </div>
  );
};
