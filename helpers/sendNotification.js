const { saveBalance } = require("../models/balance");

const sendNotification = async (client, depositObject) => {
  for (let i = 0; i < depositObject.details.length; i++) {
    if (depositObject.details[i].messageSent != 1) {
      if (depositObject.details[i].status == "SUCCESS") {
        client.chat.sendFriendMessage(
          depositObject._id,
          `Your transaction of amount ${depositObject.details[i].amount} ${depositObject.details[i].currency}
               on ${depositObject.details[i].chain} network has been confirmed. We have updated your balance.
               Kindly check it with !balance. Thanks! \n TxID : ${depositObject.details[i].walletTxId}`
        );

        await saveBalance(depositObject);
      } else if (depositObject.details[i].status == "PROCESSING") {
        client.chat.sendFriendMessage(
          depositObject._id,
          `We have detected your transaction of ${depositObject.details[i].amount} ${depositObject.details[i].currency} on ${depositObject.details[i].chain} 
        network. It may take minutes or hours to confirm it on blockchain. 
        \nTxID :  ${depositObject.details[i].walletTxId}.\n`
        );
      } else {
        client.chat.sendFriendMessage(
          depositObject._id,
          depositObject._id,
          `Your transacton has failed of ${depositObject.details[i].amount} 
          ${depositObject.details[i].currency} on ${depositObject.details[i].chain} network. 
          \nTxID :  ${depositObject.details[i].walletTxId}.`
        );
      }
    }
    depositObject.details[i].messageSent = 1;
    await depositObject.save();
  }
};

exports.sendNotification = sendNotification;
