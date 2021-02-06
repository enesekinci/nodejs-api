
const LogMiddleware = (error, request, response, next) => {
    response.status(error.statusCode || 500);
    if (error.code === 11000) {

        response.json({
            statusCode: 400,
            message: Object.values(error.keyValue) + ' Daha Önce kullanılmış',
        });
    }
    if (error.code === 66) {
        response.json({
            statusCode: 400,
            message: 'Id Alanına Müdahale Edilemez'
        });
    }
    response.json({
        statusCode: error.statusCode || 400,
        message: error.message,
    });

}

module.exports = LogMiddleware;