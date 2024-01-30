const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");
const { Article, News, Videos, Magazine } = require("./models");
const { title } = require("process");
const fs = require("fs");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    let articles = await Article.getArticles();
    const news = await News.getNews();
    const today = new Date();
    const todayDate = today.toLocaleDateString("en-GB");
    const todaysNews = await News.getNewsByTodaysDate(todayDate);
    res.render("home", {
      title: "Sandesh TV Daily News",
      articles: articles,
      todaysNews,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/createnews", async (req, res) => {
  try {
    res.render("createNews", { title: "Create News" });
  } catch (err) {
    console.log(err);
  }
});

app.post("/createNews", upload.single("image"), async (req, res) => {
  try {
    const image = req.file;
    const imageData = {
      filename: image.originalname,
      data: image.buffer,
    };
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];
    await News.createNews({
      title: req.body.title,
      state: req.body.state,
      category: req.body.category,
      content: req.body.content,
      date: todayDate,
      image: imageData,
    });
    return res.redirect("/allNews");
  } catch (err) {
    console.log(err);
  }
});

app.get("/epaper", async (req, res) => {
  try {
    let articles = await Article.getArticles();
    res.render("e-paper", {
      title: "Sandesh TV e-paper",
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

app.post("/createArticle", upload.single("image"), async (req, res) => {
  try {
    const image = req.file;
    const imageData = {
      filename: image.originalname,
      data: image.buffer,
    };
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];

    await Article.createArticle({
      title: req.body.title,
      date: todayDate,
      images: imageData,
      state: req.body.state,
    });

    return res.redirect("/epaper");
  } catch (err) {
    console.log(err);
  }
});

app.get("/magazine", async (req, res) => {
  try {
    let magazines = await Magazine.getMagazines();
    res.render("magazine", {
      title: "Sandesh TV magazines",
      magazines: magazines,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/createMagazine", async (req, res) => {
  try {
    res.render("createMagazine", {
      title: "Add magazine",
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/createMagazine", upload.single("pdf"), async (req, res) => {
  try {
    const pdf = req.file;
    let filename = pdf.originalname;
    if (filename.includes(" ")) {
      filename = filename.trim();
    }
    const pdfData = {
      filename: filename,
      data: pdf.buffer,
    };
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];
    await Magazine.createMagazine({
      title: req.body.title,
      date: todayDate,
      pdf: pdfData,
    });
    return res.redirect("/magazine");
  } catch (err) {
    console.log(err);
  }
});

app.get("/videos", async (req, res) => {
  try {
    let videos = await Videos.getVideos();
    res.render("videos", {
      title: "Sandesh TV videos",
      videos: videos,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/allNews", async (req, res) => {
  const news = await News.getNews();
  try {
    res.render("allNews", {
      title: "All News",
      todaysNews: news,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/allPapers", async (req, res) => {
  const articles = await Article.getArticles();
  try {
    res.render("allPapers", {
      title: "All Papers",
      articles,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/createVideo", async (req, res) => {
  try {
    res.render("createVideo", {
      title: "Add video",
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/createVideo", async (req, res) => {
  try {
    await Videos.createVideo({
      title: req.body.title,
      url: req.body.url,
      video_id: req.body.video_id,
    });
    return res.redirect("/videos");
  } catch (err) {
    console.log(err);
  }
});

app.get("/editNews/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const news = await News.getNewsById(id);
    res.render("editNews", {
      title: "Edit News",
      id,
      news,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/editEpaper/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const article = await Article.getArticleById(id);
    res.render("editEpaper", {
      title: "Edit Epaper",
      id,
      article,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/news/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const news = await News.getNewsById(id);
    res.render("news", {
      title: news.title,
      id: id,
      news,
    });
  } catch (err) {
    console.log(err);
  }
});

app.put("/editEpaper/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const updatedArticle = await Article.updateArticle(
      id,
      req.body.title,
      req.body.state
    );
    return res.json(updatedArticle);
  } catch (err) {
    console.log(err);
  }
});

app.delete("/editPaper/:id", async (req, res) => {
  try {
    const article = await Article.getArticleById(req.params.id);
    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }
    const result = await Article.deleteArticle(req.params.id);
    if (result !== 1) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete article" });
    }
    const imagePath = path.join(__dirname, "uploads", article.images.filename);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting image:", err);
        return res
          .status(500)
          .json({ success: false, message: "Failed to delete image" });
      }
      return res.json({ success: true });
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.put("/editNews/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];
    const newNews = await News.updateNews(
      id,
      req.body.title,
      req.body.state,
      req.body.category,
      req.body.content
    );
    return res.json(newNews);
  } catch (error) {
    console.error("Error updating news:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/editNews/:id", async (req, res) => {
  try {
    const news = await News.getNewsById(req.params.id);
    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: "News not found" });
    }
    const result = await News.deleteNews(req.params.id);
    if (result !== 1) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete news" });
    }
    const imagePath = path.join(__dirname, "uploads", news.image.filename);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting image:", err);
        return res
          .status(500)
          .json({ success: false, message: "Failed to delete image" });
      }
      return res.json({ success: true });
    });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.get("/magazine/:id", async (req, res) => {
  try {
    const magazine = await Magazine.getMagazineById(req.params.id);
    res.render("magazineView", {
      title: magazine.title,
      magazine: magazine,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/state/:state", async (req, res) => {
  const state = req.params.state;
  const newsByState = await News.getNewsByState(state);
  switch (state) {
    case "telangana":
      res.render("stateNews", {
        title: "Telangana News",
        newsByState,
      });
      break;
    case "andhrapradesh":
      res.render("stateNews", {
        title: "AndhraPradesh News",
        newsByState,
      });
      break;
    case "other":
      res.render("stateNews", {
        title: "News",
        newsByState,
      });
      break;
    default:
      res.status(404).send("Not Found");
  }
});

app.get("/category/:category", async (req, res) => {
  const category = req.params.category;
  const newsByCategory = await News.getNewsByCategory(category);
  switch (category) {
    case "cinema":
      res.render("categoryNews", {
        title: "Cinema",
        newsByCategory,
      });
      break;
    case "sports":
      res.render("categoryNews", {
        title: "Sports",
        newsByCategory,
      });
      break;
    case "business":
      res.render("categoryNews", {
        title: "Business",
        newsByCategory,
      });
      break;
    case "spirituality":
      res.render("categoryNews", {
        title: "Spirituality",
        newsByCategory,
      });
      break;
    case "history":
      res.render("categoryNews", {
        title: "History",
        newsByCategory,
      });
      break;
    default:
      res.statusCode(404).send("Not Found");
  }
});

function mapState(state) {
  if (state.toLowerCase() === "andhra") {
    return "andhra pradesh";
  }
  return state;
}

app.get("/epaper/:state", async (req, res) => {
  let state = req.params.state;
  const articles = await Article.getArticlesByState(state);
  res.render("stateArticles", {
    articles,
    title: state,
    state,
  });
});

app.get("/epaper/:state/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const state = req.params.state;
    const article = await Article.getArticleById(articleId);
    const stateArticles = await Article.getArticlesByState(state);
    const stack = stateArticles.map((article) => ({
      title: article.dataValues.title,
      image: article.dataValues.images
        ? article.dataValues.images.filename
        : null,
      id: article.dataValues.id,
    }));
    const currentIndex = stack.findIndex((item) => item.id === article.id);
    const nextIndex = currentIndex < stack.length - 1 ? currentIndex + 1 : null;
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : null;
    res.render("article", {
      title: `${article.title}`,
      state,
      article,
      nextIndex,
      prevIndex,
      stack,
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = app;
