const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator")
const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      error: null
    })
}

/* ***************************
 *  Build detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getVehicleById(inv_id)

  if (!data || data.length === 0) {
    let nav = await utilities.getNav()
    return res.status(404).render("errors/404", {
      title: "Vehicle Not Found",
      nav,
      message: "Sorry, we couldn't find that vehicle."
    })
  }

  const item = data
  const accountData = res.locals.accountData || null
  const detail = await utilities.buildDetailHTML(item, accountData)
  let nav = await utilities.getNav()

  res.render("./inventory/detail", {
    title: `${item.inv_make} ${item.inv_model}`,
    nav,
    detail,
    error: null
  })
}

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      classificationSelect,
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Build Add Classification View
 **************************************** */
invCont.buildAddClassificationView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    classification_name: ""
  })
}

/* ****************************************
 * Process Add Classification
 **************************************** */
invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  // Server-side validation: letters/numbers only, no spaces/special chars
  const pattern = /^[A-Za-z0-9]+$/
  if (!pattern.test(classification_name)) {
    req.flash("notice", "Invalid classification name. No spaces or special characters allowed.")
    return res.render("./inventory/add-classification", { title: "Add Classification", nav, errors: null, classification_name })
  }

  try {
    const regResult = await invModel.addClassification(classification_name)
    if (regResult) {
      req.flash("notice", `Classification "${classification_name}" added successfully!`)
      return res.redirect("/inv/")
    }
  } catch (error) {
    console.error(error)
    req.flash("notice", "There was an error adding the classification.")
    return res.render("./inventory/add-classification", { title: "Add Classification", nav, messages: req.flash, errors: null })
  }
}

/* ****************************************
 * Build Add Inventory View
 **************************************** */
invCont.buildAddInventoryView = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: null,
    // Stickiness defaults
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_price: "",
    classification_id: "",
    inv_miles: "",
    inv_description: "",
    inv_image: "/images/no-image.png",
    inv_thumbnail: "/images/no-image.png"
  })
}

/* ****************************************
 * Process Add Inventory
 **************************************** */
invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(req.body.classification_id)

  const { inv_make, inv_model, inv_year, inv_price, classification_id, inv_miles, inv_description, inv_image, inv_thumbnail, inv_color } = req.body

  // Basic server-side validation
  if (!inv_make || !inv_model || !inv_year || !inv_price || !classification_id) {
    req.flash("notice", "Please complete all required fields.")
    return res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      ...req.body // keeps sticky inputs
    })
  }

  try {
    const result = await invModel.addInventory({
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      classification_id,
      inv_miles,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_color
    })

    if (result) {
      req.flash("notice", `Vehicle "${inv_make} ${inv_model}" added successfully!`)
      return res.redirect("/inv/")
    }
  } catch (error) {
    console.error(error)
    req.flash("notice", "There was an error adding the vehicle.")
    return res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      ...req.body
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Delete inventory view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    classificationList: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const { inv_id } = req.body
  try {
    await invModel.deleteInventoryItem(inv_id)
    req.flash("notice", "Vehicle was successfully deleted.")
    res.redirect("/inv/")
  } catch (error) {
    console.error("Delete Inventory Error: " + error)
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect("/inv/")
  }
}


module.exports = invCont