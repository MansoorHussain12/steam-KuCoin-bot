const mongoose = require("mongoose");
const API = require("kucoin-node-sdk");
API.init(require("../config/kucoin-config"));

const { TransactionRecord } = require("./transactionRecord");
const { saveBalance } = require("./balance");

let result = {
  _id: "",
  status: false,
  crypto: {
    name: "",
    balance: 0,
  },
};

const depositSchema = new mongoose.Schema({
  _id: String,
  currency: String,
  amount: Number,
  address: String,
  memo: String,
  walletTxId: String,
  status: String,
  txId: String,
  isInner: Boolean,
  remark: String,
  createdAt: Number,
  updatedAt: Number,
});

const Deposit = mongoose.model("Deposits", depositSchema);

const depositList = async () => {
  let data = await API.rest.User.Deposit.getDepositList();

  if (!data) return false;

  let list = data.data.items;

  let allTransactions = await TransactionRecord.find();

  if (!allTransactions) return false;

  let allAmounts = [];
  let details = {
    _id: "",
    crypto: {
      name: "",
      balance: [],
    },
  };

  let i = 0;
  let j = 0;
  let check = false;

  while (i != allTransactions.length) {
    while (j != allTransactions[i].currencies.length) {
      details = {
        _id: allTransactions[i]._id,
        crypto: {
          name: allTransactions[i].currencies[j].name,
          balance: allTransactions[i].currencies[j].balance,
        },
      };
      allAmounts.push(details);
      j++;
    }
    i++;
  }

  let existsInDb = await checkDepositDb(allAmounts);

  if (existsInDb === true) return false;

  i = 0;
  j = 0;

  while (i < allAmounts.length) {
    while (j < allAmounts[i].crypto.balance.length) {
      if (allAmounts[i].crypto.balance[j].amount == list[i].amount) {
        let deposit = new Deposit({
          _id: allAmounts[i]._id,
          amount: allAmounts[i].crypto.balance[j].amount,
          currency: list[i].currency,
          address: list[i].address,
          memo: list[i].memo,
          walletTxId: list[i].walletTxId,
          status: list[i].status,
          txId: allAmounts[i].crypto.balance[j]._id,
          isInner: list[i].isInner,
          remark: list[i].remark,
          createdAt: list[i].createdAt,
          updatedAt: list[i].updatedAt,
        });

        try {
          let save = await deposit.save();

          if (save) {
            result._id = save._id;
            result.status = true;
            (result.crypto.balance = save.amount),
              (result.crypto.name = save.currency);
          }
          await saveBalance(result);
        } catch (error) {
          console.log(error);
        }
      }
      j++;
    }
    i++;
  }
  return result;
};

const checkDepositDb = async (allAmounts) => {
  let depositAmounts = [];
  let check = false;
  const deposits = await Deposit.find();

  if (deposits.length === 0) return (check = false);

  deposits.forEach((d) => {
    depositAmounts.push(d.amount);
  });

  let i = 0;
  let j = 0;

  while (i < allAmounts.length) {
    while (j < allAmounts[i].crypto.balance.length) {
      if (allAmounts[i].crypto.balance[j].amount === depositAmounts[i]) {
        check = true;
      }
      j++;
    }
    i++;
  }

  return check;
};

exports.depositList = depositList;
exports.Deposit = Deposit;
