const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const PORT = 3000;
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://ankur:ankur33r@cluster0.fz0jde7.mongodb.net/rendertest"
  )
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.log("Connection error", err));

const userSchema = new mongoose.Schema({
  username: { type: String },
  password: { type: String },
  email: { type: String },
  // Set the type to an array Products
  purchasedCourse: [
    {
      cId: { type: String },
      cName: { type: String },
      description: { type: String },
      price: { type: String },
      completed: { type: Boolean, default: false },
    },
  ],
});

const User = mongoose.model("User", userSchema);

app.post("/user/signup", async (req, res) => {
  const { username, password, email } = req.body;

  // Checking if we got the username, password and email
  if (!username || !password || !email) {
    return res.send({ message: "Please provide all the required fields" });
  }

  // Checking if the user already exists

  // Here $or means either username or email should be equal to the username or email that we are getting from the request
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    return res.send({ message: "User already exists" });
  }

  // If the user does not exist, create a new user

  try {
    const user = new User({ username, password, email });
    await user.save();
    console.log("User created:", user);
    res.send({
      message: "User created successfully",
      user: { username: user.username, email: user.email },
    });
  } catch (err) {
    res.send({ message: "Error creating user" });
  }
});

// Route to login user

app.post("/user/login", async (req, res) => {
  const { Email: email, password } = req.body;

  // Checking if we got the username and password

  if (!email) {
    return res.send({ message: "Please provide email" });
  }
  if (!password) {
    return res.send({ message: "Please provide password" });
  }

  // Checking if the user existss

  try {
    const user = await User.findOne({ email });

    // If the user does not exist OR the password doesn;t match return an error message
    if (!user || user.password !== password) {
      return res.send({ message: "Login failed" });
    }

    console.log("User logged in:", user);
    res.send({
      message: "User logged in successfully",
      user: { username: user.username, email: user.email },
    });
  } catch (err) {
    res.send({ message: "Error logging in" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
