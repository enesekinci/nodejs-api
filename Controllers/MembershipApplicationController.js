const MembershipApplication = require('../Models/MembershipApplicationModel');
const emailValidator = require('email-validator');
const createHttpError = require("http-errors");
const User = require("../Models/UserModel");
const JWTHelper = require("../Helper/JWTHelper");
require('../Helper/ResponseHelper');
const { getHtmlTemplate, sendMail } = require('../Helper/MailHelper');
const { MAIL_FROM } = require('../App/Settings');

const generateToken = async (request, response, next) => {
    try {
        if (emailValidator.validate(request.body.email)) {

            await User.findOne({ email: request.body.email }, function (error, user) {
                //YUSUFLA BAKILACAK
                if (user) {

                    next(createHttpError(400, "E-posta kullanılıyor."));
                }
                else if (error) {

                    next(createHttpError(500, "İşlem yapılamıyor."));
                }
            });

            await MembershipApplication.findOneAndDelete({ email: request.body.email });

            const newToken = new MembershipApplication({

                email: request.body.email,
                token: await JWTHelper.JWTToken({ email: request.body.email }),
            });

            const { error } = newToken.validation({

                email: newToken.email,
                token: newToken.token,
            });
            if (error) {

                next(createHttpError(400, error));
            } else {

                const result = await newToken.save();

                if (result) {

                    sendMail(
                        MAIL_FROM,
                        request.body.email,
                        'Kullanıcı Kayıt Aktivasyon İşlemi',
                        getHtmlTemplate('generateMembershipToken'),
                        { name: '', token: newToken.token, mail_from: MAIL_FROM },
                    );

                    return response.status(200).json({
                        statusCode: 200,
                        data: newToken,
                    });
                } else {
                    next(createHttpError(500, "İşlem yapılamıyor."));
                }
            }
        } else {
            next(createHttpError(400, "E-posta adresi hatalı."));
        }
    } catch (error) {
        next(createHttpError(500, error));
    }
};

const checkMembershipToken = async (request, response, next) => {
    try {
        const token = await JWTHelper.JWTDecode(request.body.token);

        if (token) {

            const user = await MembershipApplication.findOne({ token: request.body.token });

            if (user) {

                // dogru oldugu için kullanıcı artık oluşturulmuş olmalı -- olamaz required alanlar var.

                return response.status(200).json({
                    statusCode: 200,
                    data: { email: user.email },
                });

            } else {
                next(createHttpError(400, "E-posta adresi kayıt listesinde mevcut değil."));
            }
        } else {

            await User.findOneAndDelete({
                token: request.body.token,
            });

            next(createHttpError(403, "Token Süresi Dolmuş!"));
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateToken,
    checkMembershipToken,
};
