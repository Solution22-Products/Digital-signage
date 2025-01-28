import { supabase } from "@/utils/supabase/supabaseClient"; // Adjust the path to your Supabase client

export default async function handler(req, res) {
  const { url, device_id, curTime } = req.body;

  if (req.method === "POST") {
    try {
      // Check if the session exists
      const { data: existingSession, error: fetchError } = await supabase
        .from("playback_sessions")
        .select("*")
        .eq("url", url)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        return res
          .status(500)
          .json({ error: "Error fetching session", fetchError });
      }

      // Start or update playback session
      if (existingSession) {
        if (existingSession.is_playing === true) {
          return res
            .status(200)
            .json({ message: "URL is already being played." });
        }

        const { error: updateError } = await supabase
          .from("playback_sessions")
          .update({
            is_playing: true,
            device_id,
            last_played: curTime,
          })
          .eq("url", url);

        if (updateError) {
          return res
            .status(500)
            .json({ error: "Error updating session", updateError });
        }

        return res.status(200).json({ message: "Playback started" });
      } else {
        // Insert new playback session
        const { error: insertError } = await supabase
          .from("playback_sessions")
          .insert({
            url,
            is_playing: true,
            device_id,
            last_played: curTime,
          });

        if (insertError) {
          return res
            .status(500)
            .json({ error: "Error starting session", insertError });
        }

        return res
          .status(200)
          .json({ message: "New playback session started" });
      }
    } catch (err) {
      return res.status(500).json({ error: "Unexpected error", err });
    }
  }
}
