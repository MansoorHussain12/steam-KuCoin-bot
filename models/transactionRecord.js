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
          amount: Number,
          date: {
            type: Date,
            default: Date.now(),
          },
        },
        { _id: false }
      ),
    ],
  },
  { _id: false }
);

const recordSchema = new mongoose.Schema({
  _id: Number,
  currencies: [currencySchema],
});

const TransactionRecord = mongoose.model("TxRecord", recordSchema);

const saveTxRecord = async (details) => {
  let toSave = {
    _id: details._id,
    currencies: {
      name: details.crypto.name,
      balance: {
        amount: details.crypto.balance,
      },
    },
  };
  try {
    const currentRecord = await TransactionRecord.findById(toSave._id);
    if (!currentRecord) {
      const newRecord = new TransactionRecord({
        _id: toSave._id,
        currencies: toSave.currencies,
      });
      await newRecord.save();
    } else {
      if (
        currentRecord.currencies.find((c) => toSave.currencies.name === c.name)
      ) {
        currentRecord.currencies
          .find((c) => toSave.currencies.name === c.name)
          .balance.push(toSave.currencies.balance);

        await currentRecord.save();
      } else {
        currentRecord.currencies.push(toSave.currencies);
        await currentRecord.save();
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const checkTxRecord = async (details) => {
  try {
    const currentRecord = await TransactionRecord.findById(currencyDetails);
    if (!currentRecord) return false;
    else if (
      currentRecord.currencies.find((currency) => {
        details.crypto.balance === currency.balance;
      })
    ) {
      return true;
    }
  } catch (error) {
    console.log(error);
  }
};

exports.saveTxRecord = saveTxRecord;
exports.checkTxRecord = checkTxRecord;
