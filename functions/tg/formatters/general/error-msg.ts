// deno-lint-ignore-file
import { UnixToNamedTimeRu } from "../../../utils/time-converter.ts";

export function formateErrorNotificationMsg(
  projectName: string,
  fnName: string,
  error: any
) {
  const msg = `
  <b>🆘 ${projectName}:${fnName}() ERROR</b>
<i>${error}</i>      
<i>⏰ ${UnixToNamedTimeRu(new Date().getTime())}</i>   
<i>&#160&#160&#160</i>`;
  return msg;
}
