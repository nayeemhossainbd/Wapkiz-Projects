const Storage = {
  keys: {
    favorites: "motionhub_favorites",
    recent: "motionhub_recent",
    last: "motionhub_last_channel",
    settings: "motionhub_settings"
  },

  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  /* ---------- Favorites ---------- */

  getFavorites() {
    return this.get(this.keys.favorites, []);
  },

  saveFavorites(list) {
    this.set(this.keys.favorites, list);
  },

  toggleFavorite(channel) {
    const favorites = this.getFavorites();
    const index = favorites.findIndex(item => item.url === channel.url);

    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(channel);
    }

    this.saveFavorites(favorites);
    return favorites;
  },

  isFavorite(url) {
    return this.getFavorites().some(item => item.url === url);
  },

  /* ---------- Recent ---------- */

  getRecent() {
    return this.get(this.keys.recent, []);
  },

  addRecent(channel) {
    let recent = this.getRecent().filter(item => item.url !== channel.url);

    recent.unshift(channel);

    if (recent.length > 20) {
      recent.length = 20;
    }

    this.set(this.keys.recent, recent);
  },

  /* ---------- Last Played ---------- */

  saveLastChannel(channel) {
    this.set(this.keys.last, channel);
  },

  getLastChannel() {
    return this.get(this.keys.last, null);
  },

  /* ---------- Settings ---------- */

  getSettings() {
    return this.get(this.keys.settings, {
      autoplay: true,
      rememberLast: true
    });
  },

  saveSettings(settings) {
    this.set(this.keys.settings, settings);
  }
};
