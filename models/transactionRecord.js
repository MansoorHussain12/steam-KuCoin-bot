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
        },
        { _id: false }
      ),
    ],
  },
  { _id: false, timestamps: true }
);

const recordSchema = new mongoose.Schema({
  _id: Number,
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
      await newRecord.save({
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
  let number = 0;
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

exports.saveTxRecord = saveTxRecord;
exports.checkAmount = checkAmount;
