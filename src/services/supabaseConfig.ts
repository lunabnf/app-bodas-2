import { createClient } from "@supabase/supabase-js";

export const supabaseConfig = {
  enabled: true,
  url: "https://hdhvafawtuuaduqmzlcv.supabase.co",
  key: "sb_secret_B956oiynG-Hc8u0CiDjO1Q_sVFAmjxf",
  client: createClient(
    "https://hdhvafawtuuaduqmzlcv.supabase.co",
    "sb_secret_B956oiynG-Hc8u0CiDjO1Q_sVFAmjxf"
  ),
};