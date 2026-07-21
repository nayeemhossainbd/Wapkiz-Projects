const PLAYLIST_URL = "https://raw.githubusercontent.com/abusaeeidx/Mrgify-BDIX-IPTV/refs/heads/main/Channels_data.json";

let channels = [];

document.addEventListener("DOMContentLoaded", async function () {
  try {
    channels = await loadPlaylist(PLAYLIST_URL);
    renderChannels(channels);
    setupSearch();
    setupCategories();
  } catch (error) {
    console.error("Playlist error:", error);
  }
});
