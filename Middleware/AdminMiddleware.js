
const Admin = (request, response, next) => {
    if (request.user.userType != 0) {

        return response.status(403).json({
            statusCode: 403,
            data: { message: 'Erişim reddedildi.' },
        });
    }
    next();
};

module.exports = Admin;