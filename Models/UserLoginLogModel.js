const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('@hapi/joi');

const UserLoginLogScheme = new Schema({
    userId: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    logs: {
        type: Array,
    },
}, { collection: 'userloginlogs', timestamps: true });

const schema = Joi.object({
    userId: Joi.string().min(3).trim().required(),
    logs: Joi.object().required(),
});

UserLoginLogScheme.methods.toJSON = function () {
    const UserLoginLogs = this.toObject();
    // delete user._id;
    // delete user.createdAt;
    // delete user.updatedAt;
    delete UserLoginLogs.__v;

    return UserLoginLogs;
};

UserLoginLogScheme.methods.validation = (UserLoginLogs) => {
    return schema.validate(UserLoginLogs);
};

UserLoginLogScheme.methods.setLoginLogs = function (log = {}) {
    if (this.logs.length == 20) {
        this.logs.shift();
    }
    this.logs.push(log);
};

UserLoginLogScheme.methods.checkMacAdress = function (macAdress) {
    for (let i = 0; i < this.logs.length; i++) {
        if (this.logs[i].macAdress == macAdress) {
            return true;
        }
    }
    return false;
};

UserLoginLogScheme.statics.findOrCreate = async (data = {}) => {
    // let userloginlogs = await UserLoginLogs.findOne(data);
    // if (userloginlogs == null) {
    //     userloginlogs = new UserLoginLogs(data);
    // }
    // return userloginlogs;
    return await UserLoginLogs.findOne(data) || new UserLoginLogs(data);
};

const UserLoginLogs = mongoose.model('UserLoginLogs', UserLoginLogScheme);



module.exports = UserLoginLogs;