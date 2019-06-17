require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");

const app = express();

const server = require("http").Server(app);
const io = require("socket.io")(server);

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

app.use(morgan("dev"));

app.use((req, res, next) => {
   req.io = io;
   next();
});

app.use(cors());

app.use(
   "/files",
   express.static(path.resolve(__dirname, "..", "tmp", "uploads"))
);

app.use(require("./routes"));

server.listen(3000);
