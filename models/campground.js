const mongoose = require("mongoose");
const Review = require("./review");

const Schema = mongoose.Schema;

// https://res.cloudinary.com/dfokfq4ku/image/upload/v1680929482/YelpCamp/nnpyouogd6xdevmwwdhu.avif
//  https://res.cloudinary.com/dfokfq4ku/image/upload/w_300/v1680929482/YelpCamp/nnpyouogd6xdevmwwdhu.avif
const imageSchema = new Schema({ url: String, filename: String });

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const CampgroundSchema = new Schema({
  title: { type: String, require: true },
  images: [imageSchema],
  price: Number,
  description: String,
  location: String,
  author: { type: Schema.Types.ObjectId, ref: "User" },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
