const pool = require("../database/")

/* ***********************************
 * Add vehicle to favorites
 *********************************** */
async function addFavorite(account_id, inv_id) {
  try {
    const sql = `
      INSERT INTO favorites (account_id, inv_id)
      VALUES ($1, $2)
      ON CONFLICT (account_id, inv_id) DO NOTHING
      RETURNING *;
    `
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

/* ***********************************
 * Remove from favorites
 *********************************** */
async function removeFavorite(account_id, inv_id) {
  try {
    const sql = `DELETE FROM favorites WHERE account_id = $1 AND inv_id = $2`
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rowCount
  } catch (error) {
    throw error
  }
}

/* ***********************************
 * Get all favorites for a user
 *********************************** */
async function getFavoritesByAccount(account_id) {
  try {
    const sql = `
      SELECT f.favorite_id, i.*
      FROM favorites f
      JOIN inventory i ON f.inv_id = i.inv_id
      WHERE f.account_id = $1;
    `
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    throw error
  }
}

/* ***********************************
 * Check if a single vehicle is favorited
 *********************************** */
async function isFavorited(account_id, inv_id) {
  const sql = `
    SELECT * FROM favorites 
    WHERE account_id = $1 AND inv_id = $2
  `
  const result = await pool.query(sql, [account_id, inv_id])
  return result.rowCount > 0
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavoritesByAccount,
  isFavorited
}
