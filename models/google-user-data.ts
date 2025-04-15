import type { JWTPayload } from "https://deno.land/x/jose@v4.14.4/index.ts";

export interface GoogleUserData extends JWTPayload {
  azp: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  jti: string;
  // These properties exist in both JWTPayload and Google's data
  iss: string;
  aud: string;
  sub: string;
  nbf: number;
  iat: number;
  exp: number;
}
