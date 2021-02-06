const router = require('express').Router();
const MembershipApplicationController = require('../Controllers/MembershipApplicationController');

router.post('/generate-membership-token', MembershipApplicationController.generateToken);
router.post('/check-membership-token', MembershipApplicationController.checkMembershipToken);

module.exports = router;