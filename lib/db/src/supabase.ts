import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error("SUPABASE_URL environment variable is not set");
if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set");

export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    // Provide ws implementation for Node.js < 22 which lacks native WebSocket
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetch: fetch as any,
  },
  realtime: {
    // @ts-expect-error – ws is a valid WebSocket implementation for Node.js
    transport: WebSocket,
  },
});
