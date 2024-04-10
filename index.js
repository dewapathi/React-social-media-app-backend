const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/post");
const cors = require('cors');
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

dotenv.config();

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
},).then((res) => {
    console.log("Connected to MongoDB!");
}).catch(error => {
    console.log(error);
});

app.use("/images", express.static(path.join(__dirname, "public/images")));

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        console.log('req.body.name', req.body.name);
        const defaultName = `${uuidv4()}-${file.originalname}`;
        const fileName = req.body.name ? req.body.name : defaultName;
        cb(null, fileName);
    },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
        // Assuming you've saved the image file name in req.file.filename
        const imageUrl = `${req.file.filename}`;
        return res.status(200).json({ message: "File uploaded successfully", imageUrl });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);

app.listen(8800, () => {
    console.log("Backend server is running!");
});