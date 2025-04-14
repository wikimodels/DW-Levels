// deno-lint-ignore-file no-unused-vars
import { Request, Response } from "npm:express@4.18.2";
import { Coin } from "../models/coin.ts";
import { fetchWorkingCoins } from "../functions/mongodb-working-coins/fetch-working-coins.ts";
import { addWorkingCoin } from "../functions/mongodb-working-coins/add-working-coin.ts";

import { deleteWorkingCoins } from "../functions/mongodb-working-coins/delete-working-coins.ts";
import { updateWorkingCoin } from "../functions/mongodb-working-coins/update-working-coin.ts";
import { addManyWorkingCoins } from "../functions/mongodb-working-coins/add-many-working-coins.ts";
import { logger } from "../global/logger.ts";

export async function getWorkingCoinsController(_req: Request, res: Response) {
  try {
    const coins = await fetchWorkingCoins();

    return res.status(200).json(coins);
  } catch (error) {
    logger.error("❌ Error fetching alerts:", error);
    return res
      .status(500)
      .json({ error: "Error in getWorkingCoinsController" });
  }
}

export const addWorkingCoinController = async (req: Request, res: Response) => {
  try {
    const coin: Coin = req.body;
    const success = await addWorkingCoin(coin);

    if (success) {
      return res.status(201).json({ message: "Alert added successfully!" });
    } else {
      return res.status(500).json({ error: "Failed to add alert." });
    }
  } catch (error) {
    logger.error("❌ Error in addAlertController:", error);
    return res.status(500).json({ error: "Error in addWorkingCoinController" });
  }
};

export const addWorkingCoinsController = async (
  req: Request,
  res: Response
) => {
  try {
    const coins: Coin[] = req.body;
    const success = await addManyWorkingCoins(coins);

    if (success) {
      return res.status(201).json({ message: "Coins added successfully!" });
    } else {
      return res.status(500).json({ error: "Failed to add alert." });
    }
  } catch (error) {
    logger.error("❌ Error in addWorkingCoinsController:", error);
    return res
      .status(500)
      .json({ error: "Error in addWorkingCoinsController" });
  }
};

export const deleteWorkingCoinsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { symbols } = req.body;

    // ✅ Call function
    const success = await deleteWorkingCoins(symbols);

    if (success) {
      return res.status(200).json({ message: "Coins deleted successfully!" });
    } else {
      return res
        .status(207)
        .json({ message: "Some alerts might not have been deleted" });
    }
  } catch (error) {
    logger.error("❌ Error in deleteManyController:", error);
    return res
      .status(500)
      .json({ error: "Error in deleteWorkingCoinsController" });
  }
};

export const updateWorkingCoinController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      filter,
      updatedData,
    }: { filter: Partial<Coin>; updatedData: Partial<Coin> } = req.body;

    // Validate request body
    if (!filter || Object.keys(filter).length === 0) {
      return res
        .status(400)
        .json({ error: "Filter is required for updating a coin." });
    }
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({ error: "Updated data cannot be empty." });
    }

    // ✅ Call the service function to update the coin
    const success = await updateWorkingCoin(filter, updatedData);

    if (success) {
      return res.status(200).json({ message: "Coin updated successfully!" });
    } else {
      return res.status(500).json({ error: "Failed to update coin." });
    }
  } catch (error) {
    logger.error("❌ Error in updateWorkingCoinController:", error);
    return res
      .status(500)
      .json({ error: "Error in updateWorkingCoinController" });
  }
};
