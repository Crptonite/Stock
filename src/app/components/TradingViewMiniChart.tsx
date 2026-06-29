"use client"; // 👈 This must be the first line of the file
import { useEffect, useRef } from "react";

interface Props {
  symbol: string; // TradingView format e.g. "NASDAQ:AAPL"
  width?: number;
  height?: number;
}

export function TradingViewMiniChart({ symbol, width = 220, height = 120 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || ref.current.childElementCount > 0) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width,
      height,
      locale: "en",
      dateRange: "1M",
      colorTheme: "dark",
      isTransparent: true,
      autosize: false,
      largeChartUrl: "",
      noTimeScale: true,
    });

    ref.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" style={{ width, height }}>
      <div ref={ref} className="tradingview-widget-container__widget" />
    </div>
  );
}
