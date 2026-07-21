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

function renderChannels(list) {
  const container = document.getElementById("channelList");
  const emptyState = document.getElementById("emptyState");

  if (!container) return;

  if (!list.length) {
    container.innerHTML = "";
    if (emptyState) emptyState.classList.remove("d-none");
    return;
  }

  if (emptyState) emptyState.classList.add("d-none");

  container.innerHTML = list.map(channel => `
    <div class="col">
      <button class="card w-100 h-100 border-0 shadow-sm channel-item" data-url="${channel.url}">
        <div class="card-body text-center p-2">
          ${channel.logo ? `<img src="${channel.logo}" class="img-fluid rounded mb-2" style="height:45px;object-fit:contain" loading="lazy">` : `<i class="fa-solid fa-tv fs-3 text-primary mb-2"></i>`}
          <div class="small fw-semibold text-truncate">${channel.name}</div>
          <small class="text-body-secondary text-truncate d-block">${channel.group}</small>
        </div>
      </button>
    </div>
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
  const clear = document.getElementById("clearSearch");

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

  if (clear) {
    clear.onclick = function () {
      search.value = "";
      renderChannels(channels);
    };
  }
}

function setupCategories() {
  const bar = document.getElementById("categoryBar");

  if (!bar) return;

  const groups = ["All", ...new Set(channels.map(channel => channel.group))];

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
