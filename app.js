const express = require('express');
require('./Database/Database');
require('./App/GlobalConstant');
const app = express();
const port = 3000;
const UserRouter = require('./Router/UserRouter');
const MemberShipApplicationRouter = require('./Router/MembershipApplicationRouter');
const LogMiddleware = require('./Middleware/LogMiddleware');
const device = require('express-device');
const getmac = require('getmac');
const { getHtmlTemplate, sendMail } = require('./Helper/MailHelper');
const { MAIL_FROM } = require('./App/Settings');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(port, () => console.log(`Example app listening on port! port => ` + port));
device.enableViewRouting(app, { "noPartials": true });
app.use(device.capture({ parseUserAgent: true }));
app.use(LogMiddleware);
//Routes
app.use('/api/users', UserRouter);
app.use('/api/membership-application', MemberShipApplicationRouter);

app.get('/', (request, response) => response.status(200).json({
    statusCode: 200,
    message: 'Hello World!',
    device: {
        deviceFamily: request.device.parser.useragent.device.family,
        osFamily: request.device.parser.useragent.os.family,
    },
}));

const macAdress = getmac.default();
console.log(macAdress);
console.log(getmac.isMAC(macAdress));

// sendMail(
//     MAIL_FROM,
//     'yusufdede95@hotmail.com',
//     'Kullanıcı Kayıt Aktivasyon İşlemi',
//     getHtmlTemplate('generateMembershipToken'),
//     { name: 'ENES EKİNCİ', token: 'sladlksaldk2399283ewladks', mail_from: MAIL_FROM },
// );
// console.log("ok");
