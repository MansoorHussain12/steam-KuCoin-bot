const toSteam64 = (id) => {
  const steam64 = id.getSteamID64();
  return steam64;
};

exports.toSteam64 = toSteam64;
