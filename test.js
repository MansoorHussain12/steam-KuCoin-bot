const API = require("kucoin-node-sdk");
API.init(require("./config/sandbox-kucoin"));
const { getAmount } = require("./helpers/randomAmount");

const getCurrencyList = async () => {
  const currencies = await API.rest.Market.Currencies.getCurrencyDetail("ETH");

  console.log(currencies);
};

getCurrencyList();
