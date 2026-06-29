import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, Columns, Globe, BrainCircuit, Loader2 } from "lucide-react";
import { FiftyTwoWeekVisualizer } from "../components/FiftyTwoWeekVisualizer";
import { AuthCheckoutModal } from "../components/AuthCheckoutModal";
import { StockDetailsPanel } from "../components/StockDetailsPanel";
import { STOCK_DATABASE } from "../data/stockData";
import { TradingViewTickerTape } from "../components/TradingViewTickerTape";

const MOCK_DATA = STOCK_DATABASE;

// Pre-defined categories (no custom filtering)
const CATEGORIES = [
  { id: "bluechip", name: "Blue Chip", description: "Top market cap leaders" },
  { id: "growth", name: "Undervalued Growth", description: "P/E < 15 & Profit Growth > 10%" },
  { id: "highroic", name: "High ROIC", description: "ROIC > 20%" },
];

const COLUMNS = [
  { id: "price", label: "Price & 52W Range" },
  { id: "mktCap", label: "Market Cap" },
  { id: "pe", label: "P/E Ratio" },
  { id: "pb", label: "P/B Ratio" },
  { id: "yield", label: "Div Yield" },
  { id: "debtEq", label: "Debt/Eq" },
  { id: "roic", label: "ROIC" },
  { id: "profitGrowth", label: "Profit Growth Rate" },
  { id: "divGrowth", label: "Dividend Growth Rate" },
  { id: "fcf", label: "FCF" },
];

