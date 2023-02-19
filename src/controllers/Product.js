import { Products } from "../models/UserModel.js";

export const getProducts = async (req, res) => {
    try {
        const products = await Products.findAll()
        res.status(200).json({
            response: products
        });
    } catch (error) {
        res.status(404).json({
            response: error
        })
    }
}