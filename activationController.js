const axios = require('axios');
const crypto = require('crypto');
const mpesaConfig = require('./mpesaConfig');
const userModel = require('./userModel');
const balanceModel = require('./balanceModel');
const transactionModel = require('./transactionModel');
const { generateAccessToken, generateTimestamp } = require('./mpesaUtils');

const initiateSTKPush = async (req, res, next) => {
  try {
    const { phone } = req.user;
    const amount = 100; // Ksh 100 activation fee

    // Generate access token
    const accessToken = await generateAccessToken();

    // Prepare STK push request
    const timestamp = generateTimestamp();
    const password = Buffer.from(
      `${mpesaConfig.businessShortCode}${mpesaConfig.passKey}${timestamp}`
    ).toString('base64');

    const stkPushPayload = {
      BusinessShortCode: mpesaConfig.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: mpesaConfig.transactionType,
      Amount: amount,
      PartyA: `254${phone.substring(1)}`, // Convert to 254 format
      PartyB: mpesaConfig.businessShortCode,
      PhoneNumber: `254${phone.substring(1)}`,
      CallBackURL: mpesaConfig.callbackURL,
      AccountReference: mpesaConfig.accountReference,
      TransactionDesc: mpesaConfig.transactionDesc,
    };

    // Send STK push request
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkPushPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json({
      message: 'STK Push initiated successfully. Please check your phone to complete payment.',
      data: response.data,
    });
  } catch (err) {
    next(err);
  }
};

const handleMPesaCallback = async (req, res, next) => {
  try {
    const callbackData = req.body;

    // Check if payment was successful
    if (callbackData.Body.stkCallback.ResultCode === 0) {
      const metadata = callbackData.Body.stkCallback.CallbackMetadata.Item;
      const phone = metadata.find(item => item.Name === 'PhoneNumber').Value;
      const amount = metadata.find(item => item.Name === 'Amount').Value;
      const mpesaReceiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber').Value;

      // Convert phone to 07 format
      const formattedPhone = `0${phone.substring(3)}`;

      // Activate user
      const user = await userModel.activateUser(formattedPhone);

      // Update balance
      await balanceModel.updateDepositBalance(user.id, amount);
      await transactionModel.createTransaction(
        user.id,
        'Account Activation',
        amount,
        'deposit'
      );

      // Credit referrer if exists
      if (user.inviter_phone) {
        const inviter = await userModel.findUserByPhone(user.inviter_phone);
        if (inviter) {
          const referralBonus = 100; // Ksh 100 for successful referral
          await balanceModel.updateInviteEarnings(inviter.id, referralBonus);
          await transactionModel.createTransaction(
            inviter.id,
            `Referral Bonus: ${user.phone}`,
            referralBonus,
            'invite'
          );
        }
      }

      return res.status(200).json({ message: 'Payment processed successfully' });
    }

    res.status(400).json({ message: 'Payment failed or was cancelled' });
  } catch (err) {
    next(err);
  }
};

module.exports = { initiateSTKPush, handleMPesaCallback };