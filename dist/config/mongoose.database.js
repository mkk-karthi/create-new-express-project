import mongoose from "mongoose";

// Mongo DB conncetion
function DbConnect() {
  const db_uri = process.env.DB_URI;

  mongoose
    .connect(db_uri, {
      connectTimeoutMS: 1000,
    })
    .then((res) => console.log("DB connected"))
    .catch((err) => console.log(err));
}

export default DbConnect;
