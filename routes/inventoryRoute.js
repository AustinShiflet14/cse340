// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities/") 
const { body } = require("express-validator")

// Public Routes (no login needed)
// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build inventory detail view
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildDetailView)
);

// Route to build management view (admin only)
router.get(
  "/",
  utilities.checkJWTToken,
  utilities.checkInventoryAccess,
  invController.buildManagement
)

// Add Classification (admin only)
router.get(
  "/add-classification",
  utilities.checkJWTToken,
  utilities.checkInventoryAccess,
  invController.buildAddClassificationView
)
router.post(
  "/add-classification",
  utilities.checkJWTToken,
  utilities.checkInventoryAccess,
  invController.addClassification
)

// Add Inventory (admin only)
router.get(
  "/add-inventory",
  utilities.checkJWTToken,
  utilities.checkInventoryAccess,
  invController.buildAddInventoryView
)
router.post(
  "/add-inventory",
  utilities.checkJWTToken,
  utilities.checkInventoryAccess,
  invController.addInventory
)

// Get Inventory JSON (public)
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

// Edit Inventory Item (admin only)
router.get(
  "/edit/:inv_id",
  utilities.checkJWTToken,
  utilities.checkInventoryAccess,
  utilities.handleErrors(invController.editInventoryView)
)
router.post(
  "/update",
  utilities.checkJWTToken,
  utilities.checkInventoryAccess,
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// Delete Inventory Item (admin only)
router.get(
  "/delete/:inv_id",
  utilities.checkJWTToken,
  utilities.checkInventoryAccess,
  utilities.handleErrors(invController.deleteInventoryView)
)
router.post(
  "/delete",
  utilities.checkJWTToken,
  utilities.checkInventoryAccess,
  utilities.handleErrors(invController.deleteInventory)
)

module.exports = router;
