const PLAYLIST_URL = "https://cdn.jsdelivr.net/gh/nayeemhossainbd/Wapkiz-Projects@main/LiveTV/LIST/play.m3u8";

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
    <div class="col">
      <button class="card channel-item h-100 w-100 shadow-sm border-0" data-url="${channel.url}">
        <div class="card-body text-center p-2">
          ${channel.logo ? `<img src="${channel.logo}" class="img-fluid mb-2" style="height:48px;width:48px;object-fit:contain;" loading="lazy">` : `<div class="fs-2 mb-2"><i class="fa-solid fa-tv"></i></div>`}
          <div class="fw-semibold small text-truncate">${channel.name}</div>
          <small class="text-secondary d-block text-truncate">${channel.group}</small>
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

  const groups = ["All", ...new Set(channels.map(channel => channel.group))];

  bar.innerHTML = groups.map((group, index) => `
    <button class="btn ${index === 0 ? "btn-primary active" : "btn-outline-primary"} btn-sm category-btn" data-group="${group}">
      ${group}
    </button>
  `).join("");

  bar.querySelectorAll(".category-btn").forEach(btn => {
    btn.onclick = function () {
      bar.querySelectorAll(".category-btn").forEach(b => {
        b.classList.remove("btn-primary", "active");
        b.classList.add("btn-outline-primary");
      });

      this.classList.remove("btn-outline-primary");
      this.classList.add("btn-primary", "active");

      const group = this.dataset.group;

      renderChannels(
        group === "All"
          ? channels
          : channels.filter(channel => channel.group === group)
      );
    };
  });
}
