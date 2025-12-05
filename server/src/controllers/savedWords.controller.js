const SavedWord = require("../models/savedWords.model");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

const controller = {};
controller.create = async (req, res) => {
  const { word, meaning } = req.body;
  if (!word || !meaning) {
    throw new ApiError(400, "word and meaning are required");
  }

  const id = await SavedWord.create(req.user.id, word, meaning);
  const wordResponse = {
    id,
    user_id: req.user.id,
    word,
    meaning,
  };

  res.status(201).json(new ApiResponse(201, wordResponse, "Saved word added"));
};

controller.getAll = async (req, res) => {
  const words = await SavedWord.findByUser(req.user.id);
  res
    .status(200)
    .json(new ApiResponse(200, words, "Find save word list successfully"));
};

controller.delete = async (req, res) => {
  let { id } = req.params;
  let user_id = req.user.id;

  if (!id) {
    throw new ApiError(400, "id is required");
  }
  if (isNaN(id)) {
    throw new ApiError(400, "id must be integer");
  }

  id = parseInt(id);

  const deleted = await SavedWord.deleteIfOwner(id, user_id);

  if (!deleted) {
    throw new ApiError(403, "You are not allowed to delete this word");
  }

  res.status(200).json(new ApiResponse(200, null, "Word deleted successfully"));
};

module.exports = controller;
