var express = require('express');
var router = express.Router();
var databases = require('../public/javascripts/mssql');
var url = require('url');
var bcrypt = require('bcryptjs');

findUserByEmail = function (email, callback) {
    var query = "SELECT * FROM [dbo].[users]WHERE [email] = '" + email + "'";
    databases.sendRequestToApplicationDB(query, function (res, err) {
        if (err) return callback(err);
        if (res.recordset.length > 0) {
            return callback(null, true);
        } else {
            return callback(null, null);
        }

    });
}
checkUserWithPassword = function (credentials, callback) {

    var query = "SELECT * FROM [dbo].[users]WHERE [email] = '" + credentials.email + "'";
    databases.sendRequestToApplicationDB(query, function (res, err) {
        if (err) return callback(err);
        if (res.recordset.length > 0) {
            if(bcrypt.compareSync(credentials.password, res.recordset[0].password)){
                var user={ Name:res.recordset[0].userFirstName,
                    Email: res.recordset[0].email}
                return callback(null, user);
            }else {
                return callback(null, null);
            }

        } else {
            return callback(null, null);
        }

    });
}

router.post('/logIn', function (req, res, next) {

    req.check('logEmail').isEmail().withMessage('It must be an email');
    req.check('logPassword', 'Passwords must be at least 5 chars long').isLength({min: 5})
    req.check('logPassword', 'Passwords must contain at least one number').matches(/\d/);
    // req.check('logPassword',"Password doesn't match the email.").custom(function (value) {
    //  !findUserByPassword({password: value, email: req.body.logEmail});
    // });
    function checkSession(user) {
        var errors = req.validationErrors();
        if (errors) {

            req.session.errors = errors;
            req.session.success = false;

        } else {

            req.session.success = true;
           req.session.user= user;

        }
    }

    function checkCredentials() {
        return new Promise((resolve, reject)=>{
  findUserByEmail(req.body.logEmail, function (err, user) {
            if (user == true) {
                req.check('logEmail', "There is no account registered with this email.").equals(req.body.logEmail);
            } else if (user == null) {
                req.check('logEmail', "There is no account registered with this email.").equals(null);
            }
        });
        checkUserWithPassword({
            email: req.body.logEmail,
            password: req.body.logPassword
        }, function (err, userFound) {
            if (userFound) {
                req.check('logPassword', "Password doesn't match the email..").equals(req.body.logPassword);
                    resolve(userFound);
            } else if (userFound == null) {
                req.check('logPassword', "Password doesn't match the email.").equals(null);
                reject(false);
            }
        });

        });
    }
    function successCallback(userFound) {
        checkSession(userFound);
        res.cookie('userCookie',userFound);
        res.redirect(url.format({pathname: "/", query: {'success': req.session.success, 'resource': 'logIn'}}));
    }

    function failureCallback() {
        checkSession();
        res.redirect(url.format({pathname: "/", query: {'success': req.session.success, 'resource': 'logIn'}}));
    }

    checkCredentials().then(successCallback, failureCallback);

});

router.get('/logIn', function (req, res) {
    res.render('logIn', {
        success: req.session.success,
        errors: req.session.errors
    });
});
module.exports = router;