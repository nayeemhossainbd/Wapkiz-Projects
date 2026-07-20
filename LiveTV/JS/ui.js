class IPTVUI {
  constructor() {
    this.channels = [];
    this.filtered = [];
    this.categories = [];

    this.channelList = document.getElementById("channelList");
    this.categoryBar = document.getElementById("categoryBar");
    this.searchInput = document.getElementById("channelSearch");
  }

  setData(channels, categories) {
    this.channels = channels;
    this.filtered = [...channels];
    this.categories = categories;

    this.renderCategories();
    this.renderChannels();
  }

  renderChannels(list = this.filtered) {
    if (!this.channelList) return;

    if (!list.length) {
      this.channelList.innerHTML = `
        <div class="text-center text-secondary py-5">
          No channels found.
        </div>
      `;
      return;
    }

    this.channelList.innerHTML = list.map(channel => `
      <button
        type="button"
        class="list-group-item list-group-item-action d-flex align-items-center channel-item"
        data-url="${channel.url}">
        
        <img
          src="${channel.logo || "https://placehold.co/48x48"}"
          alt="${channel.name}"
          class="rounded me-3"
          width="48"
          height="48"
          loading="lazy">

        <div class="flex-grow-1 text-start">
          <div class="fw-semibold">${channel.name}</div>
          <small class="text-secondary">${channel.group}</small>
        </div>

        <i class="fa-regular fa-star favorite-btn"></i>
      </button>
    `).join("");
  }

  renderCategories() {
    if (!this.categoryBar) return;

    this.categoryBar.innerHTML = this.categories.map(category => `
      <button
        type="button"
        class="btn btn-outline-primary btn-sm me-2 mb-2 category-btn"
        data-category="${category}">
        ${category}
      </button>
    `).join("");
  }

  filter(category = "All") {
    if (category === "All") {
      this.filtered = [...this.channels];
    } else {
      this.filtered = this.channels.filter(channel => channel.group === category);
    }

    if (this.searchInput?.value.trim()) {
      this.search(this.searchInput.value);
      return;
    }

    this.renderChannels();
  }

  search(keyword = "") {
    keyword = keyword.trim().toLowerCase();

    if (!keyword) {
      this.renderChannels(this.filtered);
      return;
    }

    const result = this.filtered.filter(channel =>
      channel.name.toLowerCase().includes(keyword) ||
      channel.group.toLowerCase().includes(keyword)
    );

    this.renderChannels(result);
  }

  toggleFavorite(channel) {
    if (typeof Storage === "undefined") return;

    Storage.toggleFavorite(channel);
    this.renderChannels();
  }

  bindEvents() {
    this.searchInput?.addEventListener("input", e => {
      this.search(e.target.value);
    });

    this.categoryBar?.addEventListener("click", e => {
      const button = e.target.closest(".category-btn");

      if (!button) return;

      this.categoryBar
        .querySelectorAll(".category-btn")
        .forEach(btn => btn.classList.remove("active"));

      button.classList.add("active");

      this.filter(button.dataset.category);
    });

    this.channelList?.addEventListener("click", e => {
      const item = e.target.closest(".channel-item");

      if (!item) return;

      const channel = this.channels.find(
        ch => ch.url === item.dataset.url
      );

      if (!channel) return;

      if (e.target.closest(".favorite-btn")) {
        this.toggleFavorite(channel);
        return;
      }

      player.load(channel);
      this.setActive(channel.url);
    });
  }

  setActive(url) {
    this.channelList
      ?.querySelectorAll(".channel-item")
      .forEach(item => {
        item.classList.toggle(
          "active",
          item.dataset.url === url
        );
      });
  }

  refreshFavorites() {
    this.channelList
      ?.querySelectorAll(".channel-item")
      .forEach(item => {
        const icon = item.querySelector(".favorite-btn");

        if (!icon || typeof Storage === "undefined") return;

        if (Storage.isFavorite(item.dataset.url)) {
          icon.className = "fa-solid fa-star favorite-btn text-warning";
        } else {
          icon.className = "fa-regular fa-star favorite-btn";
        }
      });
  }

  resetSearch() {
    if (!this.searchInput) return;

    this.searchInput.value = "";
    this.filtered = [...this.channels];
    this.renderChannels();
  }

  init() {
    this.bindEvents();
    this.refreshFavorites();
  }
}

const ui = new IPTVUI();        


