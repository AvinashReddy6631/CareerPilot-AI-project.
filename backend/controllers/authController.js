const User = require("../models/User");
const bcrypt = require("bcryptjs");

const generateToken = require(
  "../utils/generateToken"
);

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

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, and password are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const exists =
      await User.findOne({
        email: email.toLowerCase(),
      });

    if (exists) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists with this email",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password:
          hashedPassword,
      });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
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
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message:
        "Registration failed. Please try again.",
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

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user =
      await User.findOne({
        email: email.toLowerCase(),
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
        message: "Login successful",
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
      res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message:
        "Login failed. Please try again.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
