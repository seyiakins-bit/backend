const express = require("express");
const dotenv = require("dotenv");
const cors = require('cors')
const app = express();
const {connectDB} = require("./config/db");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
connectDB();
dotenv.config();

// app.use(cors());
app.use(
    cors({
      origin: "https://ecommerce-iota-blue.vercel.app/",
      // origin: "http://localhost:5173",
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "auth-token"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    })
  );
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Welcome to my API!");
})
app.use("/", categoryRoutes);
app.use("/", productRoutes);
app.use("/", authRoutes);
app.use("/", cartRoutes);
app.use("/", paymentRoutes);


const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Listening on port " + port));