const createHttpError = require('http-errors');
const JWTHelper = require('../Helper/JWTHelper');
const User = require('../Models/UserModel');

const Auth = async (request, response, next) => {
    try {
        const getToken = request.header('Authorization');
        if (!getToken) {
            next(createHttpError(400, 'Token Bilgisi Yok!'));
        }
        const token = getToken.replace('Bearer ', '');
        const result = await JWTHelper.JWTDecode(token);
        if (!result) {
            next(createHttpError(403, "Token Süresi Dolmuş!"));
        }
        const user = await User.findById({ _id: result.user._id });
        if (user) {
            request.user = user;
        } else {
            next(createHttpError(403, 'Kullanıcı Bulunamadı.'));
        }
        next();
        if (!result) {
        }
    } catch (error) {
        next(error);
    }
};

module.exports = Auth;