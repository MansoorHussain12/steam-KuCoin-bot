const mongoose = require("mongoose");

const { getAmount } = require("../helpers/randomAmount");

const currencySchema = mongoose.Schema(
  {
    name: {
      type: String,
      minLength: 1,
      maxLength: 255,
    },
    balance: [
      new mongoose.Schema(
        {
          amount: {
            type: Number,
            min: 0,
            max: 1000000,
          },
          chain: String,
        },
        { timestamps: true }
      ),
    ],
  },
  { _id: false }
);

const recordSchema = new mongoose.Schema({
  _id: String,
  currencies: [currencySchema],
});

const TransactionRecord = mongoose.model("TxRecord", recordSchema);

const saveTxRecord = async (details) => {
  let record = {
    _id: details._id,
    currencies: {
      name: details.crypto.name,
      balance: {
        amount: details.crypto.balance,
        chain: details.crypto.chain,
      },
    },
  };

  try {
    const currentRecord = await TransactionRecord.findById(record._id);
    if (!currentRecord) {
      const newRecord = new TransactionRecord({
        _id: record._id,
        currencies: record.currencies,
      });
      let n = await newRecord.save({
        timestamps: { createdAt: true, updatedAt: false },
      });
    } else {
      if (
        currentRecord.currencies.find((c) => record.currencies.name === c.name)
      ) {
        currentRecord.currencies
          .find((c) => record.currencies.name === c.name)
          .balance.push(record.currencies.balance);

        await currentRecord.save({
          timestamps: { createdAt: true, updatedAt: false },
        });
      } else {
        currentRecord.currencies.push(record.currencies);
        await currentRecord.save({
          timestamps: { createdAt: true, updatedAt: false },
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const checkAmount = async (details) => {
  let result = getAmount(details.crypto.balance);
  if (typeof result === "string") {
    return result;
  }

  let record = await TransactionRecord.findById(details._id);
  if (!record) return result;

  if (!record.currencies.find((r) => r.name === details.crypto.name))
    return result;

  if (
    !record.currencies
      .find((r) => r.name === details.crypto.name)
      .balance.find((b) => b === details.crypto.balance)
  )
    return result;
  else {
    while (
      record.currencies
        .find((r) => r.name === details.crypto.name)
        .balance.find((b) => b === details.crypto.balance)
    ) {
      result = getAmount(details.crypto.balance);
    }
    return result;
  }
};

const checkTransactionLimit = async (details) => {
  const record = await TransactionRecord.findById(details._id);
  if (!record) return 3;
  if (!record.currencies.find((r) => r.name === details.crypto.name)) return 3;
  if (
    record.currencies.find((r) => r.name === details.crypto.name).balance
      .length === 1
  )
    return 2;
  if (
    record.currencies.find((r) => r.name === details.crypto.name).balance
      .length === 2
  )
    return 1;
  if (
    record.currencies.find((r) => r.name === details.crypto.name).balance
      .length === 3
  )
    return 0;
};

const getTxId = async (_id, name, amount) => {
  const record = await TransactionRecord.findById(_id);

  let i = 0;
  let j = 0;

  while (i < record.currencies.length) {
    while (j < record.currencies[i].balance.length) {
      if (record.currencies[i].name == name) {
        if (record.currencies[i].balance[j].amount == amount) {
          return record.currencies[i].balance[j]._id.toString();
        }
      }
      j++;
    }
    i++;
  }
};

exports.getTxId = getTxId;
exports.saveTxRecord = saveTxRecord;
exports.checkAmount = checkAmount;
exports.transactionLimit = checkTransactionLimit;
exports.TransactionRecord = TransactionRecord;
