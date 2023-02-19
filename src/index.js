import express from "express";
import db from "./config/Database.js";
import router from "./routes/index.js";
import { Users, Products, Keranjangs } from "./models/UserModel.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

try {
    await db.authenticate();
    console.log("Database Connected...");
    await Users.sync();
    await Products.sync();
    await Keranjangs.sync();
} catch (error) {
    console.error(error);
}

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(router);

app.listen(port, () => console.log(`Server Running at port ${port}`));