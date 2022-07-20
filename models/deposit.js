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
    inVoiceId: mongoose.Types.ObjectId,
    chain: "",
    walletTxId: "",
  },
};

const depositSchema = new mongoose.Schema({
  _id: String,
  details: [
    new mongoose.Schema(
      {
        currency: String,
        amount: Number,
        address: String,
        memo: String,
        walletTxId: String,
        status: String,
        inVoiceId: String,
        chain: String,
        isInner: Boolean,
        remark: String,
        createdAt: Number,
        updatedAt: Number,
        messageSent: Boolean,
      },
      { _id: false }
    ),
  ],
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
  let k = 0;

  while (i < allTransactions.length) {
    while (j < allTransactions[i].currencies.length) {
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

  i = 0;
  j = 0;
  k = 0;

  for (k = 0; k < list.length; k++) {
    for (i = 0; i < allAmounts.length; i++) {
      for (j = 0; j < allAmounts[i].crypto.balance.length; j++) {
        if (list[k].amount == allAmounts[i].crypto.balance[j].amount) {
          // console.log(list[k].amount);

          let deposit = {
            _id: allAmounts[i]._id,
            details: {
              amount: allAmounts[i].crypto.balance[j].amount,
              currency: list[k].currency,
              address: list[k].address,
              memo: list[k].memo,
              walletTxId: list[k].walletTxId,
              status: list[k].status,
              inVoiceId: allAmounts[i].crypto.balance[j]._id,
              chain: allAmounts[i].crypto.balance[j].chain,
              isInner: list[k].isInner,
              remark: list[k].remark,
              createdAt: list[k].createdAt,
              updatedAt: list[k].updatedAt,
              messageSent: false,
            },
          };
          try {
            let check = await checkDepositDb(deposit);

            if (check != false) {
              let index = check.details.length - 1;
              check.details[index].messageSent = true;
              if (
                check.details[index].status == "PROCESSING" ||
                check.details[index].status == "FAILURE"
              )
                return check;
              else {
                await check.save();
                await saveBalance(check);
                return check;
              }
            } else continue;
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
  }
};

const checkDepositDb = async (currentDeposit) => {
  const deposits = await Deposit.find();

  if (deposits.length === 0) {
    let newDeposit = new Deposit({
      _id: currentDeposit._id,
      details: {
        amount: currentDeposit.details.amount,
        currency: currentDeposit.details.currency,
        address: currentDeposit.details.address,
        memo: currentDeposit.details.memo,
        walletTxId: currentDeposit.details.walletTxId,
        status: currentDeposit.details.status,
        inVoiceId: currentDeposit.details._id,
        chain: currentDeposit.details.chain,
        isInner: currentDeposit.details.isInner,
        remark: currentDeposit.details.remark,
        createdAt: currentDeposit.details.createdAt,
        updatedAt: currentDeposit.details.updatedAt,
        messageSent: false,
      },
    });
    console.log("No deposits found at all");
    return newDeposit;
  }

  let deposit = deposits.find((deposit) => (deposit._id = currentDeposit._id));

  if (!deposit) {
    let newDeposit = new Deposit({
      _id: currentDeposit._id,
      details: {
        amount: currentDeposit.details.amount,
        currency: currentDeposit.details.currency,
        address: currentDeposit.details.address,
        memo: currentDeposit.details.memo,
        walletTxId: currentDeposit.details.walletTxId,
        status: currentDeposit.details.status,
        inVoiceId: currentDeposit.details._id,
        chain: currentDeposit.details.chain,
        isInner: currentDeposit.details.isInner,
        remark: currentDeposit.details.remark,
        createdAt: currentDeposit.details.createdAt,
        updatedAt: currentDeposit.details.updatedAt,
        messageSent: false,
      },
    });
    console.log("Found deposit but not with the given Id");
    return newDeposit;
  }

  for (let i = 0; i < deposit.details.length; i++) {
    if (
      deposit.details[i].messageSent &&
      currentDeposit.details.amount == deposit.details[i].amount
    ) {
      return false;
    }
  }

  deposit.details.push(currentDeposit.details);

  return deposit;
};

exports.depositList = depositList;
exports.Deposit = Deposit;
