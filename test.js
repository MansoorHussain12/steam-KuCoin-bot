// const API = require("kucoin-node-sdk");
// API.init(require("./config/kucoin-config"));

// const { supportedCryptos } = require("./config/cryptos");

// const checkAddress = async (details) => {
//   let check = false;
//   details = details.toUpperCase();
//   supportedCryptos.forEach((crypto) => {
//     if (crypto === details) check = true;
//   });

//   if (check == false)
//     return "The currency you entered doesn't support deposit with us.";

//   let address = await API.rest.Market.Currencies.getCurrencyDetail(details);
//   return address;
// };

// const abc = async () => {
//   let a = await checkAddress("doge");
//   console.log(a);
// };

// abc();
