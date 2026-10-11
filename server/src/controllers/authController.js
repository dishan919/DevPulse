import bcrypt from "bcrypt";
import User from "../models/user.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Required fields check
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // 2. Clean the email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Check whether the email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    // 4. Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. Create user in MongoDB
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    // 6. Send safe response
    return res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};