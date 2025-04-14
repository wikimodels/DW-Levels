import { Request, Response } from "npm:express@4.18.2";

import { AlertsCollection } from "../models/alerts-collections.ts";

import { addAlert } from "../functions/mongodb-alerts/add-alert.ts";
import { updateAlert } from "../functions/mongodb-alerts/update-alert.ts";
import { deleteMany } from "../functions/mongodb-alerts/delete-alerts.ts";
import { moveMany } from "../functions/mongodb-alerts/move-many-alerts.ts";
import { fetchAlerts } from "../functions/mongodb-alerts/fetch-alerts.ts";
import { AlertBase } from "../models/alert-base.ts";
import { addAlertsBatch } from "../functions/mongodb-alerts/add-alerts-batch.ts";
import { fetchAlertsBySymbol } from "../functions/mongodb-alerts/fetch-alerts-by-symbol.ts";
import { deleteBySymbolAndPrice } from "../functions/mongodb-alerts/delete-by-symbol-and-price.ts";
import { logger } from "../global/logger.ts";

export async function getAlertsController(req: Request, res: Response) {
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

    const alerts = await fetchAlerts(collectionName as AlertsCollection);

    return res.status(200).json(alerts);
  } catch (error) {
    logger.error("❌ Error fetching alerts:", error);
    return res.status(500).json({ error: "Error getAlertsController" });
  }
}

export const addAlertController = async (req: Request, res: Response) => {
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
    const success = await addAlert(collectionName, alert);

    if (success) {
      return res.status(201).json({ message: "Alert added successfully!" });
    } else {
      return res.status(500).json({ error: "Failed to add alert." });
    }
  } catch (error) {
    logger.error("❌ Error in addAlertController:", error);
    return res.status(500).json({ error: "Error in addAlertController" });
  }
};

export const addAlertsBatchController = async (req: Request, res: Response) => {
  try {
    const collectionName = req.query.collectionName as AlertsCollection;
    const alertBases: AlertBase[] = req.body; // Extract alert from request body

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
    if (!alertBases) {
      return res.status(400).json({ error: "Invalid alert data" });
    }

    // ✅ Call the service function to add alert
    const success = await addAlertsBatch(alertBases, collectionName);

    if (success) {
      return res.status(201).json(success);
    } else {
      return res.status(500).json({ error: "Failed to add alerts." });
    }
  } catch (error) {
    logger.error("❌ Error in addAlertsBatchController:", error);
    return res.status(500).json({ error: "Error in addAlertsBatchController" });
  }
};

export const updateAlertController = async (req: Request, res: Response) => {
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

    const success = await updateAlert(collectionName, filter, updatedData);

    if (success) {
      return res.status(201).json({ message: "Alert updated successfully!" });
    } else {
      return res.status(500).json({ error: "Failed to add alert." });
    }
  } catch (error) {
    logger.error("❌ Error in addAlertController:", error);
    return res.status(500).json({ error: "Error in updateAlertController" });
  }
};

export const deleteManyController = async (req: Request, res: Response) => {
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
    const success = await deleteMany(collectionName as AlertsCollection, ids);

    if (success) {
      return res.status(200).json({ message: "Alerts deleted successfully!" });
    } else {
      return res
        .status(207)
        .json({ message: "Some alerts might not have been deleted" });
    }
  } catch (error) {
    logger.error("❌ Error in deleteManyController:", error);
    return res.status(500).json({ error: "Error in deleteManyController" });
  }
};

export const moveManyController = async (req: Request, res: Response) => {
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
    const result = await moveMany(
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
    logger.error("❌ Error in moveManyController:", error);
    return res.status(500).json({ error: "Error in moveManyController" });
  }
};

export const getAlertsBySymbolController = async (
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

    const data = await fetchAlertsBySymbol(
      symbol,
      collectionName as AlertsCollection
    );
    res.status(200).json(data);
  } catch (error) {
    logger.error("Error fetching Alerts By Symbol", error);
    res
      .status(500)
      .json({ error: "Error in getAlertsBySymbolController", details: error });
  }
};

export const deleteBySymbolAndPriceController = async (
  req: Request,
  res: Response
) => {
  try {
    const { symbol } = req.query;
    const { collectionName } = req.query;
    const { price } = req.query;

    // ✅ Validate parameters
    if (!symbol || typeof symbol !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing symbol parameter" });
    }

    // ✅ Validate parameters
    if (!price) {
      return res
        .status(400)
        .json({ error: "Invalid or missing price parameter" });
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
    const success = await deleteBySymbolAndPrice(
      symbol,
      collectionName as AlertsCollection,
      price
    );

    if (success) {
      return res.status(200).json({ message: "Alerts deleted successfully!" });
    } else {
      return res
        .status(207)
        .json({ message: "Some alerts might not have been deleted" });
    }
  } catch (error) {
    logger.error("❌ Error in deleteManyController:", error);
    return res
      .status(500)
      .json({ error: "Erorr in deleteBySymbolAndPriceController" });
  }
};
