const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const userModel = require('./userModel');
const balanceModel = require('./balanceModel');
const transactionModel = require('./transactionModel');
const jwtConfig = require('./jwtConfig');
const { validateRegisterInput, validateLoginInput } = require('./validationMiddleware');

const register = async (req, res, next) => {
  try {
    const { name, phone, gender, password, referralCode } = req.body;

    // Validate input
    const { error } = validateRegisterInput(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Check if user exists
    const existingUser = await userModel.findUserByPhone(phone);
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate referral code if not provided
    const userReferralCode = referralCode || uuidv4().substring(0, 8).toUpperCase();

    // Check if referral code is valid
    let inviterPhone = null;
    if (referralCode) {
      const inviter = await userModel.findUserByReferralCode(referralCode);
      if (!inviter) {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
      inviterPhone = inviter.phone;
    }

    // Create user
    const user = await userModel.createUser({
      name,
      phone,
      gender,
      passwordHash,
      referralCode: userReferralCode,
      inviterPhone
    });

    // Create balance record
    await balanceModel.createBalance(user.id);

    // Generate token
    const token = jwt.sign({ id: user.id }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        referralCode: user.referral_code,
        status: user.status
      }
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    // Validate input
    const { error } = validateLoginInput(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Check if user exists
    const user = await userModel.findUserByPhone(phone);
    if (!user) {
      return res.status(400).json({ message: 'Invalid phone or password' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid phone or password' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        referralCode: user.referral_code,
        status: user.status
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };