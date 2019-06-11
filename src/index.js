const express = require("express");
const mongoose = require("mongoose");

const app = express();

mongoose.connect(
   "mongodb+srv://mongouser:x2AwxeRL4HF36zu@cluster0-xy1n5.mongodb.net/test?retryWrites=true&w=majority",
   { useNewUrlParser: true }
);

app.use(require("./routes"));

app.listen(3333);
