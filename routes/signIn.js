var express = require('express');
var router = express.Router();
var databases = require('../public/javascripts/mssql');
const check = require('express-validator/check')
var url = require('url');
var bcrypt = require('bcryptjs');


addNewUser = function (user, f) {
    var query = "INSERT INTO [dbo].[users]([userName],[userFirstName],[userLastName],[email],[password]) VALUES('" + user.userName + "', '" + user.userFirstName + "', '" + user.userLastName + "', '" + user.email + "', '" + user.password + "')";
    databases.sendRequestToApplicationDB(query, function (err, result) {
        if (err) {
            console.log(err);
            f = err;
        }
    });

};

findUserByEmail = function (email,callback) {

    var query = "SELECT * FROM [dbo].[users]WHERE [email] = '" + email + "'";

    return databases.sendRequestToApplicationDB(query, function (err,results) {
        return results[0];
    }).catch(function(err) {
        console.log("Error verifying email...");
        console.log(err);
        return err;
        throw err;
    });
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
    req.check('email','This email is already in use.').custom(function (value) {
        // var user =  findUserByEmail(value,function(err){
        //     console.log('IMMM HEEREREEE!!!!');
        //     var query = "SELECT * FROM [dbo].[users]WHERE [email] = '" + email + "'";
        //
        //     return databases.sendRequestToApplicationDB(query, function (results) {
        //         return results[0];
        //     }).catch(function(err) {
        //         console.log("Error verifying email...");
        //         console.log(err);
        //         throw err;
        //     });});

       return findUserByEmail(value, function (err) {
            if (err) {
                console.log(err);
                return true;
            }
        });


        // if(user) {
        //     throw new Error('this email already in use');
        //     return user;
        // }else{
        //     return true;
        // }

           // return findUserByEmail(value).then(function(user){
           //     if(user){}
           //     throw new Error('this email already in use');
           // });
    });
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
    res.redirect(url.format({pathname: '/', query: {'success': req.session.success, 'resource': 'signIn'}}));
});

router.get('/signIn', function (req, res) {
    res.render('signIn', {
        success: req.session.success,
        errors: req.session.errors
    });
});

module.exports = router;