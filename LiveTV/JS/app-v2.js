const PLAYLIST_URL = "https://cdn.jsdelivr.net/gh/nayeemhossainbd/Wapkiz-Projects@main/LiveTV/LIST/ad.m3u8";

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

function renderChannels(list) {
  const container = document.getElementById("channelList");

  if (!container) return;

  container.innerHTML = list.map(channel => `
    <button class="list-group-item list-group-item-action d-flex align-items-center channel-item" data-url="${channel.url}">
      <img src="${channel.logo || ""}" class="rounded me-3" width="45" height="45" loading="lazy">
      <div>
        <div class="fw-semibold">${channel.name}</div>
        <small class="text-secondary">${channel.group}</small>
      </div>
    </button>
  `).join("");

  container.querySelectorAll(".channel-item").forEach(item => {
    item.onclick = function () {
      const channel = channels.find(ch => ch.url === this.dataset.url);

      if (channel) {
        playStream(channel.url, channel.name, channel.group);
      }
    };
  });
}

function setupSearch() {
  const search = document.getElementById("channelSearch");

  if (!search) return;

  search.addEventListener("input", function () {
    const value = this.value.toLowerCase();

    renderChannels(
      channels.filter(channel =>
        channel.name.toLowerCase().includes(value) ||
        channel.group.toLowerCase().includes(value)
      )
    );
  });
}

function setupCategories() {
  const bar = document.getElementById("categoryBar");

  if (!bar) return;

  const groups = [
    "All",
    ...new Set(channels.map(channel => channel.group))
  ];

  bar.innerHTML = groups.map(group => `
    <button class="btn btn-primary btn-sm category-btn" data-group="${group}">
      ${group}
    </button>
  `).join("");

  bar.querySelectorAll(".category-btn").forEach(btn => {
    btn.onclick = function () {
      const group = this.dataset.group;

      renderChannels(
        group === "All"
          ? channels
          : channels.filter(channel => channel.group === group)
      );
    };
  });
}
