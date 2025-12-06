const favoritesModel = require("../models/favorites-model");
const utilities = require("../utilities/");

const favoritesController = {};

/* *******************************
 * Favorites Page
 ******************************** */
favoritesController.buildFavoritesView = async function (req, res) {
    const nav = await utilities.getNav(req, res);

    // If NOT logged in → show page but with a message
    if (!res.locals.loggedin) {
        return res.render("favorites/favorites", {
            title: "Your Favorites",
            nav,
            favorites: [], 
            errors: null,
            message: "Please log in to view your favorites."
        });
    }

    // Logged in → show real favorites
    const account_id = res.locals.accountData.account_id;
    const favorites = await favoritesModel.getFavoritesByAccount(account_id);

    res.render("inventory/favorites", {
        title: "Your Favorites",
        nav,
        favorites,
        errors: null,
        message: null
    });
};

/* *******************************
 * Add Favorite
 ******************************** */
favoritesController.addFavorite = async function (req, res) {
    const account_id = res.locals.accountData.account_id;
    const inv_id = parseInt(req.body.inv_id);

    await favoritesModel.addFavorite(account_id, inv_id);

    res.json({ status: "added" });
};

/* *******************************
 * Remove Favorite
 ******************************** */
favoritesController.removeFavorite = async function (req, res) {
  const account_id = res.locals.accountData.account_id;
  const inv_id = parseInt(req.body.inv_id);

  await favoritesModel.removeFavorite(account_id, inv_id);

  res.json({ status: "removed" });
};

/* *******************************
 * Check Favorite (AJAX)
 ******************************** */
favoritesController.checkFavorite = async function (req, res) {
    const account_id = res.locals.accountData.account_id;
    const inv_id = req.params.inv_id;

    const exists = await favoritesModel.isFavorited(account_id, inv_id);

    res.json({ isFavorite: exists });
};

module.exports = favoritesController;
