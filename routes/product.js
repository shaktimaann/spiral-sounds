import { getProducts } from "../controllers/productsController.js"
import { getGenres } from "../controllers/productsController.js"
import express from "express"

export const productsRouter = express.Router()
productsRouter.get('/',getProducts)
productsRouter.get('/genres',getGenres)



