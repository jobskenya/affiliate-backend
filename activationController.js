const axios = require('axios');
const crypto = require('crypto');
const mpesaConfig = require('./mpesaConfig');
const userModel = require('./userModel');
const balanceModel = require('./balanceModel');
const transactionModel = require('./transactionModel');
const { generateAccessToken, generateTimestamp } = require('./mpesaUtils');

// Middleware to validate activation request
const validateActivation = async (req, res, next) => {
  try {
    const { phone } = req.user;
    
    if (!phone) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number is required' 
      });
    }

    // Check if user is already active
    const user = await userModel.findUserByPhone(phone);
    if (user && user.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Account is already active'
      });
    }

    next();
  } catch (error) {
    console.error('Activation validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during validation'
    });
  }
};

// Initiate M-Pesa STK Push
const initiateSTKPush = async (req, res) => {
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
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: `254${phone.substring(1)}`, // Convert to 254 format
      PartyB: mpesaConfig.businessShortCode,
      PhoneNumber: `254${phone.substring(1)}`,
      CallBackURL: `${mpesaConfig.callbackBaseURL}/api/mpesa-callback`,
      AccountReference: `ACTIVATION-${phone}`,
      TransactionDesc: 'Account activation payment'
    };

    // Send STK push request
    const response = await axios.post(
      `${mpesaConfig.baseURL}/stkpush/v1/processrequest`,
      stkPushPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      }
    );

    res.json({
      success: true,
      message: 'Payment request sent to your phone. Please complete the transaction.',
      data: {
        requestId: response.data.CheckoutRequestID,
        phone: phone
      }
    });

  } catch (error) {
    console.error('STK Push initiation error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.response?.data || error.message
    });
  }
};

// Handle M-Pesa callback
const handleMPesaCallback = async (req, res) => {
  try {
    const callbackData = req.body;

    // Validate callback
    if (!callbackData.Body?.stkCallback) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid callback format' 
      });
    }

    const resultCode = callbackData.Body.stkCallback.ResultCode;
    
    // Successful payment
    if (resultCode === 0) {
      const metadata = callbackData.Body.stkCallback.CallbackMetadata.Item;
      const phone = metadata.find(item => item.Name === 'PhoneNumber').Value;
      const amount = metadata.find(item => item.Name === 'Amount').Value;
      const receipt = metadata.find(item => item.Name === 'MpesaReceiptNumber').Value;

      // Convert phone to 07 format
      const formattedPhone = `0${phone.substring(3)}`;

      // Activate user
      const user = await userModel.activateUser(formattedPhone);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Record transaction
      await balanceModel.updateDepositBalance(user.id, amount);
      await transactionModel.createTransaction(
        user.id,
        'Account Activation',
        amount,
        'deposit',
        receipt
      );

      // Credit referrer if exists
      if (user.inviter_phone) {
        const referralBonus = 100; // Ksh 100 referral bonus
        await balanceModel.updateInviteEarnings(user.inviter_phone, referralBonus);
        await transactionModel.createTransaction(
          user.inviter_id,
          `Referral Bonus: ${user.phone}`,
          referralBonus,
          'referral'
        );
      }

      return res.status(200).json({ 
        success: true,
        message: 'Payment processed successfully' 
      });
    }

    // Failed payment
    res.status(400).json({
      success: false,
      message: callbackData.Body.stkCallback.ResultDesc || 'Payment failed'
    });

  } catch (error) {
    console.error('Callback processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message
    });
  }
};

// Check activation status
const checkActivationStatus = async (req, res) => {
  try {
    const { phone } = req.user;
    const user = await userModel.findUserByPhone(phone);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      activated: user.status === 'active',
      status: user.status
    });

  } catch (error) {
    console.error('Activation status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking activation status'
    });
  }
};

// Activate user (for testing or admin use)
const activateUser = async (req, res) => {
  try {
    const { phone } = req.user;
    const user = await userModel.activateUser(phone);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Account activated successfully',
      user: {
        id: user.id,
        phone: user.phone,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Manual activation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error activating account'
    });
  }
};

module.exports = {
  validateActivation,
  initiateSTKPush,
  handleMPesaCallback,
  checkActivationStatus,
  activateUser
};
