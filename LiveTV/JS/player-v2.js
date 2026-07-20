let hls = null;
let player = null;

document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("player");

  player = new Plyr(video, {
    controls: [
      "play-large",
      "play",
      "progress",
      "current-time",
      "mute",
      "volume",
      "settings",
      "fullscreen"
    ],
    settings: ["speed"]
  });
});

function playStream(url, name, category) {
  const video = document.getElementById("player");

  if (!video || !url) return;

  if (hls) {
    hls.destroy();
    hls = null;
  }

  video.pause();
  video.removeAttribute("src");
  video.load();

  if (Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true
    });

    hls.loadSource(url);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play().catch(function (error) {
        console.log("Tap play required:", error);
      });
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      console.log("HLS Error:", data);
    });

  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    video.play().catch(function (error) {
      console.log(error);
    });
  }

  const title = document.getElementById("nowPlaying");
  const group = document.getElementById("nowCategory");

  if (title) title.textContent = name;
  if (group) group.textContent = category;
}
