const controller = {};
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const User = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/hash');
const jwt = require('jsonwebtoken');
const { addToBlacklist } = require("../utils/tokenBlackList")

controller.register = async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    //Kiem tra du lieu dau vao
    if (!username || !password || !confirmPassword) {
        throw new ApiError(400, "All fields are required");
    }

    //Kiem tra chieu dai password toi thieu 6 ky tu
    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
    }

    //Kiem tra xac nhan mat khau = mat khau
    if (password != confirmPassword) {
        throw new ApiError(400, "Passwords do not match");
    }

    const existingUser = await User.findByUsername(username);
    if (existingUser) {
        throw new ApiError(409, "Username already exists");
    }

    const hashed = await hashPassword(password);
    const id = await User.create(username, hashed);

    const userResponse = { id, username }


    return res
        .status(201)
        .json(
            new ApiResponse(201, userResponse, "User registered successfully")
        );
};

controller.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByUsername(username)
    if (!user) {
        throw new ApiError(400, "Invalid credentials");
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
        throw new ApiError(401, "Password is not correct");
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
        },
        process.env.JWT_SECRET || "default_secret",
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        }
    );

    const userResponse = { ...user };
    delete userResponse.password;

    return res
        .status(200)
        .json(
            new ApiResponse(200, { ...userResponse, token }, "Login successful")
        );
};

controller.logout = (req, res) => {
    //lay token
    const token = req.token;

    if (token) {
        addToBlacklist(token);
    } else {
        throw new ApiError(400, null, "Missing token");
    }

    res.status(200).json(new ApiResponse(200, null, "Log out successfully"));
};

module.exports = controller;