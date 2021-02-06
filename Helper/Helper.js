const bcrypt = require('bcrypt');

const passwordHash = async (password) => {
    // const hashedPassword = await bcrypt.hash(password, 10);
    // console.log(hashedPassword);
    // return hashedPassword;
    return await bcrypt.hash(password, 10);
};

const passwordCheck = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
    passwordHash,
    passwordCheck
};