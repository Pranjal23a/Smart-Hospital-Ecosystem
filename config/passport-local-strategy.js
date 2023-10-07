const passport = require("passport");
const Admin = require('../models/admin');
const Staff = require('../models/staff');
const LocalStrategy = require('passport-local').Strategy;

// Authentication using passport
passport.use(new LocalStrategy(
    {
        usernameField: "email",
        passReqToCallback: true
    },
    async function (req, email, password, done) {
        try {
            // Try to find the user in both admin and staff collections
            const adminUser = await Admin.findOne({ email: email });
            const staffUser = await Staff.findOne({ email: email });

            // Check for admin login
            if (adminUser && adminUser.password === password) {
                return done(null, adminUser);
            }

            // Check for staff login
            if (staffUser && staffUser.password === password) {
                return done(null, staffUser);
            }

            // Invalid Username/Password for both admin and staff
            req.flash('error', 'Invalid Username/Password');
            console.log('Invalid Username/Password');
            return done(null, false);
        } catch (err) {
            req.flash('error', err);
            return done(err);
        }
    })
);

// Serialize the user to decide which key is to be kept in cookies.
passport.serializeUser(function (user, done) {
    // console.log(user.userType);
    done(null, user.id);
});

// Deserialize the user from the key in the cookies.
passport.deserializeUser(async function (id, done) {
    try {
        const adminUser = await Admin.findById(id);
        if (adminUser) {
            return done(null, adminUser);
        }
        // } else if (userData.userType == 'staff') {
        const staffUser = await Staff.findById(id);
        if (staffUser) {
            return done(null, staffUser);
        }
        // }

        // User not found for the given userType
        console.log('Error in finding user ------> passport');
        return done(null, false);
    } catch (err) {
        console.log('Error in finding user --> passport', err);
        return done(err);
    }
});

// check if the user is authenticated
passport.checkAuthentication = function (req, res, next) {
    // If user signed in then pass the command to next() which is controllers
    if (req.isAuthenticated()) {
        return next();
    }
    // if user not signed in
    return res.redirect('/');
}

passport.setAuthenticatedUser = function (req, res, next) {
    if (req.isAuthenticated()) {
        // req.user contains the current signed-in user from the session cookie
        res.locals.user = req.user;
    }
    next();
}

module.exports = passport;
