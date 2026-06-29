import { useEffect, useRef } from "react";

declare global {
  interface Window {
    TradingView: {
      widget: new (config: object) => void;
    };
  }
}

// Maps common tickers to TradingView exchange:symbol format
function toTVSymbol(ticker: string): string {
  const map: Record<string, string> = {
    // SGX
    "D05.SI": "SGX:D05",
    "O39.SI": "SGX:O39",
    "U11.SI": "SGX:U11",
    "Z74.SI": "SGX:Z74",
    "C6L.SI": "SGX:C6L",
    "F34.SI": "SGX:F34",
    // HKEX
    "0700.HK": "HKEX:700",
    "9988.HK": "HKEX:9988",
    "0005.HK": "HKEX:5",
    "0939.HK": "HKEX:939",
    // US – default to NASDAQ then NYSE
    "AAPL": "NASDAQ:AAPL",
    "MSFT": "NASDAQ:MSFT",
    "GOOGL": "NASDAQ:GOOGL",
    "AMZN": "NASDAQ:AMZN",
    "NVDA": "NASDAQ:NVDA",
    "META": "NASDAQ:META",
    "TSLA": "NASDAQ:TSLA",
    "BRK.B": "NYSE:BRK.B",
    "JPM": "NYSE:JPM",
    "V": "NYSE:V",
  };
  return map[ticker.toUpperCase()] ?? `NASDAQ:${ticker.toUpperCase()}`;
}

interface Props {
  ticker: string;
  height?: number;
}

export function TradingViewAdvancedChart({ ticker, height = 500 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    if (widgetRef.current) widgetRef.current.innerHTML = "";
    const widgetDiv = document.createElement("div");
    widgetDiv.id = `tv-advanced-${ticker}-${Date.now()}`;
    widgetDiv.style.height = `${height}px`;
    if (widgetRef.current) {
      widgetRef.current.appendChild(widgetDiv);
    }

    const initWidget = () => {
      if (!window.TradingView || !widgetRef.current) return;
      new window.TradingView.widget({
        autosize: true,
        symbol: toTVSymbol(ticker),
        interval: "D",
        timezone: "Asia/Singapore",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#0B1015",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        container_id: widgetDiv.id,
        backgroundColor: "rgba(11, 16, 21, 1)",
        gridColor: "rgba(139, 184, 201, 0.05)",
        studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies"],
        withdateranges: true,
        hide_legend: false,
        save_image: false,
      });
    };

    if (window.TradingView) {
      initWidget();
    } else {
      // Load script once
      if (!document.getElementById("tv-advanced-script")) {
        const script = document.createElement("script");
        script.id = "tv-advanced-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;
        script.onload = initWidget;
        document.head.appendChild(script);
        scriptRef.current = script;
      } else {
        // Script already loading — poll until ready
        const poll = setInterval(() => {
          if (window.TradingView) {
            clearInterval(poll);
            initWidget();
          }
        }, 100);
        return () => clearInterval(poll);
      }
    }
  }, [ticker, height]);

  return (
    <div ref={containerRef} style={{ height }}>
      <div ref={widgetRef} style={{ height: "100%" }} />
    </div>
  );
}
