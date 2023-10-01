const express = require("express");
const router = express.Router();
const passport = require('passport');

const adminConroller = require('../controllers/admin_controller');
const staffController = require('../controllers/staff_controller');
const inventoryController = require('../controllers/inventory_controller');

router.get('/profile', passport.checkAuthentication, adminConroller.profile);
router.get('/sign-in', adminConroller.signIn);
router.get('/sign-up', adminConroller.signUp);
router.post('/create', adminConroller.create);

router.get('/destroy/:id', passport.checkAuthentication, inventoryController.destroyinventory);

router.get('/search/:name', adminConroller.search);
router.get('/search', adminConroller.Showsearch);

router.get('/profile/selldata', adminConroller.sellData);
// use passport as a middleware to authenticate
router.post('/create-session', passport.authenticate(
    'local',
    { failureRedirect: '/admin/sign-in' },
), adminConroller.createSession);

// admin signup staff
router.get('/staff/sign-up', staffController.signUp);
router.post('/staff/create', staffController.create);


router.get('/sign-out', adminConroller.destroySession);
module.exports = router;