const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const { Article, News, Videos } = require("./models");
const article = require("./models/article");

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

app.get("/e-paper", async (req, res) => {
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
      category: req.body.category,
      images: imageData,
      state: req.body.state,
    });

    return res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

// app.get("/:category", async (req, res) => {
//   try {
//     const selectedCategory = req.params.category;
//     const articlesInCategory = await Article.getArticlesByCategory(
//       selectedCategory
//     );
//     const andhraArticles = [];
//     const telanganaArticles = [];
//     for (let i = 0; i < articlesInCategory.length; i++) {
//       if (articlesInCategory[i].state === "telangana") {
//         telanganaArticles.push(articlesInCategory[i]);
//       } else {
//         andhraArticles.push(articlesInCategory[i]);
//       }
//     }
//     res.render("categoryArticle", {
//       title: `${selectedCategory}`,
//       category: selectedCategory,
//       articles: articlesInCategory,
//       telanganaArticles,
//       andhraArticles,
//     });
//   } catch (err) {
//     console.log(err);
//   }
// });

function mapState(state) {
  if (state.toLowerCase() === "andhra") {
    return "andhra pradesh";
  }
  return state;
}

// app.get("/:category/:state", async (req, res) => {
//   const category = req.params.category;
//   let state = req.params.state;
//   state = mapState(state);
//   const articles = await Article.getArticlesByStateAndCategory(category, state);
//   res.render("stateArticles", {
//     articles,
//     category,
//     title: category,
//     state,
//   });
// });

// app.get("/:category/:state/:id", async (req, res) => {
//   try {
//     const articleId = req.params.id;
//     console.log(req.params.id);
//     const article = await Article.getArticleById(articleId);
//     const category = req.params.category;
//     let state = req.params.state;
//     state = mapState(state);
//     const sameCategoryArticles = await Article.getArticlesByStateAndCategory(
//       category,
//       state
//     );
//     const stack = sameCategoryArticles.map((article) => ({
//       title: article.dataValues.title,
//       image: article.dataValues.images
//         ? article.dataValues.images.filename
//         : null,
//       id: article.dataValues.id,
//     }));
//     const currentIndex = stack.findIndex(
//       (item) => item.title === article[0].title
//     );

//     const prevIndex = currentIndex > 0 ? currentIndex - 1 : null;
//     const nextIndex = currentIndex < stack.length - 1 ? currentIndex + 1 : null;
//     res.render("article", {
//       title: `${article[0].title}`,
//       article: article[0],
//       prevArticleIndex: prevIndex,
//       nextArticleIndex: nextIndex,
//       category,
//       stack,
//       state,
//     });
//   } catch (err) {
//     console.log(err);
//   }
// });

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
      content: req.body.content,
      date: todayDate,
      image: imageData,
    });
    return res.redirect("/");
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

module.exports = app;
