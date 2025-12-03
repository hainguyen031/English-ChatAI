const History = require('../models/history.model');
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const controller = {};

controller.create = async (req, res) => {
    const id = await History.create(req.user.id);
    const historyReponse = { id, user_id: req.user.id }
    res
        .status(201)
        .json(new ApiResponse(201, historyReponse, "History created"));
}

controller.getAll = async (req, res) => {
    const histories = await History.findByUser(req.user.id);
    res
        .status(200)
        .json(
            new ApiResponse(200, histories, "Find history list successfully")
        );
}


module.exports = controller;
