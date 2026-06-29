import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  scriptUrl: string;
  config: Record<string, any>;
  height?: number | string;
  title?: string;
  className?: string;
}

export default function TradingViewWidget({
  scriptUrl,
  config,
  height = 600,
  title,
  className = ""
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    // Clear any existing widgets on remount/config change
    currentContainer.innerHTML = '';

    // Create the script element
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.type = 'text/javascript';
    script.async = true;
    
    // Inject the widget config as stringified JSON inside the script body
    script.innerHTML = JSON.stringify({
      ...config,
      width: config.width || "100%",
      height: height.toString(),
    });

    // Create a target container required by TradingView's embedding logic
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    currentContainer.appendChild(widgetContainer);
    currentContainer.appendChild(script);

    return () => {
      // Cleanup to prevent memory leaks or duplicate widgets when hot-reloading
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, [scriptUrl, config, height]);

  return (
    <div className={`tradingview-widget-container p-4 bg-[#141414] rounded-xl border border-zinc-800 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <div ref={containerRef} style={{ height }} />
    </div>
  );
}