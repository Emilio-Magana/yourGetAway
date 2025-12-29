import { createClient } from "@supabase/supabase-js";
// import { config } from "dotenv";
// config({ path: ".env" }); // Load .env into process.env

export const SUPABASE_URL = "https://mernpafbodniyukfhxib.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lcm5wYWZib2RuaXl1a2ZoeGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDcwMjAsImV4cCI6MjA2MzIyMzAyMH0.aT45mqYi9aHMRptwfqOnPoWgSOmFSu9iro2FZ3EBqnk";

// const url = import.meta.env.SUPABASE_URL;
// const key = import.meta.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
