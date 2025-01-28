const { createClient } = require("@supabase/supabase-js");
//import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uxtdqbyjhvylecoctitq.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4dGRxYnlqaHZ5bGVjb2N0aXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTcxMzAxNzAsImV4cCI6MjAzMjcwNjE3MH0.H9qxe-mxJEfWBwsZTcKoPArKdND4oQqPKaeAmP4cb3g";
const supabase = createClient(supabaseUrl, supabaseKey);
//import { supabase } from "@/utils/supabase/supabaseClient";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { url, device_id } = req.body;

    try {
      const { error } = await supabase
        .from("playback_sessions")
        .update({ is_playing: false })
        .eq("url", url)
        .eq("device_id", device_id);

      if (error) {
        return res
          .status(500)
          .json({ error: "Failed to update playback session" });
      }

      res.status(200).json({ message: "Playback session stopped" });
    } catch (err) {
      res.status(500).json({ error: "Unexpected error occurred" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
