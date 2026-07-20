class IPTVPlayer {
  constructor(videoId = "player") {
    this.video = document.getElementById(videoId);
    this.hls = null;
    this.player = null;
    this.channel = null;
    this.init();
  }

  init() {
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

    this.channel = channel;

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
        if (quality === "auto") {
          this.hls.currentLevel = -1;
        } else {
          this.hls.currentLevel = levels.findIndex(
            level => level.height === quality
          );
        }
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

window.player = new IPTVPlayer("player");
