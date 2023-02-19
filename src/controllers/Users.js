import { Users } from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const checkDataUserByEmail = async (emailReq) => {
    // Mengambil Data User Berdasarkan Email  
    const users = await Users.findAll({
        where: {
            email: emailReq
        }
    });

    return users;
}

export const getUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ['id', 'name', 'email']
        });
        res.status(200).json({
            response: users
        });
    } catch (error) {
        res.status(404).json({
            response: error
        })
    }
};

export const Register = async (req, res) => {
    const { name, email, password, confPassword } = req.body;

    // Menampung Data user ByEmail
    const users = await checkDataUserByEmail(email);

    if (name === "" || email === "" || password === "" || confPassword === "") return res.status(400).json({ status: 400, response: "input tidak boleh ada yang kosong" });

    // Jika email sudah terdaftar return  status 400
    if (users.length !== 0) return res.status(400).json({ status: 400, response: "Email yang digunakan sudah terdaftar" });

    // Jika password tidak sama dengan confirmasi password return status 400
    if (password !== confPassword) return res.status(400).json({ status: 400, response: "Password dan confirmasi password tidak sama" });

    // Hash Password
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    // Create Users
    try {
        await Users.create({
            name: name,
            email: email,
            password: hashPassword
        });
        res.status(200).json({ name: name, response: "Register Success" })
    } catch (error) {
        res.json({
            status: 404,
            response: error
        })
    }
}

export const Login = async (req, res) => {
    try {
        // Mengambil Data User Berdasarkan Email  
        const user = await Users.findAll({
            where: {
                email: req.body.email
            }
        });

        const match = await bcrypt.compare(req.body.password, user[0].password);

        if (!match) return res.status(400).json({ response: "Password salah" })

        // Menampung Data
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;

        const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "20s"
        });
        const refreshToken = jwt.sign({ userId, name, email }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "1d"
        });

        await Users.update({ refresh_token: refreshToken }, {
            where: {
                id: userId
            }
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: true
        });
        res.json({ accessToken });
    } catch (error) {
        res.status(400).json({
            response: "Email tidak terdaftar"
        })
    }
}

export const Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    // Jika RefreshToken Tidak Ada
    if (!refreshToken) return res.sendStatus(204);
    const user = await Users.findAll({
        where: {
            refresh_token: refreshToken
        }
    });

    if (!user[0]) return res.sendStatus(204);
    const userId = user[0].id;
    await Users.update({ refresh_token: null }, {
        where: {
            id: userId
        }
    });
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
}

