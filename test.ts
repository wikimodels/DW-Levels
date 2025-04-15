import { ConfigOperator } from "./global/config-operator.ts";
import { Hono } from "https://deno.land/x/hono/mod.ts";
import {
  jwtVerify,
  createRemoteJWKSet,
} from "https://deno.land/x/jose@v4.14.4/index.ts";
import { GoogleUserData } from "./models/google-user-data.ts";

// Fetch Google's public keys for token verification
const token =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6ImMzN2RhNzVjOWZiZTE4YzJjZTkxMjViOWFhMWYzMDBkY2IzMWU4ZDkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzMDI2NTI5NTU4MjQtbXQ4Y2JrYWEyYjRuNGkwbGI4ZHFtbDNrYWRoNjBpdG8uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzMDI2NTI5NTU4MjQtbXQ4Y2JrYWEyYjRuNGkwbGI4ZHFtbDNrYWRoNjBpdG8uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTY1MTcwNDUzNzUxNDQwMDY1NjciLCJlbWFpbCI6InlvdW5nLndpa2kubW9kZWxzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE3NDQ3MTM3MDksIm5hbWUiOiJXaWtpIE1vZGVscyIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLNy1mR3VNakhuTGdnZjc4TjFZcENtcFZoMkw0Wm5nOWdEMk9hTDROOEoxZzFtOWkwPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6Ildpa2kiLCJmYW1pbHlfbmFtZSI6Ik1vZGVscyIsImlhdCI6MTc0NDcxNDAwOSwiZXhwIjoxNzQ0NzE3NjA5LCJqdGkiOiI3ZjA4Y2I1NmUwOGNkZDIxMGI3NDJlOTI1MGQ1YmJiMTZjNjU5ODlhIn0.GvOFv6wsZUlGl83_D39DXdpYU1gJ9G0jNUcHIs7BJ1xqk2CE0TOf9liAPTKVo_y5mtzSCF1NzS1hBrh6TZMNllrxV0fJuE8BjTt-asKu3eRNxSYrZtagcZ-_0ADK6DS-p4JD47g79oWSn1HiETsxxcROjeQy3x-VUD0TrETMdEaJFwPzILcSYdPMY9DMXiHd9-G9qBBwhgGcDNRGcDoTbwtYjUDx16-8YeiyFq6LGTAg3tAU9iVqN9XxPGQglqAi3BLb88CskVidDt_fZsM4PSYUH266v2-rnZOsCqVNJOST1IonbtqXGPZG5JNkAOjbqrBc4dzDEXmEarpZXJTM2g";

await ConfigOperator.initialize();
const config = ConfigOperator.getConfig();
const GOOGLE_CLIENT_ID = config.googleAuth.clientId;

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

const { payload } = await jwtVerify(token, JWKS, {
  issuer: "https://accounts.google.com",
  audience: GOOGLE_CLIENT_ID,
});

const userData = payload as GoogleUserData;
// Function to verify the Google ID token
console.log(userData);
