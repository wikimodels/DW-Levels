import { VwapAlert } from "../../models/vwap-alert.ts";

/**
 * Removes duplicate symbols from the alerts array.
 * Ensures only the first occurrence of each symbol is kept.
 *
 * @param alerts - Array of alerts with potential duplicate symbols.
 * @returns Array of alerts with unique symbols.
 */
export function removeDuplicateSymbols(alerts: VwapAlert[]): VwapAlert[] {
  const seenSymbols = new Set<string>();
  return alerts.filter((alert) => {
    if (seenSymbols.has(alert.symbol)) {
      return false; // Skip duplicate symbols
    }
    seenSymbols.add(alert.symbol); // Add symbol to the set
    return true; // Keep the first occurrence
  });
}
