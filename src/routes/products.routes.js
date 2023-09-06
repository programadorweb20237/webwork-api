import { Router } from "express";
import {getProducts} from "../controllers/products.controller.js";

const router = Router();

// GET all Employees
router.get("/products", getProducts);


export default router;
