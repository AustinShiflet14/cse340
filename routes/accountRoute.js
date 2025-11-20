// Needed resources
const express = require("express")
const router = express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")

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

module.exports = router
