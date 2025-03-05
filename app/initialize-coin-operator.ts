import { CoinOperator } from "../global/coin-operator.ts";

const initializeCoinOperator = async () => {
  try {
    await CoinOperator.initialize();
  } catch (error) {
    console.error("Failed to initialize CoinOperator:", error);
    throw error;
  }
};

export default initializeCoinOperator;
