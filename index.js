if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressEroor");

const methodOverride = require("method-override");

const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const campgroundRoutes = require("./routes/campground");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/user");

const User = require("./models/user");

const mongoSanitize = require("express-mongo-sanitize");

const helmet = require("helmet");

const MongoStore = require("connect-mongo");

// const dbUrl = process.env.DB_URL;
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp-2";

mongoose.connect(dbUrl);

// {  useFindAndModify: false }

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error :"));
db.once("open", () => {
  console.log("DataBaseConnected ");
});

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

app.use(helmet({ contentSecurityPolicy: false }));

// const scriptSrcUrls = [
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://api.mapbox.com/",
//   "https://kit.fontawesome.com/",
//   "https://cdnjs.cloudflare.com/",
//   "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//   "https://kit-free.fontawesome.com/",
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.mapbox.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://fonts.googleapis.com/",
//   "https://use.fontawesome.com/",
// ];
// const connectSrcUrls = [
//   "https://api.mapbox.com/",
//   "https://a.tiles.mapbox.com/",
//   "https://b.tiles.mapbox.com/",
//   "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: [],
//       connectSrc: ["'self'", ...connectSrcUrls],
//       scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", "blob:"],
//       objectSrc: [],
//       imgSrc: [
//         "'self'",
//         "blob:",
//         "data:",
//         "https://res.cloudinary.com/dfokfq4ku/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
//         "https://images.unsplash.com/",
//       ],
//       fontSrc: ["'self'", ...fontSrcUrls],
//     },
//   })
// );

const secret = process.env.SECRET || "thisshouldbeabettersecret";

const store = new MongoStore({
  mongoUrl: dbUrl,
  secret: secret,
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store: store,
  // store: MongoStore.create({
  //   mongoUrl: dbUrl,
  //   secret: "thisshouldbeabettersecret",
  //   touchAfter: 24 * 60 * 60,
  // }),
  name: "blah",
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // console.log(req.query);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.use("/", userRoutes);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "Something went wrong";
  }
  res.render("error", { err });
});

const port = process.env.PORT || 7890;
app.listen(port, () => {
  console.log(`Listing request at ${port}`);
});

// "start": "node app.js"
