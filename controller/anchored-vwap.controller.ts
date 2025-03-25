import { Request, Response } from "npm:express@4.18.2";
import { AnchoredVwapOperator } from "../global/anchored-vwap-operator.ts";

// Controller to save an anchor point
export const saveAnchorPoint = async (req: Request, res: Response) => {
  try {
    const { symbol, openTime } = req.body;

    if (!symbol || !openTime || isNaN(openTime)) {
      return res
        .status(400)
        .json({ error: "Invalid input. Symbol and openTime are required." });
    }

    await AnchoredVwapOperator.saveAnchorPoint(symbol, openTime);

    res.status(201).json({ message: "Anchor point saved." });
  } catch (error) {
    console.error("Error saving anchor point:", error);
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};

// Controller to calculate and save VWAP
export const calculateVWAP = async (req: Request, res: Response) => {
  try {
    const { symbol, anchorTime } = req.body;

    if (!symbol || !anchorTime || isNaN(anchorTime)) {
      return res
        .status(400)
        .json({ error: "Invalid input. Symbol and anchorTime are required." });
    }

    const vwapData = await AnchoredVwapOperator.calculateVWAP(
      symbol,
      anchorTime
    );

    if (!vwapData) {
      return res
        .status(400)
        .json({ error: "No kline data found for the given parameters." });
    }

    res.json({ message: "VWAP calculated and stored.", data: vwapData });
  } catch (error) {
    console.error("Error calculating VWAP:", error);
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};

// Controller to fetch VWAP data by symbol
export const getVWAPData = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({ error: "Symbol is required." });
    }

    const vwapData = await AnchoredVwapOperator.getVWAPData(symbol);

    if (!vwapData.length) {
      return res
        .status(404)
        .json({ error: "No VWAP data found for the symbol." });
    }

    res.json(vwapData);
  } catch (error) {
    console.error("Error fetching VWAP data:", error);
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};

// Controller to delete VWAP data
export const deleteVWAPData = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({ error: "Symbol is required." });
    }

    await AnchoredVwapOperator.deleteVWAPData(symbol);

    res.json({ message: "VWAP data deleted." });
  } catch (error) {
    console.error("Error deleting VWAP data:", error);
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};
