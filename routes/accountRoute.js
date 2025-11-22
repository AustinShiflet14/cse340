// Needed resources
const express = require("express")
const router = express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

// Route for login view
router.get(
    "/login",
    utilities.handleErrors(accountController.buildLogin)
)

// Route for register view
router.get(
    "/register",
    utilities.handleErrors(accountController.buildRegister)
)

// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)


module.exports = router
