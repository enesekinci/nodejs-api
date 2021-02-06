const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('@hapi/joi');
const { passwordCheck } = require('../Helper/UserHelper');
const createHttpError = require('http-errors');
const { AUTHTIME } = require('../App/GlobalConstant');
const JWTHelper = require('../Helper/JWTHelper');

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
    },
    userType: {
        type: Object,
        default: 1,
    },
    status: {
        type: Number,
        required: true,
        default: 1,
    },
}, { collection: 'users', timestamps: true });

const schema = Joi.object({
    name: Joi.string().min(3).max(50).trim(),
    userName: Joi.string().min(3).max(50).trim(),
    email: Joi.string().trim().email(),
    password: Joi.string().trim().min(6),
    userType: Joi.object(),
});

UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    // delete user._id;
    delete user.createdAt;
    delete user.updatedAt;
    delete user.__v;
    delete user._id;
    delete user.password;

    return user;
};

UserSchema.methods.generateToken = async function () {
    const user = this.toObject();
    return await JWTHelper.JWTToken({
        name: user.name,
        userName: user.userName,
        email: user.email,
    }, AUTHTIME);
};

UserSchema.methods.validation = (user) => {
    schema.required();
    return schema.validate(user);
};

UserSchema.statics.updateValidation = (user) => {
    return schema.validate(user);
};

UserSchema.statics.login = async (email, password) => {

    const { error } = schema.validate({ email: email, password: password })
    if (error) {
        throw createHttpError(400, error);
    }
    const user = await User.findOne({ email: email });
    if (user) {
        const result = await passwordCheck(password, user.password);
        if (result) {
            if (user.status != 1) {
                throw createHttpError(403, 'Hesabınız Aktif Değil');
            } else {
                return user;
            }
        }
        throw createHttpError(400, 'Email veya Şifre Yanlış');
    }
    throw createHttpError(400, 'Email veya Şifre Yanlış');
};


const User = mongoose.model('User', UserSchema);


module.exports = User;