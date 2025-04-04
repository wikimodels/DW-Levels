import { Request, Response } from "npm:express@4.18.2";

import { AlertsCollection } from "../models/alerts-collections.ts";

import { fetchVwapAlerts } from "../functions/mongodb-vwap-alerts/fetch-vwap-alerts.ts";
import { addVwapAlert } from "../functions/mongodb-vwap-alerts/add-vwap-alert.ts";
import { updateVwapAlert } from "../functions/mongodb-vwap-alerts/update-vwap-alert.ts";
import { deleteManyVwap } from "../functions/mongodb-vwap-alerts/delete-many-vwap-alerts.ts";
import { moveManyVwap } from "../functions/mongodb-vwap-alerts/move-many-vwap-alerts.ts";
import { fetchVwapAlertsBySymbol } from "../functions/mongodb-vwap-alerts/fetch-vwap-alerts-by-symbol.ts";
import { deleteBySymbolAndOpenTime } from "../functions/mongodb-vwap-alerts/delete-by-symbol-and-open-time.ts";

export async function getVwapAlertsController(req: Request, res: Response) {
  try {
    const collectionName = req.query.collectionName as string;

    if (!collectionName) {
      return res
        .status(400)
        .json({ error: "Missing collectionName parameter" });
    }

    if (
      !Object.values(AlertsCollection).includes(
        collectionName as AlertsCollection
      )
    ) {
      return res.status(400).json({ error: "Invalid collection name" });
    }

    const alerts = await fetchVwapAlerts(collectionName as AlertsCollection);

    return res.status(200).json(alerts);
  } catch (error) {
    console.error("❌ Error fetching alerts:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export const addVwapAlertController = async (req: Request, res: Response) => {
  try {
    const collectionName = req.query.collectionName as AlertsCollection;
    const { alert } = req.body; // Extract alert from request body

    // ✅ Check if collectionName is provided
    if (!collectionName) {
      return res
        .status(400)
        .json({ error: "Missing collectionName parameter" });
    }

    // ✅ Validate collectionName against the enum values
    if (
      !Object.values(AlertsCollection).includes(
        collectionName as AlertsCollection
      )
    ) {
      return res.status(400).json({ error: "Invalid collection name" });
    }

    // ✅ Validate alert object
    if (!alert) {
      return res.status(400).json({ error: "Invalid alert data" });
    }

    // ✅ Call the service function to add alert
    const success = await addVwapAlert(collectionName, alert);

    if (success) {
      return res.status(201).json({ message: "Alert added successfully!" });
    } else {
      return res.status(500).json({ error: "Failed to add alert." });
    }
  } catch (error) {
    console.error("❌ Error in addAlertController:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const updateVwapAlertController = async (
  req: Request,
  res: Response
) => {
  try {
    const collectionName = req.query.collectionName as AlertsCollection;
    const { filter, updatedData } = req.body;

    if (!collectionName) {
      return res
        .status(400)
        .json({ error: "Missing collectionName parameter" });
    }

    // ✅ Validate collectionName against the enum values
    if (
      !Object.values(AlertsCollection).includes(
        collectionName as AlertsCollection
      )
    ) {
      return res.status(400).json({ error: "Invalid collection name" });
    }

    // ✅ Call the service function to add alert
    // collectionName: string,
    // filter: Partial<Alert>,
    // updateData: Partial<Alert>

    const success = await updateVwapAlert(collectionName, filter, updatedData);

    if (success) {
      return res.status(201).json({ message: "Alert updated successfully!" });
    } else {
      return res.status(500).json({ error: "Failed to add alert." });
    }
  } catch (error) {
    console.error("❌ Error in addAlertController:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const deleteManyVwapController = async (req: Request, res: Response) => {
  try {
    const { collectionName } = req.query;
    const { ids } = req.body;

    // ✅ Validate parameters
    if (!collectionName || typeof collectionName !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing collectionName parameter" });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid or missing ids array in request body" });
    }

    // ✅ Check if collectionName is a valid enum value
    if (
      !Object.values(AlertsCollection).includes(
        collectionName as AlertsCollection
      )
    ) {
      return res.status(400).json({ error: "Invalid collection name" });
    }

    // ✅ Call deleteMany function
    const success = await deleteManyVwap(
      collectionName as AlertsCollection,
      ids
    );

    if (success) {
      return res.status(200).json({ message: "Alerts deleted successfully!" });
    } else {
      return res
        .status(207)
        .json({ message: "Some alerts might not have been deleted" });
    }
  } catch (error) {
    console.error("❌ Error in deleteManyController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteBySymbolAndOpenTimeController = async (
  req: Request,
  res: Response
) => {
  try {
    const { symbol } = req.query;
    const { collectionName } = req.query;
    const { openTime } = req.query;

    // ✅ Validate parameters
    if (!symbol || typeof symbol !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing symbol parameter" });
    }

    // ✅ Validate parameters
    if (!openTime) {
      return res
        .status(400)
        .json({ error: "Invalid or missing openTime parameter" });
    }

    // ✅ Check if collectionName is a valid enum value
    if (
      !Object.values(AlertsCollection).includes(
        collectionName as AlertsCollection
      )
    ) {
      return res.status(400).json({ error: "Invalid collection name" });
    }

    // ✅ Call deleteMany function
    const success = await deleteBySymbolAndOpenTime(
      symbol,
      collectionName as AlertsCollection,
      openTime
    );
    console.log(symbol, collectionName, openTime);
    if (success) {
      return res.status(200).json({ message: "Alerts deleted successfully!" });
    } else {
      return res
        .status(207)
        .json({ message: "Some alerts might not have been deleted" });
    }
  } catch (error) {
    console.error("❌ Error in deleteManyController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteOneVwapController = async (req: Request, res: Response) => {
  try {
    const { collectionName } = req.query;
    const { id } = req.body;

    // ✅ Validate parameters
    if (!collectionName || typeof collectionName !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing collectionName parameter" });
    }

    // ✅ Check if collectionName is a valid enum value
    if (
      !Object.values(AlertsCollection).includes(
        collectionName as AlertsCollection
      )
    ) {
      return res.status(400).json({ error: "Invalid collection name" });
    }

    // ✅ Call deleteMany function
    const success = await deleteOneVwapController(
      collectionName as AlertsCollection,
      id
    );

    if (success) {
      return res.status(200).json({ message: "Alerts deleted successfully!" });
    } else {
      return res
        .status(207)
        .json({ message: "Some alerts might not have been deleted" });
    }
  } catch (error) {
    console.error("❌ Error in deleteManyController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const moveManyVwapController = async (req: Request, res: Response) => {
  try {
    const { sourceCollection, targetCollection } = req.query;
    const ids = req.body; // Array of alerts to move

    // ✅ Validate input parameters
    if (!sourceCollection || !targetCollection) {
      return res.status(400).json({
        error: "Missing sourceCollection or targetCollection parameter",
      });
    }

    if (
      !Object.values(AlertsCollection).includes(
        sourceCollection as AlertsCollection
      ) ||
      !Object.values(AlertsCollection).includes(
        targetCollection as AlertsCollection
      )
    ) {
      return res.status(400).json({ error: "Invalid collection name" });
    }

    if (!Array.isArray(ids.ids) || ids.ids.length === 0) {
      return res
        .status(400)
        .json({ error: "Alert Ids array is required and cannot be empty" });
    }

    // ✅ Call moveMany function
    const result = await moveManyVwap(
      sourceCollection as AlertsCollection,
      targetCollection as AlertsCollection,
      ids.ids
    );

    // ✅ Send response
    return res.status(200).json({
      message: `Moved ${result.insertCount} alerts from ${sourceCollection} to ${targetCollection}`,
      insertCount: result.insertCount,
      deleteCount: result.deleteCount,
    });
  } catch (error) {
    console.error("❌ Error in moveManyController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getVwapAlertsBySymbolController = async (
  req: Request,
  res: Response
) => {
  try {
    const symbol = req.query.symbol as string; // Get symbol from query parameter
    const collectionName = req.query.collectionName as string; // Get symbol from query parameter

    // Check if symbol is provided
    if (!symbol) {
      return res
        .status(400)
        .json({ error: "Symbol query parameter is required" });
    }

    if (!collectionName) {
      return res
        .status(400)
        .json({ error: "CollectionName query parameter is required" });
    }

    const data = await fetchVwapAlertsBySymbol(
      symbol,
      collectionName as AlertsCollection
    );
    res.status(200).json(data);
  } catch (error) {
    console.error("Error saving anchor point:", error);
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};
