// deno-lint-ignore-file no-explicit-any

import { fetchProxyCoins } from "../functions/http/proxy-coins.ts";

export const getProxyCoins = async (req: any, res: any) => {
  try {
    const coins = await fetchProxyCoins();
    res.send(coins);
  } catch (error) {
    console.error("Error retrieving get1hRollingVwapData:", error);
    res
      .status(500)
      .send("An error occurred while getting get1hRollingVwapData.");
  }
};

export const get1hМа1Data = async (req: any, res: any) => {
  try {
    const data: any[] = [];
    res.send(data);
  } catch (error) {
    console.error("Error retrieving get1hМа1Data:", error);
    res.status(500).send("An error occurred while getting get1hМа1Data.");
  }
};

export const get1hEmaData = async (req: any, res: any) => {
  try {
    const data: any[] = [];
    res.send(data);
  } catch (error) {
    console.error("Error retrieving get1hEmaData:", error);
    res.status(500).send("An error occurred while getting get1hEmaData.");
  }
};

export const get1hCandlesDirectionData = async (req: any, res: any) => {
  try {
    const data: any[] = [];
    res.send(data);
  } catch (error) {
    console.error("Error retrieving get1hCandlesDirectionData:", error);
    res
      .status(500)
      .send("An error occurred while getting get1hCandlesDirectionData.");
  }
};
