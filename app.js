const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
//const cloud = require('@google-cloud/storage');
const path = require("path");
const morgan = require("morgan");
const fs = require("fs");
//const uuidv4 = require('uuid');
const {uuid} = require('uuidv4');


const db = require("./config/set").mongoURI;
const farmerAuth = require("./route/farmerRouter/auth");
const customerAuth = require("./route/customerRouter/auth");
const farmerProduct = require("./route/farmerRouter/product");
const custoemrClient = require("./route/customerRouter/farmers");
const customerOrder = require("./route/customerRouter/order");
const superAcount = require("./route/supperAcount/superAcount");
const { Socket } = require("dgram");

const app = express();


const multerMid = multer({
  storage: multer.memoryStorage(),
  limits:{
    fileSize: 5 * 1024 *1024,
  },
});

app.disable('x-powered-by');
app.use(multerMid.single('imageUrl'));

//soring in local file using multer
// const fileStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "images");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === "image/png" ||
//     file.mimetype === "image/jpg" ||
//     file.mimetype === "image/jpeg"
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

//save requestes to logfiles
let accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a",
});

//setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//middle ware for multer
// app.use(
//   multer({ storage: fileStorage, fileFilter: fileFilter }).single("imageUrl")
// );
// app.use("/images", express.static(path.join(__dirname,"images")));

//middleware for headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET,POST,PUT,PATCH,DELETE"
  ),
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  next();
});

app.use("/farmers/api", farmerAuth);
app.use("/farmers/api", farmerProduct);
app.use("/customers/api", customerAuth);
app.use("/customers/api", custoemrClient);
app.use("/customers/api", customerOrder);
app.use("/super_acount/api", superAcount);

//reading all the files
// const directoryPath = path.join(__dirname,"access.log");

app.get("/logfiles", (req, res, next) => {
  const logFiles = [];
  try {
    const data = fs.readFileSync("access.log", "UTF-8");
    const lines = data.split(/\r?\n/);

    lines.forEach((line) => {
      logFiles.push(line);
    });
  } catch (e) {
    console.log(e);
  }
  //console.log(logFiles)
  res.status(200).json(logFiles);
  next();
});

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({
    message: message,
    data: data,
  });
});

const port = process.env.PORT || 3000;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((response) => {
    console.log("connected to databse");
    const server = app.listen(3000, () => {
      console.log(`server is connected at port ${port}`);
    });
    const io = require("./config/socket").init(server);
    io.on("connection", (Socket) => {
      console.log("client connected");
    });
  })
  .catch((err) => console.log(err));
