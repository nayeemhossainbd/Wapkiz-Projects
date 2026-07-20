class IPTVPlayer {
  constructor(videoId = "player") {
    this.video = document.getElementById(videoId);
    this.player = null;
    this.hls = null;
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
        "airplay",
        "fullscreen"
      ],
      settings: [
        "quality",
        "speed"
      ],
      speed: {
        selected: 1,
        options: [0.5,0.75,1,1.25,1.5,2]
      }
    });
  }

  load(channel) {
    if (!channel || !channel.url) return;

    this.channel = channel;

    this.destroyHls();

    if (Hls.isSupported()) {

      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      this.hls.loadSource(channel.url);
      this.hls.attachMedia(this.video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.setupQuality();
        this.player.play().catch(() => {});
      });

    } else if (this.video.canPlayType("application/vnd.apple.mpegurl")) {

      this.video.src = channel.url;
      this.player.play();

    }
  }

  setupQuality() {
    if (!this.hls) return;

    let qualities = this.hls.levels
      .map(level => level.height)
      .filter((v,i,a)=>a.indexOf(v)===i)
      .sort((a,b)=>b-a);

    this.player.options.quality = {
      default: "auto",
      options: ["auto", ...qualities],
      forced: true,
      onChange: quality => {

        if (quality === "auto") {
          this.hls.currentLevel = -1;
        } else {
          this.hls.currentLevel =
          this.hls.levels.findIndex(
            level => level.height === quality
          );
        }

      }
    };
  }

  destroyHls() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }
}

const player = new IPTVPlayer("player");
