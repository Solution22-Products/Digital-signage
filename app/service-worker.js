self.addEventListener("sync", function (event) {
  if (event.tag === "stop-playback") {
    event.waitUntil(stopPlaybackInBackground());
  }
});

async function stopPlaybackInBackground() {
  const payload = {
    url: sessionStorage.getItem("url"),
    device_id: sessionStorage.getItem("device_id"),
    is_playing: false,
  };

  try {
    await fetch("/api/stopPlayback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Error during background sync:", error);
  }
}
