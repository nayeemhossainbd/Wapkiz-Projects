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

    if (Hls.isSupported()) {
      this.hls = new Hls();

      this.hls.loadSource(channel.url);
      this.hls.attachMedia(this.video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.setQuality();
        this.player.play().catch(() => {});
      });

    } else {
      this.video.src = channel.url;
      this.player.play().catch(() => {});
    }
  }

  setQuality() {
    let levels = this.hls.levels;
    let quality = levels.map(x => x.height);

    this.player.options.quality = {
      default: "auto",
      options: ["auto", ...quality],
      forced: true,
      onChange: q => {
        this.hls.currentLevel =
          q === "auto"
            ? -1
            : levels.findIndex(x => x.height === q);
      }
    };
  }

  stop() {
    if (this.hls) this.hls.destroy();
    this.video.pause();
  }
}

window.player = new IPTVPlayer("player");
