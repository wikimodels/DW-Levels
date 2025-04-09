import { AlertOperator } from "../../global/alert-operator.ts";
import { AlertBase } from "../../models/alert-base.ts";
import { Alert } from "../../models/alert.ts";
import { AlertsCollection } from "../../models/alerts-collections.ts";
import { Coin } from "../../models/coin.ts";
import { fetchProxyCoins } from "../http/proxy-coins.ts";

export async function addAlertsBatch(
  alertBases: AlertBase[],
  collectionName: AlertsCollection
) {
  try {
    // Step 1: Fetch coins from the proxy
    let coins: Coin[];
    try {
      coins = await fetchProxyCoins();
    } catch (error) {
      console.error("Error fetching proxy coins:", error);
      return {
        success: false,
        message: "Failed to fetch proxy coins.",
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Step 2: Check for duplicate alert names
    let duplicatedAlertNames: string[];
    try {
      duplicatedAlertNames = await AlertOperator.findDuplicateAlertNames(
        alertBases,
        AlertsCollection.WorkingAlerts
      );
    } catch (error) {
      console.error("Error checking for duplicate alert names:", error);
      return {
        success: false,
        message: "Failed to check for duplicate alert names.",
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Step 3: Check for corrupted symbols
    let corruptedSymbols: string[];
    try {
      corruptedSymbols = AlertOperator.findCorruptedSymbols(alertBases, coins);
    } catch (error) {
      console.error("Error finding corrupted symbols:", error);
      return {
        success: false,
        message: "Failed to find corrupted symbols.",
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Step 4: Handle cases where duplicates or corrupted symbols exist
    if (duplicatedAlertNames.length > 0 || corruptedSymbols.length > 0) {
      console.log("Duplicate Alert Names:", duplicatedAlertNames);
      console.log("Corrupted Symbols:", corruptedSymbols);
      return {
        success: false,
        message:
          "Failed to add alerts due to duplicate alert names or corrupted symbols.",
        duplicatedAlertNames,
        corruptedSymbols,
      };
    }

    // Step 5: Create alerts
    let alerts: Alert[];
    try {
      alerts = AlertOperator.createAlerts(alertBases, coins);
    } catch (error) {
      console.error("Error creating alerts:", error);
      return {
        success: false,
        message: "Failed to create alerts.",
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Step 6: Add alerts to the database
    try {
      await AlertOperator.addManyAlerts(collectionName, alerts);
    } catch (error) {
      console.error("Error adding alerts to the database:", error);
      return {
        success: false,
        message: "Failed to add alerts to the database.",
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Success case
    return {
      success: true,
      message: "Alerts added successfully.",
      alerts,
    };
  } catch (error) {
    // Catch-all for any unexpected errors
    console.error("Unexpected error in addAlertsBatch:", error);
    return {
      success: false,
      message: "An unexpected error occurred while processing alerts.",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
