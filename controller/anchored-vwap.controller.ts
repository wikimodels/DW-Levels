import { Request, Response } from "npm:express@4.18.2";
import { AnchoredVwapOperator } from "../global/anchored-vwap-operator.ts";
import { AnchorPoint } from "../models/anchor-point.ts";

export const getAnchorPoints = async (req: Request, res: Response) => {
  try {
    const symbol = req.query.symbol as string; // Get symbol from query parameter
    console.log("symbol anchorPoints", symbol);
    // Check if symbol is provided
    if (!symbol) {
      return res
        .status(400)
        .json({ error: "Symbol query parameter is required" });
    }

    const data = await AnchoredVwapOperator.getAnchoredPointsCollection(symbol);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error saving anchor point:", error);
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};

// Controller to save an anchor point
export const saveAnchorPoint = async (req: Request, res: Response) => {
  try {
    const { symbol, openTime } = req.body;
    //TODO: Add validation for symbol and openTime
    console.log("symbol", symbol);
    console.log("openTime", openTime);
    if (!symbol || !openTime || isNaN(openTime)) {
      return res
        .status(400)
        .json({ error: "Invalid input. Symbol and openTime are required." });
    }

    await AnchoredVwapOperator.saveAnchoredPoint(symbol, openTime);

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

    const anchoredPoins: AnchorPoint[] = [];
    const result = await AnchoredVwapOperator.removeAnchorPoint(
      symbol,
      openTime
    );

    if (result.deletedCount !== 0 && result.acknowledged) {
      const data = await AnchoredVwapOperator.getAnchoredPointsCollection(
        symbol
      );
      anchoredPoins.push(...data);
    }

    res.json(anchoredPoins);
  } catch (error) {
    console.error("Error deleting VWAP data:", error);
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};
