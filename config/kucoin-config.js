/**
 * copy to config.js, and write configure
 */
module.exports = {
  /** set API baseUrl, */
  /**   if not set this key, or empty, or false, or undefined, */
  /**   default baseUrl will be set by `process.env.PRODUCTION` */
  /**   if process.env.PRODUCTION === 'prod', the default value will be https://api.kucoin.io */
  /**   else use sandbox as https://openapi-sandbox.kucoin.io */
  baseUrl: "https://api.kucoin.com",
  /** Auth infos */
  /**   key is API key */
  /**   secret is API secret */
  /**   passphrase as API passphrase */
  apiAuth: {
    key: "62be5a1b913d5500017ebaed",
    secret: "4aa4491e-285f-4bb5-a3a1-752939c7e9fb",
    passphrase: "Warkillshope0007.",
  },
  authVersion: 2,
};
