const PLAYLIST_URL = "https://raw.githubusercontent.com/nayeemhossainbd/Wapkiz-Projects/refs/heads/main/LiveTV/LIST/a.m3u8";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const parser = new M3UParser(PLAYLIST_URL);

    const {
      channels,
      categories
    } = await parser.load();

    ui.setData(channels, categories);
    ui.init();

    const settings = Storage.getSettings();

    if (settings.rememberLast) {
      const lastChannel = Storage.getLastChannel();

      if (lastChannel) {
        player.load(lastChannel);
        ui.setActive(lastChannel.url);
      }
    }

    console.log(`Loaded ${channels.length} channels.`);
  } catch (error) {
    console.error(error);

    const list = document.getElementById("channelList");

    if (list) {
      list.innerHTML = `
        <div class="alert alert-danger m-3">
          Failed to load playlist.
        </div>
      `;
    }
  }
});