export function Dashboard() {
  const [selectedMarket, setSelectedMarket] = useState<string>("All");
  const [showMarketMenu, setShowMarketMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("bluechip");
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(COLUMNS.map(c => c.id)));
  const [showColMenu, setShowColMenu] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<typeof MOCK_DATA[0] | null>(null);
  const colMenuRef = useRef<HTMLDivElement>(null);
  const marketMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colMenuRef.current && !colMenuRef.current.contains(event.target as Node)) {
        setShowColMenu(false);
      }
      if (marketMenuRef.current && !marketMenuRef.current.contains(event.target as Node)) {
        setShowMarketMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColumn = (id: string) => {
    const newSet = new Set(visibleCols);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setVisibleCols(newSet);
  };

  // Apply market filter
  let filteredData = selectedMarket === "All"
    ? MOCK_DATA
    : MOCK_DATA.filter(row => row.exchange === selectedMarket);

  // Apply category filter (pre-defined, no custom rules)
  if (selectedCategory === "bluechip") {
    filteredData = filteredData.filter(row => {
      const capValue = row.mktCap?.replace(/[^0-9.]/g, '');
      const multiplier = row.mktCap?.includes('T') ? 1000 : row.mktCap?.includes('B') ? 1 : 0.001;
      const marketCapBillions = capValue ? parseFloat(capValue) * multiplier : 0;
      return marketCapBillions > 40;
    });
  } else if (selectedCategory === "growth") {
    filteredData = filteredData.filter(row => {
      const peValue = row.pe || 999;
      const profitGrowthValue = typeof row.profitGrowth === 'string'
        ? parseFloat(row.profitGrowth.replace('%', ''))
        : row.profitGrowth || 0;
      return peValue < 15 && profitGrowthValue > 10;
    });
  } else if (selectedCategory === "highroic") {
    filteredData = filteredData.filter(row => {
      const roicValue = row.roic ? parseFloat(row.roic.replace('%', '')) : 0;
      return roicValue > 20;
    });
  }

  const MissingData = () => (
    <span className="font-mono text-sm text-muted-foreground select-none">N/A</span>
  );

  return (
    <div className="min-h-full pb-20">
      {/* Live Ticker Tape */}
      <TradingViewTickerTape />

      <div className="p-4 md:p-10 max-w-[1800px] mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Market Overview</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
            {selectedMarket === 'All' ? 'Global Equities' :
             selectedMarket === 'SGX' ? 'SGX Blue Chips' :
             selectedMarket === 'US' ? 'US Equities' : 'HKEX Top Movers'}
          </h1>
          <p className="text-sm text-muted-foreground font-medium flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-foreground/20 mr-2" />
            Monitoring {filteredData.length} assets
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-wrap pb-2 md:pb-0 overflow-visible">
          <button
            className="h-11 px-4 md:px-5 bg-card border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-secondary transition-all flex items-center shadow-sm whitespace-nowrap"
          >
            <BrainCircuit className="w-4 h-4 mr-2 text-muted-foreground" />
            Send to AI
          </button>

          <div className="relative" ref={colMenuRef}>
            <button
              onClick={() => setShowColMenu(!showColMenu)}
              className="h-11 px-4 md:px-5 bg-card border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-secondary transition-all flex items-center shadow-sm whitespace-nowrap"
            >
              <Columns className="w-4 h-4 mr-2 text-muted-foreground" />
              Metrics
              <ChevronDown className={`w-4 h-4 ml-2 text-muted-foreground transition-transform ${showColMenu ? 'rotate-180' : ''}`} />
            </button>

            {showColMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-popover border border-border rounded-xl shadow-xl z-50 py-2">
                <div className="px-4 py-2 border-b border-border mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Criteria</span>
                </div>
                <div className="px-2 space-y-1 overflow-visible">
                  {COLUMNS.map(col => (
                    <label key={col.id} onClick={() => toggleColumn(col.id)} className="flex items-center px-3 py-2 hover:bg-accent rounded-lg cursor-pointer transition-colors">
                      <div className={`w-4 h-4 rounded border mr-3 flex items-center justify-center transition-all ${
                        visibleCols.has(col.id)
                          ? "bg-foreground border-foreground"
                          : "border-border bg-transparent"
                      }`}>
                        {visibleCols.has(col.id) && (
                          <svg className="w-3 h-3 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-foreground font-medium select-none">{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="h-11 w-11 shrink-0 bg-card border border-border rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all flex items-center justify-center shadow-sm">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pre-defined Category Selector */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground font-semibold">Category:</span>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`h-9 px-4 rounded-full text-sm font-semibold transition-all flex items-center shadow-sm ${
              selectedCategory === cat.id
                ? "text-foreground border-2 border-border"
                : "bg-card text-muted-foreground border border-border hover:bg-secondary"
            }`}
            style={selectedCategory === cat.id ? { background: "var(--trust-blue)", color: "#0B1015", border: "none" } : {}}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Market/Exchange Toggle */}
      <div className="mb-6 relative w-max z-20" ref={marketMenuRef}>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground font-semibold mr-2 shrink-0">Market/Exchange:</span>
          <button 
            onClick={() => setShowMarketMenu(!showMarketMenu)}
            className="h-9 px-4 bg-card border border-border rounded-full text-sm font-semibold text-foreground hover:bg-secondary transition-all flex items-center shadow-sm whitespace-nowrap"
          >
            {selectedMarket === 'All' ? 'All Markets' : selectedMarket}
            <ChevronDown className={`w-4 h-4 ml-2 text-muted-foreground transition-transform ${showMarketMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {showMarketMenu && (
          <div className="absolute left-0 mt-2 w-48 bg-popover border border-border rounded-xl shadow-xl py-2">
            {['All', 'SGX', 'US', 'HKEX'].map(market => (
              <button
                key={market}
                onClick={() => {
                  setSelectedMarket(market);
                  setShowMarketMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-accent transition-colors ${
                  selectedMarket === market ? 'text-foreground bg-accent/50' : 'text-muted-foreground'
                }`}
              >
                {market === 'All' ? 'All Markets' : market}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="w-full flex flex-col items-center justify-center min-h-[400px] bg-card border border-border rounded-2xl shadow-sm">
          <Loader2 className="w-8 h-8 text-foreground animate-spin mb-4" />
          <p className="text-foreground font-medium">Scanning Database...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center min-h-[400px] bg-card border border-border rounded-2xl shadow-sm">
          <p className="text-muted-foreground font-medium">No counters match your criteria.</p>
        </div>
      ) : (
        <>
          {/* Desktop View (Table) */}
          <div className="hidden md:inline-block min-w-full bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-visible w-fit">
              <table className="w-full text-left whitespace-nowrap border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 font-semibold text-xs text-muted-foreground sticky left-0 z-10 w-64 border-r border-border backdrop-blur-md">Stock Identity</th>
                {COLUMNS.map(col => (
                  visibleCols.has(col.id) && (
                    <th key={col.id} className="px-6 py-4 font-semibold text-xs text-muted-foreground">
                      {col.label}
                    </th>
                  )
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.map((row) => (
                <tr 
                  key={row.id} 
                  className="hover:bg-accent/40 transition-colors cursor-pointer group"
                  onClick={() => setSelectedStock(row)}
                >
                  <td className="px-6 py-4 sticky left-0 z-10 border-r border-border backdrop-blur-md bg-card group-hover:bg-accent/40 transition-colors">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 bg-secondary text-[10px] font-semibold rounded border border-border text-muted-foreground">{row.exchange}</span>
                        <span className="text-xs font-medium text-muted-foreground font-mono">{row.ticker}</span>
                      </div>
                      <span className="font-semibold text-base text-foreground">{row.name}</span>
                    </div>
                  </td>
                  
                  {visibleCols.has("price") && (
                    <td className="px-6 py-4 align-middle min-w-[240px]">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-baseline space-x-1">
                          <span className="font-mono text-lg font-medium text-foreground tabular-nums">${row.price.toFixed(2)}</span>
                          <span className="text-[10px] text-muted-foreground font-semibold">{row.currency}</span>
                        </div>
                        <FiftyTwoWeekVisualizer low={row.low52} high={row.high52} current={row.price} />
                      </div>
                    </td>
                  )}
                  {visibleCols.has("mktCap") && (
                    <td className="px-6 py-4 align-middle">
                      <span className="font-mono text-sm font-medium text-foreground tabular-nums">{row.mktCap || <MissingData />}</span>
                    </td>
                  )}
                  {visibleCols.has("pe") && (
                    <td className="px-6 py-4 align-middle">
                      <span className="font-mono text-sm font-medium text-foreground tabular-nums">{row.pe ? row.pe.toFixed(1) : <MissingData />}</span>
                    </td>
                  )}
                  {visibleCols.has("pb") && (
                    <td className="px-6 py-4 align-middle">
                      <span className="font-mono text-sm font-medium text-foreground tabular-nums">{row.pb ? row.pb.toFixed(1) : <MissingData />}</span>
                    </td>
                  )}
                  {visibleCols.has("yield") && (
                    <td className="px-6 py-4 align-middle">
                      <span className="font-mono text-sm font-medium text-foreground tabular-nums">{row.yield || <MissingData />}</span>
                    </td>
                  )}
                  {visibleCols.has("debtEq") && (
                    <td className="px-6 py-4 align-middle">
                      <span className="font-mono text-sm font-medium text-foreground tabular-nums">{row.debtEq ? row.debtEq.toFixed(1) : <MissingData />}</span>
                    </td>
                  )}
                  {visibleCols.has("roic") && (
                    <td className="px-6 py-4 align-middle">
                      <span className="font-mono text-sm font-medium text-foreground tabular-nums">{row.roic || <MissingData />}</span>
                    </td>
                  )}
                  {visibleCols.has("profitGrowth") && (
                    <td className="px-6 py-4 align-middle">
                      <span className="font-mono text-sm font-medium text-foreground tabular-nums">{row.profitGrowth || <MissingData />}</span>
                    </td>
                  )}
                  {visibleCols.has("divGrowth") && (
                    <td className="px-6 py-4 align-middle">
                      <span className="font-mono text-sm font-medium text-foreground tabular-nums">{row.divGrowth || <MissingData />}</span>
                    </td>
                  )}
                  {visibleCols.has("fcf") && (
                    <td className="px-6 py-4 align-middle">
                      <span className="font-mono text-sm font-medium text-foreground tabular-nums">{row.fcf || <MissingData />}</span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View (Card-based) */}
      <div className="md:hidden space-y-4">
        {filteredData.map((row) => {
          return (
            <div key={row.id} className="bg-[#121820] border border-white/5 rounded-xl overflow-hidden shadow-sm p-5 relative group flex flex-col">
              {/* Mobile Header: Identity */}
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 bg-black/30 text-[10px] font-bold uppercase tracking-widest rounded border border-white/10 text-white/50">{row.exchange}</span>
                    <span className="text-[10px] font-bold text-[#8BB8C9] font-mono">{row.ticker}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">{row.name}</h3>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end space-x-1">
                    <div className="font-mono text-lg font-bold text-white tabular-nums leading-none">${row.price.toFixed(2)}</div>
                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{row.currency}</div>
                  </div>
                  <div className="text-[11px] font-bold font-mono mt-1 flex items-center justify-end text-[#6488A3]">
                    {row.change >= 0 ? '+' : ''}{row.change.toFixed(2)} ({row.changePct >= 0 ? '+' : ''}{row.changePct.toFixed(2)}%)
                  </div>
                </div>
              </div>

              {/* 52W Visualizer */}
              <div className="p-3 bg-black/20 border border-white/5 rounded-xl mb-4">
                 <FiftyTwoWeekVisualizer low={row.low52} high={row.high52} current={row.price} />
              </div>

              {/* Expandable Metrics (No horizontal scroll) */}
              <details className="group/details">
                <summary className="flex items-center justify-between py-3 px-4 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-[#8BB8C9] cursor-pointer list-none hover:bg-white/10 transition-colors">
                  <span>View Metrics</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-open/details:rotate-180" />
                </summary>
                <div className="pt-4 pb-2 grid grid-cols-2 gap-3">
                  {COLUMNS.slice(1).map(col => {
                    if (!visibleCols.has(col.id)) return null;
                    const value = row[col.id as keyof typeof row];
                    const isMissing = value === null;
                    return (
                      <div key={col.id} className="p-3 bg-black/30 rounded-xl border border-white/5">
                        <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold block mb-1">{col.label}</span>
                        <span className={`font-mono text-sm font-bold tabular-nums ${isMissing ? 'opacity-30 text-white' : 'text-white'}`}>
                          {isMissing ? '—' : (typeof value === 'number' ? value.toFixed(1) : value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </details>

              <button 
                onClick={() => setSelectedStock(row)}
                className="mt-4 w-full py-3 bg-[#6488A3]/10 border border-[#6488A3]/30 rounded-lg text-xs font-bold uppercase tracking-widest text-[#8BB8C9] hover:bg-[#6488A3]/20 transition-colors flex items-center justify-center"
              >
                Detailed Analysis
              </button>
            </div>
          );
        })}
      </div>
      </>
      )}
      <AuthCheckoutModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <StockDetailsPanel
        stock={selectedStock}
        isOpen={!!selectedStock}
        onClose={() => setSelectedStock(null)}
      />
      </div>
    </div>
  );
}