import { formateErrorNotificationMsg } from "../formatters/general/error-msg.ts";
import { sendTgTechMessage } from "../tg-clients.ts";

export async function sendErrorReport(
  projectName: string,
  functionName: string,
  error: string
) {
  const msg = formateErrorNotificationMsg(projectName, functionName, error);
  await sendTgTechMessage(msg);
}
