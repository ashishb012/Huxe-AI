// ─────────────────────────────────────────────────────────────
// Huxe AI — Market Service (Yahoo Finance)
// ─────────────────────────────────────────────────────────────

import { MarketDataItem } from '../types/brief';

const SYMBOLS = [
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^IXIC', name: 'NASDAQ' },
  { symbol: '^NSEI', name: 'NIFTY 50' },
  { symbol: '^BSESN', name: 'SENSEX' },
];

/**
 * Fetch market data for predefined indices using Yahoo Finance public API.
 */
export async function fetchMarketData(): Promise<MarketDataItem[]> {
  try {
    const promises = SYMBOLS.map(async (item) => {
      // Using query1.finance.yahoo.com for public chart data
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.symbol)}?range=1d&interval=1d`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${item.symbol}`);
      }
      
      const data = await response.json();
      const result = data.chart.result[0];
      const meta = result.meta;
      
      const currentPrice = meta.regularMarketPrice;
      const previousClose = meta.previousClose;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;
      
      return {
        symbol: item.symbol.replace('^', ''), // Clean up ticker symbol
        name: item.name,
        value: currentPrice,
        change: change,
        changePercent: changePercent,
        isPositive: change >= 0,
      } as MarketDataItem;
    });

    const results = await Promise.all(promises);
    return results;

  } catch (error) {
    console.error('Failed to fetch market data:', error);
    // Fallback to mock data on error
    return [
      {
        symbol: 'SPX',
        name: 'S&P 500',
        value: 5304.72,
        change: 23.76,
        changePercent: 0.45,
        isPositive: true,
      },
      {
        symbol: 'IXIC',
        name: 'NASDAQ',
        value: 16831.48,
        change: 103.71,
        changePercent: 0.62,
        isPositive: true,
      }
    ];
  }
}
