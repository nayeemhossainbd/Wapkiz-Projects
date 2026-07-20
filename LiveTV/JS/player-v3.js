class IPTVPlayer {
  constructor(videoId = "player") {
    this.video = document.getElementById(videoId);
    this.player = null;
    this.hls = null;
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
        "airplay",
        "fullscreen"
      ],
      settings: [
        "quality",
        "speed"
      ],
      speed: {
        selected: 1,
        options: [
          0.5,
          0.75,
          1,
          1.25,
          1.5,
          2
        ]
      },
      quality: {
        default: "auto",
        options: [
          "auto"
        ],
        forced: true,
        onChange: quality => {
          if (!this.hls) return;

          if (quality === "auto") {
            this.hls.currentLevel = -1;
          } else {
            this.hls.currentLevel = this.hls.levels.findIndex(
              level => level.height === quality
            );
          }
        }
      }
    });
  }

  load(url) {
    if (!url) return;

    this.destroyHls();

    if (Hls.isSupported()) {
      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      this.hls.loadSource(url);
      this.hls.attachMedia(this.video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.setupQuality();
        this.player.play().catch(() => {});
      });

    } else if (this.video.canPlayType("application/vnd.apple.mpegurl")) {
      this.video.src = url;
      this.player.play();
    }
  }

  setupQuality() {
    if (!this.hls) return;

    const qualities = this.hls.levels
      .map(level => level.height)
      .filter((value, index, array) => array.indexOf(value) === index)
      .sort((a, b) => b - a);

    this.player.options.quality = {
      default: "auto",
      options: [
        "auto",
        ...qualities
      ],
      forced: true,
      onChange: quality => {
        if (quality === "auto") {
          this.hls.currentLevel = -1;
          return;
        }

        this.hls.currentLevel = this.hls.levels.findIndex(
          level => level.height === quality
        );
      }
    };
  }

  destroyHls() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }

  play() {
    return this.player.play();
  }

  pause() {
    this.player.pause();
  }
}

const player = new IPTVPlayer("player");
