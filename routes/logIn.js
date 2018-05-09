var express = require('express');
var router = express.Router();
var databases = require('../public/javascripts/mssql');
var url = require('url');

findUserByEmail = function (email) {
    var query = "SELECT * FROM [dbo].[users]WHERE [email] = '" + email + "'";
    return databases.sendRequestToApplicationDB(query, function (results) {
        if (results.recordset.length > 0) {
            return true;
        }else{
            return false;
        }

    });
}
findUserByPassword = function (credentials) {
    var query = "SELECT * FROM [dbo].[users]WHERE [email] = '" + credentials.email + "' AND [password]='" + credentials.password + "'";
    return databases.sendRequestToApplicationDB(query, function (results) {
        if (results.recordset.length > 0) {
            return true;
        }else{
            return false;
        }

    });
}
router.post('/logIn', function (req, res, next) {

    req.check('logEmail').isEmail().withMessage('It must be an email');
    req.check('logPassword', 'Passwords must be at least 5 chars long').isLength({min: 5})
    req.check('logPassword', 'Passwords must contain at least one number').matches(/\d/);
    req.check('logPassword',"Password doesn't match the email.").custom(function (value) {
     !findUserByPassword({password: value, email: req.body.logEmail});
    });
    req.check('logEmail','There is no account registered with this email.').custom(function (value) {
      !findUserByEmail(value);
    });
    var errors = req.validationErrors();
    if (errors) {

        req.session.errors = errors;
        req.session.success = false;

    } else {

        req.session.success = true;

    }
    res.redirect(url.format({pathname: "/", query: {'success': req.session.success, 'resource': 'logIn'}}));
    console.log(req.session);
});

router.get('/logIn', function (req, res) {
    res.render('logIn', {
        success: req.session.success,
        errors: req.session.errors
    });
});
module.exports = router;