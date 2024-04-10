const User = require("../models/User");
const bcrypt = require('bcrypt');

const router = require("express").Router();

//Register
router.post("/register", async (req, res) => {
    try {
        //Generate new password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        //Create a new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashPassword
        })

        //Save user and return response
        const user = await newUser.save();
        res.status(200).json(user);
    } catch (e) {
        res.status(500).json(e);
    }
});

//Login
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email
        });
        !user && res.status(404).json("User not found");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        !validPassword && res.status(400).json("Wrong password");

        res.status(200).json(user);
    } catch (e) {
        res.status(500).json(e);
    }
});

module.exports = router;