const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

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
  const detail = await utilities.buildDetailHTML(item)
  let nav = await utilities.getNav()

  res.render("./inventory/detail", {
    title: `${item.inv_make} ${item.inv_model}`,
    nav,
    detail
  })
}


module.exports = invCont