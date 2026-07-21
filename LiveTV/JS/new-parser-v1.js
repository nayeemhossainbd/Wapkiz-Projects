const loadPlaylist = async url => {
  const res = await fetch(url);
  const json = await res.json();

  return json.channels.map(ch => ({
    name: ch.name || "Unknown",
    url: ch.url,
    logo: ch.logo || "",
    group: ch.group || "Other"
  }));
};
