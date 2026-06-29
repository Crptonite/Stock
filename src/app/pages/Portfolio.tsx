import { useState, useEffect, useCallback } from "react";
import { Plus, TrendingUp, TrendingDown, DollarSign, BarChart2, X, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from "recharts";
import { supabase } from "../../lib/supabase";
import type { PortfolioPosition } from "../../lib/supabase";
import { useAuth } from "../context/AuthContext";

const PORTFOLIO_HISTORY = [
  { date: "Jan", value: 285000 }, { date: "Feb", value: 298000 },
  { date: "Mar", value: 291000 }, { date: "Apr", value: 312000 },
  { date: "May", value: 308000 }, { date: "Jun", value: 325000 },
  { date: "Jul", value: 318000 }, { date: "Aug", value: 341000 },
  { date: "Sep", value: 335000 }, { date: "Oct", value: 358000 },
  { date: "Nov", value: 372000 }, { date: "Dec", value: 389250 },
];

const DIVIDEND_HISTORY = [
  { month: "Jul", amount: 420 }, { month: "Aug", amount: 380 },
  { month: "Sep", amount: 510 }, { month: "Oct", amount: 450 },
  { month: "Nov", amount: 620 }, { month: "Dec", amount: 580 },
];

const SECTOR_COLORS = ["#8BB8C9", "#AFA089", "#4A5D6B", "#6B8E9F", "#C4B49E", "#5A7080"];

export function Portfolio() {
  const { user } = useAuth();
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPos, setNewPos] = useState({ ticker: "", shares: "", avgCost: "", name: "", sector: "Technology" });
  const [activeTab, setActiveTab] = useState<"overview" | "positions" | "dividends">("overview");

  const fetchPositions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("portfolio_positions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (!error && data) setPositions(data as PortfolioPosition[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const calcValue = (p: PortfolioPosition) => p.shares * p.current_price;
  const calcCost = (p: PortfolioPosition) => p.shares * p.avg_cost;
  const calcPnL = (p: PortfolioPosition) => calcValue(p) - calcCost(p);
  const calcPnLPct = (p: PortfolioPosition) => ((calcValue(p) / calcCost(p)) - 1) * 100;

  const totalValue = positions.reduce((sum, p) => sum + calcValue(p), 0);
  const totalCost = positions.reduce((sum, p) => sum + calcCost(p), 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPct = totalCost > 0 ? ((totalValue / totalCost) - 1) * 100 : 0;
  const annualDividends = positions.reduce((sum, p) => sum + calcValue(p) * p.dividend_yield / 100, 0);

  const sectorData = Object.entries(
    positions.reduce((acc, p) => {
      acc[p.sector] = (acc[p.sector] || 0) + calcValue(p);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value: Math.round(value) }));

  const pnlStyle = (val: number) => ({ color: val >= 0 ? "var(--trust-blue)" : "var(--trust-bronze)" });

  const addPosition = async () => {
    if (!user || !newPos.ticker || !newPos.shares || !newPos.avgCost) return;
    setSaving(true);
    const avgCost = parseFloat(newPos.avgCost);
    const insert = {
      user_id: user.id,
      ticker: newPos.ticker.toUpperCase(),
      name: newPos.name || `${newPos.ticker.toUpperCase()} Corp.`,
      shares: parseFloat(newPos.shares),
      avg_cost: avgCost,
      current_price: avgCost * (1 + (Math.random() - 0.4) * 0.3),
      dividend_yield: Math.random() * 4,
      sector: newPos.sector || "Other",
    };
    const { data, error } = await supabase
      .from("portfolio_positions")
      .insert(insert)
      .select()
      .single();
    if (!error && data) {
      setPositions((prev) => [...prev, data as PortfolioPosition]);
    }
    setNewPos({ ticker: "", shares: "", avgCost: "", name: "", sector: "Technology" });
    setShowAddForm(false);
    setSaving(false);
  };

  const removePosition = async (id: string) => {
    await supabase.from("portfolio_positions").delete().eq("id", id);
    setPositions((prev) => prev.filter((p) => p.id !== id));
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-muted-foreground font-mono">{label}</p>
        <p className="text-sm font-medium text-foreground font-mono">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto custom-scrollbar bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-foreground font-mono">Portfolio</h1>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">Real-time P&L tracking across all positions</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono transition-all"
            style={{ background: "var(--trust-blue)", color: "#0B1015" }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Position
          </button>
        </div>

        {showAddForm && (
          <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-end">
            {[
              { label: "Ticker *", key: "ticker", placeholder: "AAPL", w: "w-24" },
              { label: "Name", key: "name", placeholder: "Apple Inc.", w: "w-40" },
              { label: "Shares *", key: "shares", placeholder: "100", w: "w-24" },
              { label: "Avg Cost *", key: "avgCost", placeholder: "165.00", w: "w-28" },
              { label: "Sector", key: "sector", placeholder: "Technology", w: "w-32" },
            ].map(({ label, key, placeholder, w }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-mono">{label}</label>
                <input
                  value={newPos[key as keyof typeof newPos]}
                  onChange={(e) => setNewPos((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className={`bg-secondary border border-border text-foreground text-xs px-3 py-2 rounded-lg focus:outline-none font-mono ${w}`}
                />
              </div>
            ))}
            <button
              onClick={addPosition}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-mono flex items-center gap-1.5 disabled:opacity-60"
              style={{ background: "var(--trust-slate)", color: "#fff" }}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Add
            </button>
            <button onClick={() => setShowAddForm(false)} className="p-2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-mono">Loading portfolio...</span>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Portfolio Value", value: `$${totalValue.toLocaleString("en", { maximumFractionDigits: 0 })}`, sub: "Market value", icon: DollarSign, color: "var(--trust-blue)" },
                { label: "Total P&L", value: `${totalPnL >= 0 ? "+" : ""}$${totalPnL.toLocaleString("en", { maximumFractionDigits: 0 })}`, sub: `${totalPnLPct >= 0 ? "+" : ""}${totalPnLPct.toFixed(2)}%`, icon: totalPnL >= 0 ? TrendingUp : TrendingDown, color: totalPnL >= 0 ? "var(--trust-blue)" : "var(--trust-bronze)" },
                { label: "Annual Dividends", value: `$${annualDividends.toLocaleString("en", { maximumFractionDigits: 0 })}`, sub: totalValue > 0 ? `${(annualDividends / totalValue * 100).toFixed(2)}% yield` : "0% yield", icon: BarChart2, color: "var(--trust-bronze)" },
                { label: "Positions", value: positions.length.toString(), sub: `${new Set(positions.map(p => p.sector)).size} sectors`, icon: BarChart2, color: "var(--trust-slate)" },
              ].map(({ label, value, sub, icon: Icon, color }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{label}</span>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <p className="text-xl font-medium text-foreground font-mono" style={{ color }}>{value}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{sub}</p>
                </div>
              ))}
            </div>

            {positions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <BarChart2 className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-sm font-mono text-muted-foreground">No positions yet.</p>
                <p className="text-xs font-mono text-muted-foreground/70">Add your first position to start tracking.</p>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex gap-0.5 bg-secondary rounded-lg p-0.5 w-fit">
                  {(["overview", "positions", "dividends"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 rounded-md text-xs font-mono capitalize transition-all ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
                      <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Portfolio Performance (YTD)</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={PORTFOLIO_HISTORY}>
                          <defs>
                            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8BB8C9" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#8BB8C9" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="value" stroke="#8BB8C9" strokeWidth={1.5} fill="url(#portfolioGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-5">
                      <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Sector Allocation</h3>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={sectorData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={2} dataKey="value">
                            {sectorData.map((_, i) => (
                              <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px", fontFamily: "var(--font-mono)" }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1.5 mt-3">
                        {sectorData.map((s, i) => (
                          <div key={s.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ background: SECTOR_COLORS[i % SECTOR_COLORS.length] }} />
                              <span className="text-xs text-muted-foreground font-mono">{s.name}</span>
                            </div>
                            <span className="text-xs text-foreground font-mono">{totalValue > 0 ? ((s.value / totalValue) * 100).toFixed(1) : "0"}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "positions" && (
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="border-b border-border">
                        <tr>
                          {["Ticker", "Shares", "Avg Cost", "Current", "Value", "P&L", "P&L %", ""].map((h) => (
                            <th key={h} className={`px-4 py-3 text-xs font-mono text-muted-foreground ${h === "" ? "" : "text-left"}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map((p) => (
                          <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors group">
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-sm font-medium text-foreground font-mono">{p.ticker}</p>
                                <p className="text-xs text-muted-foreground font-mono">{p.sector}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-foreground font-mono">{p.shares.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground font-mono">${p.avg_cost.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-foreground font-mono">${p.current_price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-foreground font-mono">${calcValue(p).toLocaleString("en", { maximumFractionDigits: 0 })}</td>
                            <td className="px-4 py-3 text-sm font-mono" style={pnlStyle(calcPnL(p))}>
                              {calcPnL(p) >= 0 ? "+" : ""}${Math.abs(calcPnL(p)).toLocaleString("en", { maximumFractionDigits: 0 })}
                            </td>
                            <td className="px-4 py-3 text-sm font-mono" style={pnlStyle(calcPnLPct(p))}>
                              {calcPnLPct(p) >= 0 ? "+" : ""}{calcPnLPct(p).toFixed(2)}%
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => removePosition(p.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-foreground">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === "dividends" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-card border border-border rounded-xl p-5">
                      <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Monthly Dividend Income</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={DIVIDEND_HISTORY}>
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px", fontFamily: "var(--font-mono)" }} />
                          <Bar dataKey="amount" fill="#AFA089" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-5">
                      <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Dividend Positions</h3>
                      <div className="space-y-3">
                        {positions.filter((p) => p.dividend_yield > 0).sort((a, b) => b.dividend_yield - a.dividend_yield).map((p) => (
                          <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/40">
                            <div>
                              <p className="text-sm font-medium text-foreground font-mono">{p.ticker}</p>
                              <p className="text-xs text-muted-foreground font-mono">{p.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-mono" style={{ color: "var(--trust-bronze)" }}>{p.dividend_yield.toFixed(2)}% yield</p>
                              <p className="text-xs text-muted-foreground font-mono">${(calcValue(p) * p.dividend_yield / 100).toFixed(0)}/yr est.</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
