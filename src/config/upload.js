const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const multerS3 = require("multer-s3-transform");
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
            file.key = `${hash.toString("hex")}.jpg`;
            cb(null, file.key);
         });
      }
   }),
   s3: multerS3({
      s3: new aws.S3(),
      bucket: process.env.AWS_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      acl: "public-read",
      shouldTransform: function(req, file, cb) {
         cb(null, /^image/i.test(file.mimetype));
      },
      transforms: [
         {
            key: (req, file, cb) => {
               crypto.randomBytes(16, async (err, hash) => {
                  if (err) {
                     cb(null, file.originalname);
                  }
                  const fileName = `${hash.toString("hex")}.jpg`;
                  cb(null, fileName);
               });
            },
            transform: function(req, file, cb) {
               cb(
                  null,
                  sharp()
                     .resize(600)
                     .toFormat("jpeg")
               );
            }
         }
      ]
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
