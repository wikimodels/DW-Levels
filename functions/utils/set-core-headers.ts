import { Request, Response } from "npm:express@4.18.2";

export function setCorsHeaders(req: Request, res: Response) {
  res.headers.set("Access-Control-Allow-Origin", "*"); // Allow all origins, change * to specific origin if needed
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status = 200;
    return res;
  }
}
