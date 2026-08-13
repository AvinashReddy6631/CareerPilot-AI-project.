const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Resend } = require("resend");

const generateToken = require(
  "../utils/generateToken"
);

const RESET_TOKEN_TTL_MS = 20 * 60 * 1000;
const RESET_REQUEST_MESSAGE =
  "If an account exists for this email, a password reset link has been sent.";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const getResetEmailConfig = () => {
  const {
    RESEND_API_KEY,
    RESEND_FROM_EMAIL,
    FRONTEND_URL,
  } = process.env;

  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL || !FRONTEND_URL) {
    return null;
  }

  try {
    return {
      resend: new Resend(RESEND_API_KEY),
      from: RESEND_FROM_EMAIL,
      frontendUrl: new URL(FRONTEND_URL),
    };
  } catch {
    return null;
  }
};

const sendResetEmail = async (user, rawToken, config) => {
  const resetUrl = new URL("/reset-password", config.frontendUrl);
  resetUrl.searchParams.set("token", rawToken);

  const { error } = await config.resend.emails.send({
    from: config.from,
    to: [user.email],
    subject: "Reset your CareerPilot password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
        <h1 style="margin-bottom: 8px;">CareerPilot</h1>
        <h2 style="margin-top: 0;">Reset your password</h2>
        <p>We received a request to reset your CareerPilot password.</p>
        <p style="margin: 28px 0;">
          <a href="${resetUrl.toString()}" style="display: inline-block; background: #4f46e5; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset your password</a>
        </p>
        <p>This link expires in 20 minutes and can be used once.</p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) throw new Error(error.message || "Resend delivery failed");
};

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
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "All fields required",
      });
    }

    const exists =
      await User.findOne({
        email,
      });

    if (exists) {
      return res.status(400).json({
        message:
          "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name,
        email,
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
      message:
        error.message,
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

    const user =
      await User.findOne({
        email,
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
      res.status(401).json({
        message:
          "Invalid Credentials",
      });
    }
  } catch (error) {
    res.status(500).json({
      message:
        error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  const email = typeof req.body?.email === "string"
    ? req.body.email.trim()
    : "";

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      message: "Enter a valid email address.",
    });
  }

  const emailConfig = getResetEmailConfig();
  if (!emailConfig) {
    console.error("Password reset email configuration is incomplete.");
    return res.status(503).json({
      message: "Password reset is temporarily unavailable. Please try again later.",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: RESET_REQUEST_MESSAGE,
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpiresAt = expiresAt;
    await user.save();

    try {
      await sendResetEmail(user, rawToken, emailConfig);
    } catch (error) {
      await User.updateOne(
        { _id: user._id, resetPasswordTokenHash: tokenHash },
        {
          $set: {
            resetPasswordTokenHash: null,
            resetPasswordExpiresAt: null,
          },
        }
      );
      console.error("Password reset email delivery failed:", error.message);
    }

    return res.status(200).json({
      message: RESET_REQUEST_MESSAGE,
    });
  } catch (error) {
    console.error("Password reset request failed:", error.message);
    return res.status(500).json({
      message: "Unable to process your request. Please try again later.",
    });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body || {};

  if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
    return res.status(400).json({
      message: "This password reset link is invalid or has expired.",
    });
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long.",
    });
  }

  try {
    const tokenHash = hashResetToken(token);
    const now = new Date();
    const password = await bcrypt.hash(newPassword, 10);

    const user = await User.findOneAndUpdate(
      {
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: { $gt: now },
      },
      {
        $set: {
          password,
          resetPasswordTokenHash: null,
          resetPasswordExpiresAt: null,
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        message: "This password reset link is invalid or has expired.",
      });
    }

    return res.status(200).json({
      message: "Your password has been reset. You can now sign in.",
    });
  } catch (error) {
    console.error("Password reset failed:", error.message);
    return res.status(500).json({
      message: "Unable to reset your password. Please try again later.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
