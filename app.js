const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const port = 2000;
const path = require("path");

// app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.static("public"));
const MONGO_URL = "mongodb://localhost:27017/roomonthego";

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

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

app.get("/listing", (req, res) => {
  res.sendFile("/public/listings.html", { root: __dirname });
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

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
