class IPTVPlayer {
  constructor(id = "player") {
    this.video = document.getElementById(id);
    this.hls = null;

    this.player = new Plyr(this.video, {
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "duration",
        "mute",
        "volume",
        "settings",
        "pip",
        "fullscreen"
      ],
      settings: [
        "quality",
        "speed"
      ],
      speed: {
        selected: 1,
        options: [0.5, 0.75, 1, 1.25, 1.5, 2]
      }
    });
  }

  load(channel) {
    if (!channel || !channel.url) return;

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    this.video.removeAttribute("src");
    this.video.load();

    if (Hls.isSupported()) {
      this.hls = new Hls({
        enableWorker: true
      });

      this.hls.loadSource(channel.url);
      this.hls.attachMedia(this.video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.setQuality();
        this.player.play().catch(() => {});
      });

    } else if (this.video.canPlayType("application/vnd.apple.mpegurl")) {
      this.video.src = channel.url;
      this.player.play().catch(() => {});
    }

    const title = document.getElementById("nowPlaying");
    const category = document.getElementById("nowCategory");

    if (title) title.textContent = channel.name || "Now Playing";
    if (category) category.textContent = channel.group || "";
  }

  setQuality() {
    if (!this.hls) return;

    const levels = this.hls.levels;

    const qualities = levels
      .map(level => level.height)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => b - a);

    this.player.options.quality = {
      default: "auto",
      options: ["auto", ...qualities],
      forced: true,
      onChange: quality => {
        this.hls.currentLevel =
          quality === "auto"
            ? -1
            : levels.findIndex(
                level => level.height === quality
              );
      }
    };
  }

  stop() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    this.video.pause();
    this.video.removeAttribute("src");
    this.video.load();
  }
}

const player = new IPTVPlayer("player");

function playStream(url, name, group) {
  player.load({
    url: url,
    name: name,
    group: group
  });
}
