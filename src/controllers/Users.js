import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const checkDataUser = async (req) => {
    // Mengambil Data User Berdasarkan Email  
    const users = await Users.findAll({
        where: {
            email: req
        }
    });

    return users;
}

export const getUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ['id', 'name', 'email']
        });
        res.json({
            status: 200,
            response: users
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

    // Menampung Data user ByEmail
    const users = await checkDataUser(email);

    // Jika email sudah terdaftar return  status 400
    if (users.length !== 0) return res.json({ status: 400, response: "Email yang digunakan sudah terdafatar" });

    // Jika password tidak sama dengan confirmasi password return status 400
    if (password !== confPassword) return res.json({
        status: 400,
        response: "Password dan confiramsi password tidak sama"
    });

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

        const match = await bcrypt.compare(req.body.password, user[0].password);

        if (!match) return res.json({ status: 400, response: "Password salah" })

        // Menampung Data
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;

        const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15s"
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
            // secure: true
        });
        res.json({ accessToken });
    } catch (error) {
        res.json({
            status: 404,
            response: "Email tidak ditemukan"
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
    console.log(user);
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

