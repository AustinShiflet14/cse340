// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
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

module.exports = router;
