const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const port = 2000;
const path = require("path");
const bcrypt = require("bcrypt");
const User = require("./models/users");

app.use(express.static("public"));
const MONGO_URL = "mongodb://localhost:27017/roomonthego";

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Session and flash configuration
app.use(
  session({
    secret: "your-secret-key", // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  const successMessage = req.session.successMessage;
  req.session.successMessage = null; // Clear the success message from the session
  res.sendFile("index.html", { root: __dirname, message: successMessage });
});

app.get("/listings", async (req, res) => {
  try {
    const alllisting = await Listing.find({});
    res.render("listings/index", { alllisting });
  } catch (error) {
    console.error("Error fetching all listings:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/listings/new", (req, res) => {
  res.sendFile("/public/new.html", { root: __dirname });
});

app.get("/listings/logo-3.png", (req, res) => {
  res.sendFile("/public/logo-3.png", { root: __dirname });
});

app.get("/listings/tt.jpeg", (req, res) => {
  res.sendFile("/public/tt.jpeg", { root: __dirname });
});

app.get("/listings/:id", async (req, res) => {
  try {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show", { listing });
  } catch (error) {
    console.error("Error fetching listing by ID:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/listings", async (req, res) => {
  try {
    let newlisting = new Listing(req.body.listing);
    await newlisting.save();
    res.redirect("/listings");
  } catch (error) {
    console.error("Error creating new listing:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/listings/", async (req, res) => {
  try {
    let newlisting = new Listing(req.body.listing);
    await newlisting.save();
    res.redirect("/listings");
  } catch (error) {
    console.error("Error creating new listing:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/listings/:id/edit", async (req, res) => {
  try {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", { listing });
  } catch (error) {
    console.error("Error fetching listing for edit:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/listings/:id", async (req, res) => {
  try {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/listings/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    res.redirect("/listings");
  } catch (error) {
    console.error("Error deleting listing:", error);
    res.status(500).send("Internal Server Error");
  }
});

// User registration
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public/register.html"));
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "User already exists");
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    req.flash("success", "Registration successful!");

    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Internal server error");
    res.redirect("/register");
  }
});

// User login
app.get("/login", (req, res) => {
  res.sendFile("/public/welcome.html", { root: __dirname });
});

app.get("/loginf", (req, res) => {
  res.sendFile("/public/retry.html", { root: __dirname });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      // return res.status(400).json({ error: "Invalid email or password" });
      res.sendFile("/public/retry.html", { root: __dirname });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // return res.status(400).json({ error: "Invalid email or password" });
      res.sendFile("/public/retry.html", { root: __dirname });
    }

    req.session.successMessage = "Login successful!";

    res.sendFile("/public/welcome.html", { root: __dirname });
    console.log("Login successful");
  } catch (err) {
    console.error(err);
    res.sendFile("/public/retry.html", { root: __dirname });
    // res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
