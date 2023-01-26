import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const Users = db.define('users', {
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    refresh_token: Sequelize.TEXT

}, {
    freezeTableName: true
});

export default Users;