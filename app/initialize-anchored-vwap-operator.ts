import { AnchoredVwapOperator } from "../global/anchored-vwap-operator.ts";

const initializeAnchoredVwapOperator = async () => {
  try {
    await AnchoredVwapOperator.initialize();
  } catch (error) {
    console.error("❌ Failed to initialize AnchoredVwapOperator:", error);
    throw error;
  }
};

export default initializeAnchoredVwapOperator;
