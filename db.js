const mongoose = require("mongoose");

const MongoUrl = process.env.MONGODB_URI;

async function connectToMongo() {
  try {
    await mongoose.connect(MongoUrl);
    console.log("connected To Mongo now");
  } catch (err) {
    console.log("error in connection with mongo", err);
  }
}

module.exports = connectToMongo;
