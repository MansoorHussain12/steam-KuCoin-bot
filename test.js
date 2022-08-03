// const API = require("kucoin-node-sdk");
// API.init(require("./config/kucoin-config"));
// const mongoose = require("mongoose");
// const { RemoteFileConflict } = require("steamstore/resources/EResult");

// const { TransactionRecord } = require("./models/transactionRecord");

// mongoose
//   .connect("mongodb://localhost/steambot")
//   .then(() => {
//     console.log("Connected to MongoDB...");
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// const getTxId = async (_id, name, amount) => {
//   const record = await TransactionRecord.findById(_id);

//   for (let i = 0; i < record.currencies.length; i++) {
//     for (let j = 0; j < record.currencies[i].balance.length; j++) {
//       if (record.currencies[i].balance[j].amount == amount)
//         console.log(record.currencies[i].balance[j]._id.toString());
//     }
//   }
// };

// getTxId("76561199355768714", "USDT", 1.00166);
