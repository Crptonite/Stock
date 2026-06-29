import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { getSupabaseClient } from '../lib/supabase';

interface PortfolioAsset {
  id: string;
  asset_ticker: string;
  shares_owned: number;
  average_cost: number;
}

export default function PortfolioDashboard() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [form, setForm] = useState({ ticker: '', shares: '', cost: '' });
  const [errorLog, setErrorLog] = useState<string | null>(null);

  const fetchUserPortfolio = async () => {
    try {
      setLoading(true);
      setErrorLog(null);
      // Fetches standard token mapping parameters aligned with your Clerk custom template
      const token = await getToken({ template: 'supabase' });
      const supabase = getSupabaseClient(token);

      const { data, error } = await supabase
        .from('portfolios')
        .select('id, asset_ticker, shares_owned, average_cost')
        .order('asset_ticker', { ascending: true });

      if (error) throw error;
      setAssets(data || []);
    } catch (err: any) {
      setErrorLog(err.message || 'An error occurred fetching secure telemetry records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserPortfolio();
    }
  }, [user]);

  const handleSubmitPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ticker || !form.shares || !form.cost || !user) return;

    try {
      const token = await getToken({ template: 'supabase' });
      const supabase = getSupabaseClient(token);

      const { error } = await supabase.from('portfolios').insert({
        user_id: user.id, // Explicitly binds record row ownership to active Clerk account
        asset_ticker: form.ticker.toUpperCase().trim(),
        shares_owned: parseFloat(form.shares),
        average_cost: parseFloat(form.cost)
      });

      if (error) throw error;

      setForm({ ticker: '', shares: '', cost: '' });
      fetchUserPortfolio();
    } catch (err: any) {
      setErrorLog(err.message || 'Write operations rejected by system firewall boundaries.');
    }
  };

  return (
    <div className="space-y-8">
      {errorLog && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-lg">
          ⚠️ {errorLog}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Entry Management Console */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-md font-semibold tracking-wide mb-4 text-slate-200">Log Position Record</h2>
          <form onSubmit={handleSubmitPosition} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Asset Token / Ticker</label>
              <input 
                type="text" required placeholder="e.g., NVDA, BTC" value={form.ticker}
                onChange={e => setForm({ ...form, ticker: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Shares/Units</label>
                <input 
                  type="number" step="any" min="0" required placeholder="12.5" value={form.shares}
                  onChange={e => setForm({ ...form, shares: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Avg Cost ($)</label>
                <input 
                  type="number" step="any" min="0" required placeholder="145.20" value={form.cost}
                  onChange={e => setForm({ ...form, cost: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-sm py-2.5 rounded-lg text-white font-medium shadow-lg shadow-blue-600/10 transition duration-150">
              Commit Allocation
            </button>
          </form>
        </div>

        {/* Dynamic Ledger Output Console */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-md font-semibold tracking-wide mb-4 text-slate-200">Asset Allocations</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-slate-500">
              Syncing isolated structural database...
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-20 text-sm text-slate-500 border border-dashed border-slate-800 rounded-lg">
              No active positions established under this user signature.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-medium uppercase">
                    <th className="pb-3">Ticker</th>
                    <th className="pb-3">Position Size</th>
                    <th className="pb-3">Acquisition Cost</th>
                    <th className="pb-3 text-right">Net Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {assets.map(asset => (
                    <tr key={asset.id} className="group hover:bg-slate-950/40 transition">
                      <td className="py-3.5 font-sans font-bold text-blue-400">{asset.asset_ticker}</td>
                      <td className="py-3.5 text-slate-300">{Number(asset.shares_owned).toLocaleString()}</td>
                      <td className="py-3.5 text-slate-300">${Number(asset.average_cost).toLocaleString()}</td>
                      <td className="py-3.5 text-right font-medium text-emerald-400">
                        ${(asset.shares_owned * asset.average_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}