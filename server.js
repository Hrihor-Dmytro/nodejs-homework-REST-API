const mongoose = require("mongoose");
const app = require("./app");
require("dotenv").config();

const DB = process.env.MONGO_URL;
mongoose.set("strictQuery", true);

mongoose
  .connect(DB, {
    usenewurlparser: true,
    useunifiedtopology: true,
  })
  .then(() => {
    app.listen(3000, () => {
      console.log("Database connection successful. Use our API on port: 3000");
    });
  })
  .catch((error) => {
    console.log(`can not connect to database, ${error}`);
    process.exit(1);
  });
