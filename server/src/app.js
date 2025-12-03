const express = require("express");
app = express();
const cors = require("cors");
const morgan = require("morgan");

//cau hinh CORS cho phep client tu cac nguon khac truy cap API
app.use(cors());

//cau hinh morgan de ghi lai log cho cac HTTP request
app.use(morgan('dev'));

//cau hinh de express co the doc thong tin gui qua body cua request
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//routes
app.use("/api/v1", require('./routers'))

//xu ly loi tap trung
//loi request not found 404
app.use((req, res, next) => {
    const error = new Error("Request Not Found");
    error.statusCode = 404;
    next(error);
});

//xu ly tat ca cac loi con lai
app.use(require("./middlewares/errorHandler"));

module.exports = app;