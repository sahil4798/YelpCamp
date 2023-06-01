const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");

const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");

const campgrounds = require("../controllers/campgrounds");

const multer = require("multer");
// const upload = multer({ dest: "uploads/" });

// const { storage } = require("../cloudinary/index");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );
// .post(upload.array("image"), (req, res) => {
//   console.log(req.body);
//   console.log(req.files);
//   res.send(req.files);
// });

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));
router.get(
  "/:id/edit",
  isAuthor,
  isLoggedIn,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
