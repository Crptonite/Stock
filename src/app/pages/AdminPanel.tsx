import { useState } from "react";
import { Users, BarChart2, MessageSquare, Settings, Search, Shield, TrendingUp, Activity, Cpu, ChevronDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const USER_DATA = [
  { id: "U001", email: "james.tan@siftpro.sg", plan: "Pro", status: "active", joined: "2024-01-15", lastActive: "2 min ago", queries: 2840 },
  { id: "U002", email: "sarah.lim@capitalgroup.com", plan: "Pro", status: "active", joined: "2024-02-03", lastActive: "1 hr ago", queries: 1920 },
  { id: "U003", email: "alex.wong@morganstanley.com", plan: "Enterprise", status: "active", joined: "2023-11-20", lastActive: "3 hr ago", queries: 5640 },
  { id: "U004", email: "priya.sharma@dbs.com", plan: "Pro", status: "active", joined: "2024-03-10", lastActive: "Yesterday", queries: 980 },
  { id: "U005", email: "marcus.chen@ubs.com", plan: "Enterprise", status: "active", joined: "2023-09-05", lastActive: "Yesterday", queries: 8200 },
  { id: "U006", email: "linda.ho@siftpro.sg", plan: "Free", status: "inactive", joined: "2024-04-22", lastActive: "1 week ago", queries: 45 },
  { id: "U007", email: "raj.patel@templeton.com", plan: "Pro", status: "suspended", joined: "2024-01-30", lastActive: "2 weeks ago", queries: 320 },
];

const USAGE_TREND = [
  { date: "Oct 14", queries: 8400, users: 142 },
  { date: "Oct 15", queries: 9100, users: 156 },
  { date: "Oct 16", queries: 7800, users: 138 },
  { date: "Oct 17", queries: 10200, users: 168 },
  { date: "Oct 18", queries: 11400, users: 182 },
  { date: "Oct 19", queries: 6200, users: 120 },
  { date: "Oct 20", queries: 12800, users: 198 },
];

const TOP_QUERIES = [
  { prompt: "Analyze [TICKER] fundamental valuation", count: 2840 },
  { prompt: "What are the key risks for [TICKER]?", count: 2210 },
  { prompt: "Compare [TICKER] vs sector peers", count: 1960 },
  { prompt: "Show me RSI and MACD for [TICKER]", count: 1750 },
  { prompt: "Summarize latest earnings for [TICKER]", count: 1520 },
];

const MODELS = [
  { id: "claude-opus-4-7", name: "Claude Opus 4.7", latency: "3.2s", cost: "$15/1M tokens", active: true },
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", latency: "1.4s", cost: "$3/1M tokens", active: false },
  { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", latency: "0.6s", cost: "$0.25/1M tokens", active: false },
];

type Tab = "users" | "analytics" | "prompts" | "models";

const PLAN_COLORS: Record<string, string> = {
  Free: "var(--muted-foreground)",
  Pro: "var(--trust-blue)",
  Enterprise: "var(--trust-bronze)",
};

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  active: { color: "var(--trust-blue)", bg: "rgba(139,184,201,0.12)" },
  inactive: { color: "var(--muted-foreground)", bg: "rgba(107,130,153,0.1)" },
  suspended: { color: "var(--trust-bronze)", bg: "rgba(175,160,137,0.12)" },
};

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>("users");
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [models, setModels] = useState(MODELS);

  const filteredUsers = USER_DATA.filter((u) => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase()) || u.id.includes(search);
    const matchPlan = planFilter === "All" || u.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const setActiveModel = (id: string) => {
    setModels((prev) => prev.map((m) => ({ ...m, active: m.id === id })));
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "users", label: "Users", icon: <Users className="w-3.5 h-3.5" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { id: "prompts", label: "Prompts", icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: "models", label: "Models", icon: <Cpu className="w-3.5 h-3.5" /> },
  ];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-muted-foreground font-mono mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs font-mono" style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto custom-scrollbar bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-muted-foreground" />
          <div>
            <h1 className="text-lg font-medium text-foreground font-mono">Admin Panel</h1>
            <p className="text-xs text-muted-foreground font-mono">System management and usage analytics</p>
          </div>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-mono border" style={{ borderColor: "var(--trust-bronze)", color: "var(--trust-bronze)" }}>Admin Access</span>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Users", value: "2,847", sub: "+142 this month", icon: Users, color: "var(--trust-blue)" },
            { label: "Pro Subscribers", value: "1,203", sub: "42.3% conversion", icon: TrendingUp, color: "var(--trust-bronze)" },
            { label: "Daily AI Queries", value: "12,800", sub: "+18% vs last week", icon: MessageSquare, color: "var(--trust-slate)" },
            { label: "Avg Response Time", value: "1.4s", sub: "99.8% uptime", icon: Activity, color: "#6B8E9F" },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-mono">{label}</span>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="text-xl font-medium font-mono" style={{ color }}>{value}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 bg-secondary rounded-lg p-0.5 w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {tab === "users" && (
          <div className="space-y-3">
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="bg-card border border-border text-foreground text-xs pl-8 pr-3 py-2 rounded-lg focus:outline-none font-mono w-52"
                />
              </div>
              <div className="flex gap-1">
                {["All", "Free", "Pro", "Enterprise"].map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setPlanFilter(plan)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${planFilter === plan ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {plan}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-border bg-secondary/30">
                  <tr>
                    {["User ID", "Email", "Plan", "Status", "Joined", "Last Active", "Queries", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-mono text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors group">
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{u.id}</td>
                      <td className="px-4 py-3 text-xs font-mono text-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono" style={{ color: PLAN_COLORS[u.plan] }}>{u.plan}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-mono capitalize" style={STATUS_COLORS[u.status]}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{u.joined}</td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{u.lastActive}</td>
                      <td className="px-4 py-3 text-xs font-mono text-foreground">{u.queries.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <button className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-all">
                          <Settings className="w-3 h-3" /> Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Daily Query Volume</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={USAGE_TREND}>
                  <defs>
                    <linearGradient id="qGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8BB8C9" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8BB8C9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="queries" name="Queries" stroke="#8BB8C9" strokeWidth={1.5} fill="url(#qGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Daily Active Users</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={USAGE_TREND}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="users" name="Users" fill="#AFA089" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === "prompts" && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-medium text-foreground font-mono">Top Query Patterns</h3>
            </div>
            <div className="divide-y divide-border/50">
              {TOP_QUERIES.map((q, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4 hover:bg-secondary/20 transition-colors">
                  <span className="text-xs font-mono text-muted-foreground w-6">#{i + 1}</span>
                  <span className="flex-1 text-sm font-mono text-foreground">{q.prompt}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(q.count / TOP_QUERIES[0].count) * 100}%`, background: "var(--trust-blue)" }} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-12 text-right">{q.count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "models" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-mono">Select which Claude model powers SIFT AI Research. The active model applies to all users.</p>
            {models.map((model) => (
              <div key={model.id} className={`bg-card border rounded-xl p-5 flex items-center gap-4 transition-all ${model.active ? "border-accent/40" : "border-border"}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground font-mono">{model.name}</span>
                    {model.active && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ color: "var(--trust-blue)", background: "rgba(139,184,201,0.12)" }}>Active</span>
                    )}
                  </div>
                  <div className="flex gap-4 mt-1.5">
                    <span className="text-xs text-muted-foreground font-mono">Latency: {model.latency}</span>
                    <span className="text-xs text-muted-foreground font-mono">Cost: {model.cost}</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModel(model.id)}
                  disabled={model.active}
                  className="px-4 py-2 rounded-lg text-xs font-mono border transition-all disabled:opacity-50"
                  style={model.active ? { borderColor: "var(--trust-blue)", color: "var(--trust-blue)" } : { borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                >
                  {model.active ? "Current" : "Activate"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
