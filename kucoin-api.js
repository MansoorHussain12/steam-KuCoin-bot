const API = require("kucoin-node-sdk");
API.init(require("./config/kucoin-config"));

const validateCurrency = async (currency) => {
  const currencyDetails = await API.rest.Market.Currencies.getCurrencyDetail(
    currency
  );
  return currencyDetails;
};

const getDepositAddress = async (details) => {
  let addresses = await API.rest.User.Deposit.getDepositAddressV2(
    details.crypto.name
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

const getDepositList = async (details) => {
  const depositList = await API.rest.User.Deposit.getDepositList(details);
  return depositList;
};

exports.validateCurrency = validateCurrency;
exports.getDepositAddress = getDepositAddress;
exports.getDepositList = getDepositList;
