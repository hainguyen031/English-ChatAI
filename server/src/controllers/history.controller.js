const History = require("../models/history.model");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const controller = {};

controller.create = async (req, res) => {
  const id = await History.create(req.user.id);
  const historyReponse = { id, user_id: req.user.id };
  res.status(201).json(new ApiResponse(201, historyReponse, "History created"));
};

controller.getAll = async (req, res) => {
  const histories = await History.findByUser(req.user.id);
  res
    .status(200)
    .json(new ApiResponse(200, histories, "Find history list successfully"));
};

controller.delete = async (req, res) => {
  let { history_id } = req.params;
  let user_id = req.user.id;

  if (!history_id) {
    throw new ApiError(400, "history_id is required");
  }
  if (isNaN(history_id)) {
    throw new ApiError(400, "id must be integer");
  }

  history_id = parseInt(history_id);

  const deleted = await History.deleteIfOwner(history_id, user_id);
  console.log(deleted);
  if (!deleted) {
    throw new ApiError(403, "You are not allowed to delete this history");
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "History deleted successfully"));
};

module.exports = controller;
