const register = async (req, res) => {
  try {
    const { phone } = req.body;
    const formattedPhone = phone.startsWith('0') ? `254${phone.substring(1)}` : phone;

    // Check duplicate user
    const userExists = await db.query(
      'SELECT id FROM users WHERE phone = $1', 
      [formattedPhone]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Phone already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create user
    const newUser = await db.query(
      `INSERT INTO users (name, phone, password_hash, gender) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, phone, status`,
      [req.body.name, formattedPhone, hashedPassword, req.body.gender]
    );

    // Create balance record
    await db.query(
      'INSERT INTO balances (user_id) VALUES ($1)',
      [newUser.rows[0].id]
    );

    // Generate token
    const token = jwt.sign(
      { id: newUser.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: newUser.rows[0],
      nextStep: 'activation'
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: "Server error" });
  }
};
