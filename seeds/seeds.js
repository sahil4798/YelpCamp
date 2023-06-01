const mongoose = require("mongoose");
const Campground = require("../models/campground");

const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp-2");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error :"));
db.once("open", () => {
  console.log("DataBaseConnected ");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany();
  for (let i = 0; i < 50; i++) {
    let random1000 = Math.floor(Math.random() * 1000);
    const randomPrice = Math.floor(Math.random() * 600);
    const camp = new Campground({
      price: randomPrice,
      location: ` ${cities[random1000].city} ${cities[random1000].state} `,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Natus, suscipit unde quidem maxime dolore sed ipsa nisi necessitatibus omnis eius facere consequuntur corporis asperiores error, nobis commodi facilis. ",
      author: "64300e22c03960a345301747",
      images: [
        {
          url: "https://res.cloudinary.com/dfokfq4ku/image/upload/v1680929482/YelpCamp/um4ls980qunjxdhrm1py.avif",
          filename: "YelpCamp/g3e4nxvt5nkjt1tymijp",
        },
        {
          url: "https://res.cloudinary.com/dfokfq4ku/image/upload/v1680929482/YelpCamp/nnpyouogd6xdevmwwdhu.avif",
          filename: "YelpCamp/zerkivp7l462wsgrhkj2",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => mongoose.connection.close());
