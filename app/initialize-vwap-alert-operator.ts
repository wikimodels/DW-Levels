import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { VwapAlertOperator } from "../global/vwap-alert-operator.ts";

const initializeVwapAlertOperator = async () => {
  try {
    await VwapAlertOperator.initialize();
  } catch (error) {
    console.error("❌ Failed to initialize VwapAlertOperator:", error);
    throw error;
  }
};

export default initializeVwapAlertOperator;
