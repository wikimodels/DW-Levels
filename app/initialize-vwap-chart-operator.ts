import { VwapChartOperator } from "../global/vwap-chart-operator.ts";

const initializeVwapChartOperator = async () => {
  try {
    await VwapChartOperator.initialize();
  } catch (error) {
    console.error("❌ Failed to initialize VwapChartOperator:", error);
    throw error;
  }
};

export default initializeVwapChartOperator;
