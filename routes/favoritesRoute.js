const express = require("express");
const router = new express.Router();
const favoritesController = require("../controllers/favoritesController");
const utilities = require("../utilities/");

// Favorites page
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(favoritesController.buildFavoritesView)
);

// Add favorite
router.post(
  "/add",
  utilities.checkLogin,
  utilities.handleErrors(favoritesController.addFavorite)
);

// Remove favorite
router.post(
  "/remove",
  utilities.checkLogin,
  utilities.handleErrors(favoritesController.removeFavorite)
);

// Check favorite status
router.get(
  "/check/:inv_id",
  utilities.checkLogin,
  utilities.handleErrors(favoritesController.checkFavorite)
);

module.exports = router;
