const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const sharp = require("sharp");

const storageTypes = {
   local: multer.diskStorage({
      destination: (req, file, cb) => {
         cb(null, path.resolve(__dirname, "..", "..", "tmp", "uploads"));
      },
      filename: (req, file, cb) => {
         crypto.randomBytes(16, (err, hash) => {
            if (err) {
               cb(null, file.originalname);
            }
            file.key = `${hash.toString("hex")}-${file.originalname}`;
            cb(null, file.key);
         });
      }
   }),
   s3: multerS3({
      s3: new aws.S3(),
      bucket: process.env.AWS_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      acl: "public-read",
      key: (req, file, cb) => {
         crypto.randomBytes(16, async (err, hash) => {
            if (err) {
               cb(null, file.originalname);
            }
            const fileName = `${hash.toString("hex")}-${file.originalname}`;
            cb(null, fileName);
         });
      }
   })
};
module.exports = {
   dest: path.resolve(__dirname, "..", "..", "tmp", "uploads"),
   storage: storageTypes[process.env.STORAGE_TYPE],
   limits: {
      fileSize: 4 * 1024 * 1024,
      files: 3
   },
   fileFilter(req, file, cb) {
      const isPhoto = file.mimetype.startsWith("image/");
      if (isPhoto) {
         cb(null, true); // null for error means it worked and it is fine to continue to next()
      } else {
         cb(new Error("Invalid mime type"), false); // with error
      }
   }
};
