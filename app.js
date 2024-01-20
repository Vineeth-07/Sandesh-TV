const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const { Article } = require("./models");
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
    console.log(articles[0].images);
    console.log(articles);
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

    await Article.createArticle({
      title: req.body.title,
      date: req.body.date,
      category: req.body.category,
      images: imageData,
      state: req.body.state,
    });

    console.log(
      `Article created with ${req.body.title},${req.body.date},${
        req.body.state
      },${req.body.category},${JSON.stringify(imageData)}`
    );
    return res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.get("/:category", async (req, res) => {
  try {
    const selectedCategory = req.params.category;
    const articlesInCategory = await Article.getArticlesByCategory(
      selectedCategory
    );
    console.log("abcd", articlesInCategory.length);
    const andhraArticles = [];
    const telanganaArticles = [];
    for (let i = 0; i < articlesInCategory.length; i++) {
      if (articlesInCategory[i].state === "telangana") {
        telanganaArticles.push(articlesInCategory[i]);
      } else {
        andhraArticles.push(articlesInCategory[i]);
      }
    }
    console.log("telanganaArticles", telanganaArticles);
    console.log("telanganaArticles", telanganaArticles.length);
    console.log("andhraArticles", andhraArticles);
    res.render("categoryArticle", {
      title: `${selectedCategory}`,
      category: selectedCategory,
      articles: articlesInCategory,
      telanganaArticles,
      andhraArticles,
    });
  } catch (err) {
    console.log(err);
  }
});

function mapState(state) {
  if (state.toLowerCase() === "andhra") {
    return "andhra pradesh";
  }
  return state;
}

app.get("/:category/:state", async (req, res) => {
  const category = req.params.category;
  let state = req.params.state;
  state = mapState(state);
  const articles = await Article.getArticlesByStateAndCategory(category, state);
  console.log("unique", articles);
  console.log(articles.length);
  console.log(state);
  console.log(category);
  res.render("stateArticles", {
    articles,
    category,
    state,
  });
});

app.get("/:category/:state/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await Article.getArticleById(articleId);
    console.log(article);
    console.log(article[0].title);
    const category = req.params.category;
    console.log(category);

    let state = req.params.state;
    state = mapState(state);
    console.log(state);
    const sameCategoryArticles = await Article.getArticlesByStateAndCategory(
      category,
      state
    );
    console.log(sameCategoryArticles);
    const stack = sameCategoryArticles.map((article) => ({
      title: article.dataValues.title,
      image: article.dataValues.images
        ? article.dataValues.images.filename
        : null,
      id: article.dataValues.id,
    }));

    const currentIndex = stack.findIndex(
      (item) => item.title === article[0].title
    );

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : null;
    const nextIndex = currentIndex < stack.length - 1 ? currentIndex + 1 : null;
    console.log(stack);

    console.log("c", currentIndex);
    console.log("p", prevIndex);
    console.log("n", nextIndex);

    res.render("article", {
      title: `${article[0].title}`,
      article: article[0],
      prevArticleIndex: prevIndex,
      nextArticleIndex: nextIndex,
      category,
      stack,
      state,
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = app;
