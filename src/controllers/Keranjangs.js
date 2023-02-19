import { Keranjangs } from "../models/UserModel.js";

export const getKeranjangs = async (req, res) => {
    const { id } = req.body
    try {
        const keranjangs = await Keranjangs.findAll({
            where: {
                idUsers: id
            }
        });
        res.status(200).json({
            status: 200,
            response: keranjangs
        })
    } catch (error) {
        res.status(404).json({
            status: 404,
            response: error
        })
    }
}