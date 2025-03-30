import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/deps.ts";

export interface ModifyResult {
  upsertedId: ObjectId | undefined;
  upsertedCount: number;
  matchedCount: number;
  modifiedCount: number;
}
