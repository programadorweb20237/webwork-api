import { pool } from "../db.js";

export const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM dairycom_productNormal");
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong (dairycom_ProductNormal)" });
  }
};
