// Needed resources
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver register view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
        )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
* Build account management view
* Route: GET /account/
* Shows user account information after login
**************************************** */
async function buildAccountManagement(req, res, next) {
    let nav = await utilities.getNav();
    const accountData = res.locals.accountData;

    res.render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
        accountData,
    });
}

/* ****************************************
* Build update account view
**************************************** */
async function buildUpdateView(req, res, next) {
    const account_id = req.params.account_id;
    const nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(account_id);

    if (!accountData) {
        req.flash("notice", "Account not found.");
        return res.redirect("/account/");
    }

    res.render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        accountData,
    });
}

/* ****************************************
* Account Update
**************************************** */
async function updateAccount(req, res, next) {
    const { account_id, account_firstname, account_lastname, account_email } = req.body;
    
    try {
        const result = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);
        const updatedAccount = await accountModel.getAccountById(account_id);

        if (result) {
            req.flash("notice", "Account updated successfully!");
        } else {
            req.flash("notice", "Account update failed.");
        }

        res.render("account/management", {
            title: "Account Management",
            nav: await utilities.getNav(),
            errors: null,
            accountData: updatedAccount,
        });

    } catch (error) {
        console.error("Error updating account:", error);
        req.flash("notice", "An error occurred. Please try again.");
        const accountData = req.body;
        res.render("account/update", {
            title: "Update Account",
            nav: await utilities.getNav(),
            errors: null,
            accountData
        });
    }
}

/* ****************************************
* Process password update
**************************************** */
async function updatePassword(req, res, next) {
    const { account_id, account_password } = req.body;

    // Check validation errors first
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const accountData = { account_id }; // don't send password back
        return res.render("account/update", {
            title: "Update Account",
            nav: await utilities.getNav(),
            errors,
            accountData
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(account_password, 10);
        const result = await accountModel.updatePassword(account_id, hashedPassword);
        const updatedAccount = await accountModel.getAccountById(account_id);

        if (result) {
            req.flash("notice", "Password updated successfully!");
        } else {
            req.flash("notice", "Password update failed.");
        }

        res.render("account/management", {
            title: "Account Management",
            nav: await utilities.getNav(),
            errors: null,
            accountData: updatedAccount,
        });
    } catch (error) {
        console.error("Error updating password:", error);
        req.flash("notice", "An error occurred. Please try again.");
        const accountData = { account_id };
        res.render("account/update", {
            title: "Update Account",
            nav: await utilities.getNav(),
            errors: null,
            accountData
        });
    }
}

/* ****************************************
* Logout
**************************************** */
async function logoutAccount(req, res, next) {
    try {
        // Clear cache
        res.clearCookie("jwt");

        req.flash("notice", "You have been logged out successfully.");

        res.redirect("/");
    } catch (error) {
        console.error("Logout error:", error);
        req.flash("notice", "There was a problem logging out. Please try again.");
        res.redirect("/");
    }
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildUpdateView, updateAccount, updatePassword, logoutAccount }