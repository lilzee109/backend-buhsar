import { Sequelize } from "sequelize";

const db = new Sequelize("freedb_dbBuah", "freedb_data-website", "4ZP#GQ8P?HBG3?z", {
    host: "sql.freedb.tech",
    dialect: "mysql"
})

export default db;