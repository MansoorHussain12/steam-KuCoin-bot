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
  let balanceList = await Balance.find();
  let currentBalance = balanceList.find((balance) => balance._id == data._id);

  if (!currentBalance) {
    const newBalance = await new Balance({
      _id: data._id,
    });
    newBalance.cryptos.push({
      name: data.details[0].currency,
      balance: data.details[0].amount,
    });

    for (let i = 0; i < data.details.length; i++) {
      if (data.details[i].messageSent != 1) {
        if (newBalance.cryptos[0].name == data.details[i].currency) {
          if (newBalance.cryptos[0].balance != data.details[i].amount)
            newBalance.cryptos[0].balance += data.details[i].amount;
        } else
          newBalance.cryptos.push({
            name: data.details[i].currency,
            balance: data.details[i].amount,
          });
      }
    }

    await newBalance.save();

    return;
  } else {
    for (let i = 0; i < currentBalance.cryptos.length; i++) {
      for (let j = 0; j < data.details.length; j++) {
        if (data.details[j].messageSent != 1) {
          if (currentBalance.cryptos[i].name == data.details[j].currency)
            currentBalance.cryptos[i].balance += data.details[j].amount;
          else
            currentBalance.cryptos.push({
              name: data.details[j].currency,
              balance: data.details[j].amount,
            });
        }
      }
    }
    await currentBalance.save();

    return;
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
