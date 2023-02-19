import { Sequelize } from "sequelize";
import db from "../config/Database.js";

export const Users = db.define("users", {
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    refresh_token: Sequelize.TEXT

}, {
    freezeTableName: true
});

export const Products = db.define("products", {
    nameProduct: Sequelize.STRING,
    keterangan: Sequelize.STRING,
    category: Sequelize.STRING,
    harga: Sequelize.INTEGER,
    img: Sequelize.STRING
}, {
    freezeTableName: true
})

export const Keranjangs = db.define("keranjangs", {
    nameProduct: Sequelize.STRING,
    harga: Sequelize.INTEGER,
    jumlah: Sequelize.INTEGER,
    img: Sequelize.STRING,
    idUsers: Sequelize.INTEGER
}, {
    freezeTableName: true
})