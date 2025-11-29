// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities/") 
const { body } = require("express-validator")

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

// Route to build management view
router.get("/", invController.buildManagement)

// Add Classification
router.get("/add-classification", invController.buildAddClassificationView)
router.post("/add-classification", invController.addClassification)


// Add Inventory
router.get("/add-inventory", invController.buildAddInventoryView)
router.post("/add-inventory", invController.addInventory)

// Get Inventory JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Edit Inventory Item
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView))
router.post(
  "/update",
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// Delete Inventory Item
router.get("/delete/:inv_id", utilities.handleErrors(invController.deleteInventoryView))
router.post("/delete", utilities.handleErrors(invController.deleteInventory))


module.exports = router;
