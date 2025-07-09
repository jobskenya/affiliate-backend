require('dotenv').config();

module.exports = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  businessShortCode: process.env.MPESA_BUSINESS_SHORTCODE,
  passKey: process.env.MPESA_PASSKEY,
  callbackURL: process.env.MPESA_CALLBACK_URL,
  transactionType: 'CustomerPayBillOnline',
  accountReference: 'EARN_ONLINE',
  transactionDesc: 'Account Activation',
};