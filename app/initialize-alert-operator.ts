import { AlertOperator } from "../global/alert-operator.ts";

const initializeAlertOperator = async () => {
  try {
    await AlertOperator.initialize();
  } catch (error) {
    console.error("❌ Failed to initialize AlertOperator:", error);
    throw error;
  }
};

export default initializeAlertOperator;
