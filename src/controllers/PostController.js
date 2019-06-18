const Post = require("../models/Post");

module.exports = {
   async index(req, res) {
      const posts = await Post.find().sort("-createdAt");

      return res.json(posts);
   },

   async store(req, res) {
      const { author, place, description, hashtags } = req.body;
      const { originalname: image } = req.file;
      const { key, location: url = "" } = req.file.transforms[0];

      const post = await Post.create({
         author,
         place,
         description,
         hashtags,
         key,
         url,
         image
      });

      req.io.emit("post", post);

      return res.json(post);
   },

   async delete(req, res) {
      const post = await Post.findById(req.params.id);
      if (post) {
         await post.remove();
      }
      posts = await Post.find().sort("-createdAt");
      return res.json(posts);
   }
};
