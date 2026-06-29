import { useEffect, useRef } from "react";

export function TradingViewTickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || containerRef.current.childElementCount > 0) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "NASDAQ:AAPL", title: "Apple" },
        { proName: "NASDAQ:MSFT", title: "Microsoft" },
        { proName: "NASDAQ:GOOGL", title: "Alphabet" },
        { proName: "NASDAQ:NVDA", title: "Nvidia" },
        { proName: "NASDAQ:TSLA", title: "Tesla" },
        { proName: "NASDAQ:AMZN", title: "Amazon" },
        { proName: "NASDAQ:META", title: "Meta" },
        { proName: "SGX:D05", title: "DBS" },
        { proName: "SGX:O39", title: "OCBC" },
        { proName: "SGX:U11", title: "UOB" },
        { proName: "SGX:Z74", title: "Singtel" },
        { proName: "HKEX:700", title: "Tencent" },
        { proName: "HKEX:9988", title: "Alibaba" },
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
        { proName: "FOREXCOM:NSXUSD", title: "Nasdaq 100" },
        { proName: "INDEX:STI", title: "STI" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en",
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div
      className="tradingview-widget-container border-b border-border"
      style={{ background: "rgba(11,16,21,0.8)" }}
    >
      <div ref={containerRef} className="tradingview-widget-container__widget" />
    </div>
  );
}
