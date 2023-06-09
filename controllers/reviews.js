const Review = require("../models/review");
const Campground = require("../models/campground");

module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  const review = new Review(req.body.review);
  review.author = req.user._id;
  const campground = await Campground.findById(id);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Successfully posted a review");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });
  const review = await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted a review");
  res.redirect(`/campgrounds/${campground._id}`);
};
