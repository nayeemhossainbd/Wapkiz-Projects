class IPTVPlayer {
  constructor(videoId = "player") {
    this.video = document.getElementById(videoId);
    this.player = null;
    this.hls = null;
    this.channel = null;

    this.retryCount = 0;
    this.maxRetries = 3;

    this.init();
  }

  init() {
    this.player = new Plyr(this.video, {
      autoplay: true,
      muted: false,
      keyboard: {
        focused: true,
        global: true
      },
      controls: [
        "play-large",
        "restart",
        "rewind",
        "play",
        "fast-forward",
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
      quality: {
        default: "auto",
        options: ["auto"]
      },
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
      }
    });

    this.bindPlayerEvents();
  }

  bindPlayerEvents() {
    this.video.addEventListener("playing", () => {
      this.retryCount = 0;
    });

    this.video.addEventListener("pause", () => {
      console.log("Paused");
    });

    this.video.addEventListener("ended", () => {
      console.log("Ended");
    });

    this.video.addEventListener("error", () => {
      this.retry();
    });
  }

  load(channel) {
    if (!channel || !channel.url) {
      return;
    }

    this.channel = channel;

    if (typeof Storage !== "undefined") {
      Storage.saveLastChannel(channel);
      Storage.addRecent(channel);
    }

    const nowPlaying = document.getElementById("nowPlaying");
    const nowCategory = document.getElementById("nowCategory");

    if (nowPlaying) {
      nowPlaying.textContent = channel.name;
    }

    if (nowCategory) {
      nowCategory.textContent = channel.group;
    }

    this.destroyHls();

    if (Hls.isSupported()) {
      this.initHls(channel.url);
    } else if (this.video.canPlayType("application/vnd.apple.mpegurl")) {
      this.video.src = channel.url;
      this.player.play();
    } else {
      this.showError("Your browser does not support HLS.");
    }
  }

  initHls(url) {
    this.hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 60
    });

    this.hls.loadSource(url);
    this.hls.attachMedia(this.video);

    this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
      this.setupQuality();
      this.player.play().catch(() => {});
    });

    this.hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
      console.log("Quality:", data.level);
    });

    this.hls.on(Hls.Events.ERROR, (_, data) => {
      if (!data.fatal) return;

      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          this.retry();
          break;

        case Hls.ErrorTypes.MEDIA_ERROR:
          this.hls.recoverMediaError();
          break;

        default:
          this.destroyHls();
          this.showError("Unable to play this channel.");
      }
    });
  }

  setupQuality() {
    if (!this.hls || !this.player) return;

    const levels = this.hls.levels;

    if (!levels.length) return;

    const qualities = levels
      .map(level => level.height)
      .filter((value, index, array) => array.indexOf(value) === index)
      .sort((a, b) => b - a);

    this.player.options.quality = {
      default: "auto",
      options: ["auto", ...qualities],
      forced: true,
      onChange: quality => {
        if (quality === "auto") {
          this.hls.currentLevel = -1;
          return;
        }

        const level = levels.findIndex(item => item.height === quality);

        if (level !== -1) {
          this.hls.currentLevel = level;
        }
      }
    };
  }

  retry() {
    if (this.retryCount >= this.maxRetries) {
      this.showError("Stream unavailable.");
      return;
    }

    this.retryCount++;

    setTimeout(() => {
      if (this.channel) {
        this.load(this.channel);
      }
    }, 2000);
  }

  destroyHls() {
    if (!this.hls) return;

    this.hls.destroy();
    this.hls = null;
  }

  play() {
    return this.player.play();
  }

  pause() {
    this.player.pause();
  }

  stop() {
    this.pause();

    if (this.hls) {
      this.destroyHls();
    }

    this.video.removeAttribute("src");
    this.video.load();
  }

  mute() {
    this.player.muted = !this.player.muted;
  }

  setVolume(value) {
    this.player.volume = Math.max(0, Math.min(1, value));
  }

  setSpeed(speed) {
    this.player.speed = speed;
  }

  fullscreen() {
    this.player.fullscreen.toggle();
  }

  pictureInPicture() {
    if (document.pictureInPictureEnabled) {
      this.player.pip = !this.player.pip;
    }
  }

  showError(message) {
    console.error(message);

    const toast = document.getElementById("playerToast");
    if (toast) {
      toast.textContent = message;
      toast.classList.remove("d-none");
    }
  }

  destroy() {
    this.destroyHls();

    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
  }
}

const player = new IPTVPlayer("player");  
    
