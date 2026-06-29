import { Activity, BarChart3, ListFilter, Menu } from "lucide-react";
import TradingViewWidget from "../components/TradingViewWidget"; // Adjust path if needed
import {
  MARKET_OVERVIEW_WIDGET_CONFIG,
  HEATMAP_WIDGET_CONFIG,
  TOP_STORIES_WIDGET_CONFIG,
  MARKET_DATA_WIDGET_CONFIG
} from "../lib/constants"; // Adjust source file where configs live

export function ProTools() {
  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

  return (
    <div className="flex min-h-screen bg-[#0F0F0F] text-white home-wrapper">
      <section className="grid w-full gap-8 p-6 home-section">
        
        {/* Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1">
            <TradingViewWidget
              title="Market Overview"
              scriptUrl={`${scriptUrl}market-overview.js`}
              config={MARKET_OVERVIEW_WIDGET_CONFIG}
              className="custom-chart"
              height={600}
            />
          </div>
          <div className="xl:col-span-2">
            <TradingViewWidget
              title="Stock Heatmap"
              scriptUrl={`${scriptUrl}stock-heatmap.js`}
              config={HEATMAP_WIDGET_CONFIG}
              height={600}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1">
            <TradingViewWidget
              title="Top Stories"
              scriptUrl={`${scriptUrl}timeline.js`}
              config={TOP_STORIES_WIDGET_CONFIG}
              height={600}
            />
          </div>
          <div className="xl:col-span-2">
            <TradingViewWidget
              title="Market Quotes"
              scriptUrl={`${scriptUrl}market-quotes.js`}
              config={MARKET_DATA_WIDGET_CONFIG}
              height={600}
            />
          </div>
        </div>

      </section>
    </div>
  );
}