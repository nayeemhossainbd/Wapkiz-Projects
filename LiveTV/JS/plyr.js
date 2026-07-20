let hls = null;
let player = null;

document.addEventListener("DOMContentLoaded", function () {
  player = new Plyr("#player", {
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

  if (hls) {
    hls.destroy();
    hls = null;
  }

  if (Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      player.play().catch(function () {});
    });

  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    player.play().catch(function () {});
  }

  const title = document.getElementById("nowPlaying");
  const group = document.getElementById("nowCategory");

  if (title) title.textContent = name;
  if (group) group.textContent = category;
}
