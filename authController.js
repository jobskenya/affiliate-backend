const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const userModel = require('./userModel');
const balanceModel = require('./balanceModel');
const jwtConfig = require('./jwtConfig');

// Enhanced registration with proper error handling
const register = async (req, res) => {
  try {
    const { name, phone, gender, password, referralCode } = req.body;

    // Input validation
    if (!name || !phone || !gender || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Kenyan phone validation
    if (!/^(\+?254|0)[17]\d{8}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Kenyan phone number format'
      });
    }

    // Standardize phone format (convert to 254)
    const formattedPhone = phone.startsWith('0') ? `254${phone.substring(1)}` : phone;

    // Check existing user
    const existingUser = await userModel.findUserByPhone(formattedPhone);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Phone number already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await userModel.createUser({
      name,
      phone: formattedPhone,
      gender,
      passwordHash,
      referralCode: referralCode || uuidv4().substring(0, 8).toUpperCase(),
      status: 'inactive' // Requires activation
    });

    // Create initial balance
    await balanceModel.createBalance(user.id);

    // Generate token (with user status)
    const token = jwt.sign(
      { 
        id: user.id,
        status: user.status 
      }, 
      jwtConfig.secret, 
      { expiresIn: jwtConfig.expiresIn }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        status: user.status
      },
      nextStep: 'activation' // Frontend should redirect to activation
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Enhanced login with status checking
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Basic validation
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone and password are required'
      });
    }

    // Format phone
    const formattedPhone = phone.startsWith('0') ? `254${phone.substring(1)}` : phone;

    // Find user
    const user = await userModel.findUserByPhone(formattedPhone);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check activation status
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account requires activation',
        requiresActivation: true
      });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user.id,
        status: user.status 
      }, 
      jwtConfig.secret, 
      { expiresIn: jwtConfig.expiresIn }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

module.exports = { register, login };
