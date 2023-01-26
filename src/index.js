import express from "express";
import db from "./config/Database.js";
import router from "./routes/index.js";
import Users from "./models/UserModel.js";
import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

try {
    await db.authenticate();
    console.log("Database Connected...");
    await Users.sync();
} catch (error) {
    console.error(error);
}

app.use(express.json());
app.use(express.urlencoded());
app.use(router);

app.listen(port, () => console.log(`Server Running at port ${port}`));