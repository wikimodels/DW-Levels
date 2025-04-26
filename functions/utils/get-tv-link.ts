export function getTradingViewLink(
  symbol: string,
  exchanges: string[]
): string {
  // Check if "Bybit" is in exchanges
  if (exchanges.includes("Bybit")) {
    return `https://www.tradingview.com/chart?symbol=BYBIT:${symbol}.P`;
  }

  // Check if "Binance" is in exchanges and "Bybit" is not
  if (exchanges.includes("Binance") && !exchanges.includes("Bybit")) {
    return `https://www.tradingview.com/chart?symbol=BINANCE:${symbol}.P`;
  }

  // Check if "BingX SF" is in exchanges and neither "Binance" nor "Bybit" is present
  if (
    exchanges.includes("BingX SF") &&
    !exchanges.includes("Binance") &&
    !exchanges.includes("Bybit")
  ) {
    return `https://www.tradingview.com/chart?symbol=BINGX:${symbol}.PS`;
  }

  // Check if "BingX PF" is in exchanges and neither "Binance" nor "Bybit" is present
  if (
    exchanges.includes("BingX PF") &&
    !exchanges.includes("Binance") &&
    !exchanges.includes("Bybit")
  ) {
    return `https://www.tradingview.com/chart?symbol=BINGX:${symbol}.P`;
  }

  // Default case (if none of the conditions match)
  return "";
}
