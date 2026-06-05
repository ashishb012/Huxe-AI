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
 * Each symbol is fetched independently so one failure doesn't kill the rest.
 */
export async function fetchMarketData(): Promise<MarketDataItem[]> {
  console.log('[Markets] Fetching market data for', SYMBOLS.length, 'symbols...');

  const results = await Promise.allSettled(
    SYMBOLS.map(async (item) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.symbol)}?range=1d&interval=1d`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Yahoo Finance error for ${item.symbol}: ${response.status}`);
      }

      const data = await response.json();
      const chartResult = data?.chart?.result?.[0];
      if (!chartResult) {
        throw new Error(`No chart result for ${item.symbol}`);
      }

      const meta = chartResult.meta;
      if (!meta) {
        throw new Error(`No meta data for ${item.symbol}`);
      }

      const currentPrice = meta.regularMarketPrice ?? 0;
      const previousClose = meta.previousClose ?? currentPrice;
      const change = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

      return {
        symbol: item.symbol.replace('^', ''),
        name: item.name,
        value: currentPrice,
        change: change,
        changePercent: changePercent,
        isPositive: change >= 0,
      } as MarketDataItem;
    })
  );

  const markets: MarketDataItem[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      markets.push(result.value);
    } else {
      console.warn(`[Markets] Failed to fetch ${SYMBOLS[index].symbol}:`, result.reason);
    }
  });

  console.log(`[Markets] Successfully fetched ${markets.length}/${SYMBOLS.length} indices`);
  return markets;
}
