const API = require("kucoin-node-sdk");

API.init(require("./config"));

const main = async () => {
  const getSymbolsList = await API.rest.User.Deposit.getDepositAddress();
  console.log(getSymbolsList);

  const res = await API.rest.User.Deposit.getDepositAddressV2("BTC");
  console.log(res);
};

// run rest main
main();
