# steam-KuCoin-bot

This is basically a steam bot connected with Kucoin API. 

What this bot does...

This bot serves like a crypto-currency bank. Users can deposit crypto-currency into the bot's account by giving commands through steam chat.

Working...

It accepts any friend request made on steam. 
Friends can give a number of commands to the bot. For example :

"!deposit 1 USDT TRC20"

Upon receiving this command, the bot responds with its deposit address of the provided currency and network using Kucoin API. 
If the user makes a transaction on the given address, the bot responds with Transaction ID which can be used to track the status of transaction.
The transaction can result in 3 different types.
1) Success. 
2) Under Process. 
3) Failure. 

In each type, the bot responds with the confirmation message.

For each user a separate account is created. The balance of the account is updated with respect to the successful transactions.

HOW TO RUN THIS BOT

1. In the config folder, fill your steam account and kucoin API configuration details.
2. Do "npm i" in the root folder of the project.
3. Install MongoDB with MongoDB compass.
4. Run the project by 'node index.js'
