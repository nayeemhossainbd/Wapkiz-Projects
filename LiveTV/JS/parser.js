class M3UParser {
  constructor(url) {
    this.url = url;
    this.channels = [];
    this.categories = ["All"];
  }

  async load() {
    const response = await fetch(this.url, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Playlist request failed (${response.status})`);
    }

    const playlist = await response.text();

    this.parse(playlist);

    return {
      channels: this.channels,
      categories: this.categories
    };
  }

  parse(playlist) {
    this.channels = [];
    this.categories = ["All"];

    const lines = playlist.split(/\r?\n/);

    let channel = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) continue;

      if (line.startsWith("#EXTINF")) {

        channel = {
          id: this.attr(line, "tvg-id"),
          name: line.split(",").pop().trim(),
          logo: this.attr(line, "tvg-logo"),
          group: this.attr(line, "group-title") || "Other",
          url: ""
        };

        continue;
      }

      if (channel && !line.startsWith("#")) {

        channel.url = line;

        this.channels.push(channel);

        if (!this.categories.includes(channel.group)) {
          this.categories.push(channel.group);
        }

        channel = null;
      }
    }
  }

  attr(text, key) {
    const match = text.match(
      new RegExp(`${key}="([^"]*)"`)
    );

    return match ? match[1] : "";
  }

  filter(category = "All") {
    if (category === "All") {
      return this.channels;
    }

    return this.channels.filter(
      channel => channel.group === category
    );
  }

  search(keyword = "") {
    keyword = keyword.trim().toLowerCase();

    if (!keyword) {
      return this.channels;
    }

    return this.channels.filter(channel =>
      channel.name.toLowerCase().includes(keyword) ||
      channel.group.toLowerCase().includes(keyword)
    );
  }

  get(id) {
    return this.channels.find(channel => channel.id === id);
  }

  count() {
    return this.channels.length;
  }
}
