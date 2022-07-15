// const mongoose = require("mongoose");

// const API = require("kucoin-node-sdk");
// API.init(require("./config/kucoin-config"));

// mongoose
//   .connect("mongodb://localhost/steambot")
//   .then(() => {
//     console.log("Connected to MongoDB...");
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// const { TransactionRecord } = require("./models/transactionRecord");

// const getTxId = async (_id, name, amount) => {
//   const record = await TransactionRecord.findById(_id);

//   let i = 0;
//   let j = 0;

//   //   while (i < record.currencies.length) {
//   //     while (j < record.currencies[i].balance.length) {
//   //       if (record.currencies[i].balance[j].amount === amount) {
//   //         let txId = record.currencies[i].balance[j]._id.toString();
//   //         return txId;
//   //       }
//   //       j++;
//   //     }
//   //     i++;
//   //   }
//   while (i < record.currencies.length) {
//     while (j < record.currencies[i].balance.length) {
//       if (record.currencies[i].name == name) {
//         if (record.currencies[i].balance[j].amount == amount) {
//           return record.currencies[i].balance[j]._id.toString();
//         }
//       }
//       j++;
//     }
//     i++;
//   }
// };

// const abc = async () => {
//   let obj = await getTxId("76561199355768714", "BTC", 2.00000243);
//   console.log(obj);
// };

// abc();
