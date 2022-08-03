const API = require("kucoin-node-sdk");
API.init(require("./config/kucoin-config"));

const { supportedCryptos } = require("./config/cryptos");

const validateCurrency = async (currency) => {
  let check = false;
  currency = currency.toUpperCase();
  supportedCryptos.forEach((crypto) => {
    if (crypto === currency) check = true;
  });

  if (check == false) return false;
  const currencyDetails = await API.rest.Market.Currencies.getCurrencyDetail(
    currency
  );
  return currencyDetails;
};

const getDepositAddress = async (details) => {
  let addresses = await API.rest.User.Deposit.getDepositAddressV2(
    details.crypto.name.toUpperCase()
  );

  let list = addresses.data;

  let completeAddress = {
    address: "",
    memo: "",
    chain: "",
  };

  if (details.crypto.chain.length === 0) {
    completeAddress.address = list[0].address;
    completeAddress.memo = list[0].memo;
    completeAddress.chain = list[0].chain;
    return completeAddress;
  }

  let i = 0;
  while (i < list.length) {
    if (list[i].chain == details.crypto.chain) {
      completeAddress.address = list[i].address;
      completeAddress.memo = list[i].memo;
      completeAddress.chain = list[i].chain;
      return completeAddress;
    }
    i++;
  }
  return false;
};

exports.validateCurrency = validateCurrency;
exports.getDepositAddress = getDepositAddress;
