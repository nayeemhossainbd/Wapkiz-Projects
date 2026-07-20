async function loadPlaylist(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Playlist loading failed");
  }

  const text = await response.text();
  const lines = text.split(/\r?\n/);

  const channels = [];

  let info = null;

  lines.forEach(line => {
    line = line.trim();

    if (!line) return;

    if (line.startsWith("#EXTINF")) {
      const name = line.split(",").pop().trim();

      const groupMatch = line.match(/group-title="([^"]*)"/);
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);

      info = {
        name: name,
        group: groupMatch ? groupMatch[1] : "Other",
        logo: logoMatch ? logoMatch[1] : ""
      };
    } 
    else if (info && !line.startsWith("#")) {
      channels.push({
        name: info.name,
        group: info.group,
        logo: info.logo,
        url: line
      });

      info = null;
    }
  });

  return channels;
}
