import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
    try {
        const users = await Users.findAll();
        res.json({
            status: 200,
            response: users,
            data: process.env.ACCESS_TOKEN_SECRET
        });
    } catch (error) {
        res.json({
            status: 404,
            response: error
        })
    }
};

export const Register = async (req, res) => {
    const { name, email, password, confPassword } = req.body;

    if (password !== confPassword) return res.json({
        status: 400,
        response: "Password dan confiramsi password tidak sama"
    });
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    try {
        await Users.create({
            name: name,
            email: email,
            password: hashPassword
        });
        res.json({
            status: 200,
            response: "Register Success"
        })
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
        }).catch(() => {
            // Response jika email tidak terdaftar
            res.json({ status: 400, response: "Email tidak terdaftar" })
        })

        // Pengkondisian check password
        if (user[0].password !== req.body.password) return res.json({ status: 400, response: "Password yang anda masukan salah" });

        // Menampung Data
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;

        const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "20s"
        });
        const refreshToken = jwt.sign({ userId, name, email }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "20s"
        });

        await Users.update({ refresh_token: refreshToken }, {
            where: {
                id: userId
            }
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({
            status: 200,
            accessToken
        });
    } catch (error) {
        res.json({
            status: 404,
            response: "Email tidak ditemukan"
        })
    }
}

