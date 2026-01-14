import { createServer } from "../../server";

export const handler = async (_event: any) => {
  // Minimal OK response (Netlify function stub)
  const app = createServer();
  // app is unused here; in real deployment you'd wrap it.
  return {
    statusCode: 200,
    body: JSON.stringify({ status: "ok" }),
  };
};