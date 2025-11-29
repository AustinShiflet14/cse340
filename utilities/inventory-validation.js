const { body, validationResult } = require("express-validator")
const utilities = require(".") // may need "../utilities" depending on your file tree

/* ************************************************
*  Validation Rules (used for add + update)
************************************************ */
const newInventoryRules = () => {
  return [
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year").isInt({ min: 1900, max: 2035 }).withMessage("Enter a valid year."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a number."),
    body("classification_id").isInt().withMessage("Choose a classification."),
    body("inv_color").trim().notEmpty().withMessage("Color is required.")
  ]
}

/* ************************************************
*  ADD INVENTORY VALIDATION ERROR RETURN
************************************************ */
const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      errors,
      ...req.body
    })
  }
  next()
}

/* ************************************************
*  UPDATE INVENTORY VALIDATION ERROR RETURN
************************************************ */
const checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  const { inv_id, inv_make, inv_model } = req.body

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()

    return res.render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      errors,
      ...req.body,
      inv_id 
    })
  }
  next()
}

module.exports = { newInventoryRules, checkInventoryData, checkUpdateData }
