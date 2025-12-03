const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || err.status || 500;

    //chuan bi response loi
    const errorResponse = {
        statusCode: statusCode,
        data: err.data || null,
        message: err.message || "An unexpected error occurred",
        errors: err.errors || [],
        stack: process.env.NODE_ENV === "development" ? err.stack : "",
    }

    //Log loi ra console o phai server
    console.log(err);

    //Gui response loi ve cho client
    res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;