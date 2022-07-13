const mongoose = require("mongoose");
const API = require("kucoin-node-sdk");
API.init(require("./config/kucoin-config"));

const { TransactionRecord } = require("./transactionRecord");

const depositSchema = new mongoose.Schema({
  _id: Number,
  amount: Number,
  address: String,
  memo: String,
  walletTxId: String,
  status: String,
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
    _id: 0,
    crypto: {
      name: "",
      balance: [],
    },
  };

  let i = 0;
  let j = 0;

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

  let check = await checkDepositDb(allAmounts);

  if (check === true) return false;

  i = 0;
  j = 0;

  while (i < allAmounts.length) {
    while (j < allAmounts[i].crypto.balance.length) {
      if (allAmounts[i].crypto.balance[j].amount == list[i].amount) {
        let deposit = new Deposit({
          _id: allAmounts[i]._id,
          amount: allAmounts[i].crypto.balance[j].amount,
          address: list[i].address,
          memo: list[i].memo,
          walletTxId: list[i].walletTxId,
          status: list[i].status,
          isInner: list[i].isInner,
          remark: list[i].remark,
          createdAt: list[i].createdAt,
          updatedAt: list[i].updatedAt,
        });

        try {
          await deposit.save();
        } catch (error) {
          console.log(error);
        }
      }
      j++;
    }
    i++;
  }
};

const checkDepositDb = async (allAmounts) => {
  let depositAmounts = [];
  let check = false;
  const deposits = await Deposit.find();

  if (deposits.length === 0) check = false;

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

const informUser = async (client) => {
  const deposits = await Deposit.find();
  if (!deposits) return false;

  deposits.forEach((deposit) => {
    if (deposit.status === "PROCESSING") {
      client.chat.sendFriendMessage(
        deposit._id,
        "Your request to deposit amount is being processed."
      );
    }
    if (deposit.status === "SUCCESS") {
      client.chat.sendFriendMessage(
        deposit._id,
        "Your deposit has successfully reached in our account."
      );
    }
    if (deposit.status === "FAILURE") {
      client.chat.sendFriendMessage(
        deposit._id,
        "Your deposit has failed to reach our account."
      );
    }
  });
};

exports.informUser = informUser;
