const createHttpError = require('http-errors');
const User = require('../Models/UserModel');
const { passwordHash } = require('../Helper/UserHelper');
const UserHelper = require('../Helper/UserHelper');
const JWTHelper = require('../Helper/JWTHelper');
const UserLoginLogs = require('../Models/UserLoginLogModel');
const getmac = require('getmac');
const date = require('date-and-time');
const { getHtmlTemplate, sendMail } = require('../Helper/MailHelper');
const { MAIL_FROM } = require('../App/Settings');

const users = async (request, response, next) => {
    const users = await User.find({});
    return response.status(200).json({
        statusCode: 200,
        data: { users: users },
    });
};

const getMe = async (request, response, next) => {
    return response.status(200).json({
        statusCode: 200,
        data: { user: request.user },
    });
};

const updateMe = async (request, response, next) => {
    delete request.body.createdAt;
    delete request.body.updatedAt;
    if (request.body.hasOwnProperty('password')) {
        request.body.password = await passwordHash(request.body.password);
    }
    const { error, validateResult } = User.updateValidation(request.body);
    if (error) {
        next(createHttpError(400, error));
    } else {
        try {
            const result = await User.findByIdAndUpdate({ _id: request.user._id }, request.body, { new: true, runValidators: true });
            if (result) {
                return response.status(200).json({
                    statusCode: 200,
                    data: { user: result },
                });
            }
            throw createHttpError(404, 'User is not find.');
        } catch (error) {
            next(createHttpError(400, error));
        }
    }
};

const register = async (request, response, next) => {
    try {
        const user = new User(request.body);
        user.password = await passwordHash(user.password);
        const { error, validateResult } = user.validation(request.body);
        if (error) {
            next(createHttpError(400, error));
        } else {
            const result = await user.save();
            return response.status(200).json({
                statusCode: 200,
                data: { user: result },
            });
        }
    } catch (error) {
        next(createHttpError(500, error));
    }
};

const login = async (request, response, next) => {
    try {
        const user = await User.login(request.body.email, request.body.password);
        const token = await user.generateToken();
        const userloginlogs = await UserLoginLogs.findOrCreate({ userId: (user._id) });
        const now = new Date();
        const date_ob = date.format(now, "YYYY-MM-DD HH:mm:ss");
        const logData = {
            log_at: date_ob,
            macAdress: getmac.default(),
            device: {
                deviceFamily: request.device.parser.useragent.device.family,
                osFamily: request.device.parser.useragent.os.family,
            },
        };
        //Burası patlayacak çünkü kullanıcının mac adresi kontrolünden sonra ekleniyor
        const checkMacAdress = userloginlogs.checkMacAdress(getmac.default());
        userloginlogs.setLoginLogs(logData);
        userloginlogs.save();
        return response.status(200).json({
            statusCode: 200,
            data: { user: user, token: token },
            checkMacAdress: checkMacAdress,
        });
    } catch (error) {
        next(error);
    }
};

const updateUser = async (request, response, next) => {

    const { error, validateResult } = User.updateValidation(request.body);
    if (error) {
        next(createHttpError(400, error));
    } else {
        if (request.body.hasOwnProperty('password')) {
            request.body.password = await passwordHash(request.body.password);
        }
        try {
            const result = await User.findByIdAndUpdate({ _id: request.params.id }, request.body, { new: true, runValidators: true });
            if (result) {
                return response.status(200).json({
                    statusCode: 200,
                    data: { user: result },
                });
            }
            throw createHttpError(404, 'User is not find.');
        } catch (error) {
            next(createHttpError(400, error));
        }
    }
};

const deleteUser = async (request, response, next) => {
    try {
        const result = await User.findByIdAndDelete({ _id: request.params.id });
        if (result) {
            return response.status(200).json({
                statusCode: 200,
                data: { message: 'User was removed' },
            });
        }
        next(createHttpError(404, 'User is not find.'));
    } catch (error) {
        next(createHttpError(400, error));
    }
};

const generateMembershipToken = async (request, response, next) => {
    try {
        const token = await UserHelper.generateMembershipToken(request.body.email);
        sendMail(
            MAIL_FROM,
            request.body.email,
            'Kullanıcı Kayıt Aktivasyon İşlemi',
            getHtmlTemplate('generateMembershipToken'),
            { name: '', token: token, mail_from: MAIL_FROM },
        );
        return response.status(200).json({
            statusCode: 200,
            data: { token: token },
        });
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (request, response, next) => {
    try {
        const user = await User.findOne({ email: request.body.email });
        if (user) {
            const token = await user.generateToken();
            sendMail(
                MAIL_FROM,
                request.body.email,
                'Parola Sıfırlama İşlemi',
                getHtmlTemplate('generateMembershipToken'),
                { name: '', token: token, mail_from: MAIL_FROM },
            );
        } else {
            next(createHttpError(403, 'Kullanıcı Bulunamadı.'));
        }
    } catch (error) {
        next(error);
    }
};

const newPassword = async (request, response, next) => {
    try {
        const token = await JWTHelper.JWTDecode(request.body.token);
        if (token) {
            const user = await User.findOne({ email: request.body.email });
            if (user) {
                const newPassword = await passwordHash(request.body.password);
                await user.update({
                    password: newPassword,
                });
                const token = await user.generateToken();
                const userloginlogs = await UserLoginLogs.findOrCreate({ userId: (user._id) });
                const now = new Date();
                const date_ob = date.format(now, "YYYY-MM-DD HH:mm:ss");
                const logData = {
                    log_at: date_ob,
                    macAdress: getmac.default(),
                    device: {
                        deviceFamily: request.device.parser.useragent.device.family,
                        osFamily: request.device.parser.useragent.os.family,
                    },
                };
                //Burası patlayacak çünkü kullanıcının mac adresi kontrolünden sonra ekleniyor
                const checkMacAdress = userloginlogs.checkMacAdress(getmac.default());
                userloginlogs.setLoginLogs(logData);
                userloginlogs.save();
                return response.status(200).json({
                    statusCode: 200,
                    data: { user: user, token: token },
                    checkMacAdress: checkMacAdress,
                });
            } else {
                next(createHttpError(403, 'Kullanıcı Bulunamadı.'));
            }
        } else {
            next(createHttpError(403, "Token Süresi Dolmuş!"));
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    users,
    register,
    updateMe,
    getMe,
    updateUser,
    deleteUser,
    login,
    forgotPassword,
    newPassword,
};

