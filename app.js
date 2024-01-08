const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const { Article } = require("./models");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", async (req, res) => {
  try {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const todayDate = new Date().toLocaleDateString(undefined, options);
    let articles = await Article.getArticles();
    res.render("home", {
      title: "Sandesh TV Daily News",
      date: todayDate,
      articles: articles,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/createarticle", async (req, res) => {
  try {
    res.render("createArticle", { title: "Create Article" });
  } catch (err) {
    console.log(err);
  }
});

app.post("/createArticle", upload.array("images"), async (req, res) => {
  try {
    const imagesData = req.files.map((file) => ({
      filename: file.originalname,
      data: file.buffer,
    }));

    await Article.createArticle({
      title: req.body.title,
      date: req.body.date,
      category: req.body.category,
      images: imagesData,
    });

    console.log(
      `Article created with ${req.body.title},${req.body.date},${req.body.category},${JSON.stringify(imagesData)}`
    );
    return res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

module.exports = app;
