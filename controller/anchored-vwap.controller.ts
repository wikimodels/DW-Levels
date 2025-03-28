import { Request, Response } from "npm:express@4.18.2";
import { VwapChartOperator } from "../global/vwap-chart-operator.ts";
import { VwapAlert } from "../models/vwap-alert.ts";

export const getAllAnchorPoints = async (req: Request, res: Response) => {
  try {
    const symbol = req.query.symbol as string;
    console.log("symbol anchorPoints", symbol);
    // Check if symbol is provided
    if (!symbol) {
      return res
        .status(400)
        .json({ error: "Symbol query parameter is required" });
    }

    const data = await VwapChartOperator.fetchAllAnchoredPoints();

    res.status(200).json(data);
  } catch (error) {
    console.error("Error saving anchor point:", error);
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};

export const getAnchorPointsBySymbol = async (req: Request, res: Response) => {
  try {
    const symbol = req.query.symbol as string; // Get symbol from query parameter
    console.log("symbol anchorPoints", symbol);
    // Check if symbol is provided
    if (!symbol) {
      return res
        .status(400)
        .json({ error: "Symbol query parameter is required" });
    }

    const data = await VwapChartOperator.getAnchoredPointsCollection(symbol);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error saving anchor point:", error);
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};

// Controller to save an anchor point
export const saveAnchorPoint = async (req: Request, res: Response) => {
  try {
    const alert: VwapAlert = req.body;

    if (!alert.symbol || !alert.anchorTime || isNaN(alert.anchorTime)) {
      return res.status(400).json({
        error: "Invalid Vwap Alert Input. Symbol and anchorTime are required.",
      });
    }

    await VwapChartOperator.saveAnchoredPoint(alert);

    res.status(201).json({ message: "Anchor point saved." });
  } catch (error) {
    console.error("Error saving anchor point:", error);
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};

// Controller to delete VWAP data
export const deleteAnchorPoint = async (req: Request, res: Response) => {
  try {
    const { symbol, openTime } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: "Symbol is required." });
    }

    if (!openTime) {
      return res.status(400).json({ error: "Open time is required." });
    }

    const result = await VwapChartOperator.removeAnchorPoint(symbol, openTime);
    res.json(result);
  } catch (error) {
    console.error("Error deleting VWAP data:", error);
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};
