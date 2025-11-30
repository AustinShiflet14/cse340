const accountModel = require("../models/account-model")
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.registrationRules = () => {
    return [
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."),
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."),
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists){
                    throw new Error("Email exists. Please log in or use a different email")
                }
            }),
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ]
}

/* ******************************
 * Check Registration Data
 ****************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        return res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
    }
    next()
}

/* ******************************
* Login Validation Rules
****************************** */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid email"),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
  ]
}

/* ******************************
* Check Login Data
****************************** */
validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email: req.body.account_email
    })
  }
  next()
}

/* ******************************
* Update Account Validation Rules
****************************** */
validate.updateRules = () => {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("First name is required"),
    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Last name is required"),
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required")
      .custom(async (account_email, { req }) => {
        const account_id = req.body.account_id;
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          const accountData = await accountModel.getAccountById(account_id);
          if (accountData.account_email !== account_email) {
            throw new Error("Email exists. Please use a different email.");
          }
        }
      })
  ];
};


/* ******************************
* Check Update Account Data
****************************** */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const accountData = req.body
    return res.render("account/update", {
      errors,
      title: "Update Account",
      nav,
      accountData
    })
  }
  next()
}

/* ******************************
* Update Password Validation Rules
****************************** */
validate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .isLength({ min: 12 })
      .withMessage("Password must be at least 12 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[\W]/)
      .withMessage("Password must contain at least one symbol")
  ]
}

module.exports = validate
