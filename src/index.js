import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is up and running at ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB Connection failed!", err);
  });
