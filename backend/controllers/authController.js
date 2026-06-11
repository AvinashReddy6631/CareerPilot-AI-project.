const User = require("../models/User");
const bcrypt = require("bcryptjs");

const generateToken = require(
  "../utils/generateToken"
);

const {
  validateRegistration,
  validateLogin,
} = require("../utils/validators");

const registerUser = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    // Validate input
    const validation =
      validateRegistration({
        name,
        email,
        password,
      });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Check if user exists
    const exists =
      await User.findOne({
        email: email.toLowerCase(),
      });

    if (exists) {
      return res.status(400).json({
        success: false,
        message:
          "Email already registered",
      });
    }

    // Hash password with 12 salt rounds (increased from 10)
    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    const user =
      await User.create({
        name: name.trim(),
        email:
          email.toLowerCase().trim(),
        password:
          hashedPassword,
      });

    res.status(201).json({
      success: true,

      token:
        generateToken(
          user._id
        ),

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Registration failed",
    });
  }
};

const loginUser = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // Validate input
    const validation =
      validateLogin({
        email,
        password,
      });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const user =
      await User.findOne({
        email:
          email.toLowerCase(),
      });

    if (
      user &&
      (await bcrypt.compare(
        password,
        user.password
      ))
    ) {
      res.json({
        success: true,

        token:
          generateToken(
            user._id
          ),

        user: {
          id: user._id,
          name: user.name,
          email:
            user.email,
        },
      });
    } else {
      // Don't reveal if email exists
      res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Login failed",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
