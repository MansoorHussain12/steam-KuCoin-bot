const SteamID = require("steamid");

const toSteam64 = (id) => {
  let steam3Id = "";
  switch (id.type) {
    case 1:
      steam3Id = `[U:1:${id.accountid}]`;
      break;
    case 2:
      steam3Id = `[M:1:${id.accountid}]`;
      break;
    case 3:
      steam3Id = `[G:1:${id.accountid}]`;
      break;
    case 4:
      steam3Id = `[A:1:${id.accountid}]`;
      break;
    case 5:
      steam3Id = `[P:1:${id.accountid}]`;
      break;
    case 6:
      steam3Id = `[C:1:${id.accountid}]`;
      break;
    case 7:
      steam3Id = `[g:1:${id.accountid}]`;
      break;
    case 8:
      steam3Id = `[c:1:${id.accountid}]`;
      break;
    case 10:
      steam3Id = `[a:1:${id.accountid}]`;
      break;
  }
  const sid = new SteamID(steam3Id);
  const steam64 = sid.getSteamID64();
  return steam64;
};

exports.toSteam64 = toSteam64;
