var express = require('express');
var router = express.Router();
var databases = require('../public/javascripts/mssql');
const check = require('express-validator/check')
var url = require('url');
var bcrypt = require('bcryptjs');

var user = null;
addNewUser = function (user, f) {
    var query = "INSERT INTO [dbo].[users]([userName],[userFirstName],[userLastName],[email],[password]) VALUES('" + user.userName + "', '" + user.userFirstName + "', '" + user.userLastName + "', '" + user.email + "', '" + user.password + "')";
    databases.sendRequestToApplicationDB(query, function (err, result) {
        if (err) {
            console.log(err);
            f = err;
        }
    });

};

var findUserByEmail = function (email) {

    var query = "SELECT * FROM [SilesiaMgrDB].[dbo].[users] WHERE [email] = '" + email + "';";
    console.log("Im in Ssssearch");
    return new Promise((resolve, reject)=>{
        databases.sendRequestToApplicationDB(query, function (res, err) {
            console.log("Im in Ssssearch2");
            if (err) return callback(err);
            if (res.recordset.length) {
                user = true;
                resolve(true);
            }else{
                user = null;
                reject(null);
            }
    });

    //
     });
    // callback(null,user);
};


router.post('/signIn', function (req, res, next) {
    const userName = req.body.userName;
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;
    const passwordConfirmation = req.body.passwordConfirmation;
    var newUser = {
        userName: userName,
        userFirstName: firstName,
        userLastName: lastName,
        email: email,
        password: password
    };
    req.check('firstName', 'We need your first name.').notEmpty();
    req.check('lastName', 'We need your last name.').notEmpty();
    req.check('email').isEmail().withMessage('It must be an email.');
    req.check('userName').exists().withMessage('User name is needed!');
    req.check('password', 'passwords must be at least 5 chars long').isLength({min: 5})
    req.check('password', 'passwords must contain at least one number').matches(/\d/);
    req.check('passwordConfirmation', 'passwords must be the same as password confirmation').equals(req.body.password);

    // findUserByEmail(req.body.email,function(err, user) {
    //     if (user == true) {
    //         req.check('email', "Email already exist").equals(null);
    //
    //     }else if(user == null){
    //         req.check('email', "Email already exist").equals(req.body.email);
    //     }
    //     errors = req.validationErrors();
    // });
function sumErrors(){
    var errors = req.validationErrors();
    if (errors) {
        req.session.errors = errors;
        req.session.success = false;
    } else {
        req.session.success = true;


        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function (err, hash) {
                if (err) {
                    console.log(err);
                }
                newUser.password = hash;
                addNewUser(newUser, function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                });
            });
        });

    }
}
    function successCallback(result) {
        console.log("It succeeded with " + result);
        req.check('email', "Email already exist").equals(null);
        sumErrors();
        res.redirect(url.format({pathname: '/', query: {'success': req.session.success, 'resource': 'signIn'}}));
    }

    function failureCallback(error) {
        req.check('email', "Email already exist").equals(req.body.email);
        console.log("It failed with " + error);
        sumErrors()
            res.redirect(url.format({pathname: '/', query: {'success': req.session.success, 'resource': 'signIn'}}));
    }

findUserByEmail(req.body.email).then(successCallback,failureCallback);



});

router.get('/signIn', function (req, res) {
    res.render('signIn', {
        success: req.session.success,
        errors: req.session.errors
    });
});

module.exports = router;