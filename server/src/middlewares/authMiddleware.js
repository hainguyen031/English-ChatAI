const jwt = require("jsonwebtoken");
const ApiError = require("../utils/apiError");
const User = require("../models/user.model");
const { isTokenBlacklist } = require("../utils/tokenBlackList.js");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ApiError(401, "No token provided");
    }

    const token = authHeader.split(" ")[1]; //Bearer TOKEN

    if (!token) {
      throw new ApiError(401, "Missing token");
    }

    //Kiem tra token co trong blacklist
    if (isTokenBlacklist(token)) {
      throw new ApiError(401, "Token has been disabled");
    }

    const decode = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    );
    const user = await User.findById(decode.id);
    if (!user) {
      throw new ApiError(401, "User not found");
    }
    delete user.password;
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      error = new ApiError(401, "Invalid token");
    } else if (error.name === "TokenExpiredError") {
      error = new ApiError(401, "Expired token");
    }
    next(error);
  }
};

module.exports = { authenticateToken };
