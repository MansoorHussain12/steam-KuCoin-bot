const mongoose = require("mongoose");

const cryptoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minLength: 1,
      maxLength: 255,
    },
    balance: {
      type: Number,
      min: 0,
      max: 50000,
    },
  },
  { _id: false }
);

const balanceSchema = new mongoose.Schema({
  _id: String,
  cryptos: [cryptoSchema],
});

const Balance = mongoose.model("Balance", balanceSchema);

const saveBalance = async (data) => {
  let index = data.details.length - 1;
  let details = {
    _id: data._id,
    crypto: {
      name: data.details[index].currency,
      balance: data.details[index].amount,
    },
  };
  let currentBalance = await Balance.findById(details._id);
  if (!currentBalance) {
    const newBalance = await new Balance({
      _id: details._id,
      cryptos: details.crypto,
    });

    await newBalance.save();
  } else {
    if (currentBalance.cryptos.find((c) => c.name === details.crypto.name)) {
      currentBalance.cryptos.find(
        (c) => c.name === details.crypto.name
      ).balance += details.crypto.balance;

      await currentBalance.save();
    } else {
      const newCrypto = {
        name: details.crypto.name,
        balance: details.crypto.balance,
      };
      currentBalance.cryptos.push(newCrypto);
      await currentBalance.save();
    }
  }
};

const checkBalance = async (_id) => {
  const balance = await Balance.findById(_id);
  if (!balance) {
    return "You do not have any deposits with us.";
  } else {
    const cryptos = balance.cryptos;
    return cryptos;
  }
};

exports.saveBalance = saveBalance;
exports.checkBalance = checkBalance;
// currentBalance.cryptos.find(
//   (c) => (c.name = details.crypto.name)
// ).balance
