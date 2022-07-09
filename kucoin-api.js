const API = require("kucoin-node-sdk");
API.init(require("./config/kucoin-config"));

const validateCurrency = async (currency) => {
  const currencyDetails = await API.rest.Market.Currencies.getCurrencyDetail(
    currency
  );
  return currencyDetails;
};

const getDepositAddress = async (currency) => {
  const address = await API.rest.User.Deposit.getDepositAddressV2(currency);
  return address;
};

const getDepositList = async (details) => {
  const depositList = await API.rest.User.Deposit.getDepositList(details);
  return depositList;
};

exports.validateCurrency = validateCurrency;
exports.getDepositAddress = getDepositAddress;
exports.getDepositList = getDepositList;
