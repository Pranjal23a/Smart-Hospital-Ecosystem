const Staff = require('../models/staff');
const Inventory = require('../models/inventory');
const Patient = require('../models/patient');
const Admin = require('../models/admin');
const moment = require('moment');
const bcrypt = require('bcrypt');
// Staff Profile 
module.exports.update = async function (req, res) {
    const User = await Staff.findOne({ _id: req.user.id });
    let data = await Inventory.find({});
    // Check for admin login
    if (User) {
        return res.render('staff_profile', {
            title: 'Staff Profile',
            user: User,
            data: data
        });
    }
    else {
        return res.redirect('/');
    }
}

//  Patient Data
module.exports.patient = async function (req, res) {
    try {
        // Get today's date
        const today = moment().startOf('day'); // Start of today

        // Find patients created before today and delete them
        await Patient.deleteMany({ createdAt: { $lt: today } });
    } catch (error) {
        console.error('Error removing patients:', error);
    }
    const patient = await Patient.find({}).sort({ createdAt: -1 });
    const User = await Staff.findOne({ _id: req.user.id });
    // Check for admin login
    if (patient && User) {
        return res.render('staff_view_patient', {
            title: 'Staff Profile',
            reports: patient,
        });
    }
    else {
        return res.redirect('/');
    }
}


module.exports.Showsearch = async function (req, res) {
    const User = await Staff.findOne({ _id: req.user.id });
    let data = await Inventory.find({});
    // Check for admin login
    if (User) {
        return res.render('staff_search_inventory', {
            title: 'Staff Profile',
            user: User,
            data: data
        });
    }
    else {
        return res.redirect('/');
    }
}
module.exports.search = async function (req, res) {
    try {
        const searchQuery = req.params.name;
        const searchResults = await Inventory.find({ name: { $regex: searchQuery, $options: 'i' } });

        // In staff_controller.js
        // Send the search results as JSON
        return res.json(searchResults);
    } catch (err) {
        console.error('Error in search:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

// creating a staff
module.exports.create = async function (req, res) {
    if (req.body.password != req.body.confirm_password) {
        req.flash('error', 'Password does not match!!');
        return res.redirect('back');
    }
    try {
        const user = await Staff.findOne({ email: req.body.email });
        if (!user) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            req.body.password = hashedPassword;
            await Staff.create(req.body);
            req.flash('success', 'Staff ID Created Successfully!!');
            return res.redirect("/admin/add-inventory");
        } else {
            req.flash('error', 'Staff Already Exists!!');
            throw new Error("User already exists");
        }
    } catch (err) {
        console.log("Error in signing up:", err);
        return res.redirect("back");
    }
}


// staff signup page
module.exports.signUp = async function (req, res) {
    const User = await Admin.findOne({ _id: req.user.id });
    if (User) {
        let staff = await Staff.find({});
        return res.render('staff_sign_up', {
            title: "Staff SignUp",
            staff: staff,
        })
    }
    else {
        return res.redirect('back');
    }
}

module.exports.destroyStaff = async function (req, res) {
    try {
        const staff = await Staff.findById(req.params.id);
        if (staff) {
            staff.deleteOne();
            req.flash('success', 'Deleted Successfully!!');
            res.redirect('back');
        }
        else {
            req.flash('error', 'No such staff exists!!')
            return res.redirect('back');
        }
    } catch (err) {
        req.flash('error', err)
        return res.redirect('back');
    }
}


// staff update password
module.exports.updatePassword = async function (req, res) {
    try {
        const email = req.body.email; // Assuming you're using body-parser middleware
        const newPassword = req.body.password; // Get the new password from the form

        // Find the user by email
        const user = await Staff.findOne({ email: email });

        if (!user) {
            req.flash('error', 'No Staff Exists!!');
            return res.redirect('back');
        }

        // Update the user's password
        user.password = await bcrypt.hash(newPassword, 10);

        // Save the updated user
        await user.save();

        // Redirect or send a success response
        req.flash('success', 'Password Updated Successfully!!');
        res.redirect('back');

    } catch (error) {
        req.flash('error', 'Some Problem there!!');
        return res.redirect('back');
    }

}


// staff Signin page
module.exports.signIn = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/staff/update');
    }
    return res.render('staff_sign_in', {
        title: "Staff SignIn"
    })
}

// creating session for staff on signin
module.exports.createSession = async function (req, res) {
    req.flash('success', 'You Have SignIn Successfully!!');
    return res.redirect('/staff/update');
}


// staff logout
module.exports.destroySession = async function (req, res) {
    req.logout(function (err) {
        if (err) {
            // Handle any error that occurred during logout
            console.log(err);
            return res.redirect("/"); // or handle the error in an appropriate way
        }
        req.flash('error', 'Logged Out Successfully!!');
        return res.redirect("/");
    });
};