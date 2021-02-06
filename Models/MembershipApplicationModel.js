const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('@hapi/joi');
const JWTHelper = require('../Helper/JWTHelper');

const MembershipApplicationSchema = new Schema({

    token: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
    },

}, { collection: 'membership_application', timestamps: true });

const schema = Joi.object({

    token: Joi.string(),
    email: Joi.string().email({ minDomainSegments: 2 }),

});

MembershipApplicationSchema.methods.toJSON = function () {

    const membership_application = this.toObject();
    delete membership_application._id;
    delete membership_application.createdAt;
    delete membership_application.updatedAt;
    delete membership_application.__v;

    return membership_application;

};

MembershipApplicationSchema.methods.generateToken = async function (email) {

    // const membership_application = this.toObject();
    return await JWTHelper.JWTToken(email);

};

MembershipApplicationSchema.methods.validation = (membership_application) => {

    schema.required();
    return schema.validate(membership_application);

};


MembershipApplicationSchema.static.updateValidation = (membership_application) => {

    schema.required();
    return schema.validate(membership_application);

};

MembershipApplicationSchema.statics.findOneOrCreate = function findOneOrCreate(condition, callback) {
    const self = this;
    self.findOne(condition, (err, result) => {
        return result ? callback(err, result) : self.create(condition, (err, result) => { return callback(err, result) });
    });

}

const membership_application = mongoose.model('membership_application', MembershipApplicationSchema);


module.exports = membership_application;