const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const { Article, News, Videos, Magazine, Admin } = require("./models");
const fs = require("fs");
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
const connectEnsureLogin = require("connect-ensure-login");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const saltRounds = 10;
app.use(flash());
app.use(cookieParser("Some secret String"));

app.use(
  session({
    secret: "my-super-secret-key-2837428907583420",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use((request, response, next) => {
  response.locals.messages = request.flash();
  next();
});

app.use(passport.initialize());
app.use(passport.session());

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

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      Admin.findOne({ where: { email: username } })
        .then(async function (user) {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch(() => {
          return done(null, false, {
            message: "Account doesn't exist for this mail",
          });
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Admin.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

// app.get("/signup", (request, response) => {
//   response.render("signup", {
//     title: "Signup",
//   });
// });

// app.post("/users", async (request, response) => {
//   if (request.body.email.length == 0) {
//     request.flash("error", "Email can not be empty!");
//     return response.redirect("/signup");
//   }

//   if (request.body.firstName.length == 0) {
//     request.flash("error", "First name can not be empty!");
//     return response.redirect("/signup");
//   }
//   if (request.body.password.length < 8) {
//     request.flash("error", "Password length should be minimun 8");
//     return response.redirect("/signup");
//   }
//   const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
//   try {
//     const user = await Admin.create({
//       firstName: request.body.firstName,
//       lastName: request.body.lastName,
//       email: request.body.email,
//       password: hashedPwd,
//     });
//     request.login(user, (err) => {
//       if (err) {
//         console.log(err);
//       }
//       response.redirect("/");
//     });
//   } catch (error) {
//     console.log(error);
//     request.flash(
//       "error",
//       "This mail already having account, try another mail!"
//     );
//     return response.redirect("/signup");
//   }
// });

app.get("/login-admin-stv", (request, response) => {
  response.render("login", { title: "Login" });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login-admin-stv",
    failureFlash: true,
  }),
  function (request, response) {
    request.flash("success", "Signup successfull!");
    response.redirect("/");
  }
);
app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/login-admin-stv");
  });
});

app.get("/", async (req, res) => {
  try {
    let articles = await Article.getArticles();
    const today = new Date();
    const todayDate = today.toLocaleDateString("en-GB");
    const todaysNews = await News.getNewsByTodaysDate(todayDate);
    res.render("home", {
      title: "Sandesh TV Daily News",
      articles: articles,
      todaysNews,
      admin: req.user,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/privacyPolicy", async (req, res) => {
  try {
    res.render("privacyPolicy", {
      title: "Privacy Policy",
    });
  } catch (err) {
    console.log(err);
  }
});

app.get(
  "/createnews",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      res.render("createNews", {
        title: "Create News",
      });
    } catch (err) {
      console.log(err);
    }
  }
);

app.post(
  "/addNews",
  upload.single("image"),
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
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
      req.flash("success", "News added");
      return res.redirect("/allNews");
    } catch (err) {
      console.log(err);
    }
  }
);

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

app.get(
  "/createarticle",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      res.render("createArticle", {
        title: "Create Article",
      });
    } catch (err) {
      console.log(err);
    }
  }
);

app.post(
  "/createArticle",
  connectEnsureLogin.ensureLoggedIn(),
  upload.single("image"),
  async (req, res) => {
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
      req.flash("success", "Paper added");
      return res.redirect("/allPapers");
    } catch (err) {
      console.log(err);
    }
  }
);

app.get("/magazine", async (req, res) => {
  try {
    const protocol = req.protocol;
    const host = req.get("host");
    let magazines = await Magazine.getMagazines();
    res.render("magazine", {
      title: "Sandesh TV magazines",
      magazines: magazines,
      protocol,
      host,
      admin: req.user,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get(
  "/createMagazine",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      res.render("createMagazine", {
        title: "Add magazine",
      });
    } catch (err) {
      console.log(err);
    }
  }
);

app.post(
  "/createMagazine",
  connectEnsureLogin.ensureLoggedIn(),
  upload.single("pdf"),
  async (req, res) => {
    try {
      const pdf = req.file;
      let filename = pdf.originalname;
      if (filename.includes(" ")) {
        if (filename.includes(" ")) {
          req.flash(
            "error",
            "Filename contains spaces. Please remove spaces from the filename and try again."
          );
          return res.redirect("/createMagazine");
        }
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
      req.flash("success", "Magazine added");
      return res.redirect("/magazine");
    } catch (err) {
      console.log(err);
    }
  }
);

app.get("/videos", async (req, res) => {
  try {
    let videos = await Videos.getVideos();
    res.render("videos", {
      title: "Sandesh TV videos",
      videos: videos,
      admin: req.user,
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
      admin: req.user,
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
      admin: req.user,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get(
  "/createVideo",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      res.render("createVideo", {
        title: "Add video",
      });
    } catch (err) {
      console.log(err);
    }
  }
);

app.post(
  "/createVideo",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      await Videos.createVideo({
        title: req.body.title,
        url: req.body.url,
        video_id: req.body.video_id,
      });
      req.flash("success", "Video added");
      return res.redirect("/videos");
    } catch (err) {
      console.log(err);
    }
  }
);

app.get("/aboutus", async (req, res) => {
  try {
    res.render("aboutus", {
      title: "About us",
    });
  } catch (err) {
    console.log(err);
  }
});

app.get(
  "/editNews/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
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
  }
);

app.get(
  "/editEpaper/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
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
  }
);

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

app.delete(
  "/deleteMagazine/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const magazine = await Magazine.getMagazineById(req.params.id);
      if (!magazine) {
        return res
          .status(404)
          .json({ success: false, message: "Magazine not found" });
      }
      const result = await Magazine.deleteMagazine(req.params.id);
      if (result !== 1) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to delete magazine" });
      }
      const pdfPath = path.join(__dirname, "uploads", magazine.pdf.filename);
      fs.unlink(pdfPath, (err) => {
        if (err) {
          console.error("Error deleting pdf:", err);
          return res
            .status(500)
            .json({ success: false, message: "Failed to delete pdf" });
        }
        return res.json({ success: true });
      });
    } catch (error) {
      console.error("Error deleting magazine:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);

app.put(
  "/editEpaper/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
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
  }
);

app.delete(
  "/editPaper/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
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
      const imagePath = path.join(
        __dirname,
        "uploads",
        article.images.filename
      );
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
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);

app.put(
  "/editNews/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
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
  }
);

app.delete(
  "/editNews/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
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
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);

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

app.delete(
  "/deleteVideo/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const video = await Videos.getVideoById(req.params.id);
      if (!video) {
        return res
          .status(404)
          .json({ success: false, message: "Video not found" });
      }

      const result = await Videos.deleteVideo(req.params.id);
      if (result !== 1) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to delete video" });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting video:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);

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
    const baseUrl = req.protocol + "://" + req.get("host");
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
    const articleUrl = `${baseUrl}/epaper/${state}/${articleId}`;
    res.render("article", {
      title: `${article.title}`,
      state,
      article,
      nextIndex,
      prevIndex,
      stack,
      articleUrl,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.use(function (request, response) {
  response.status(404).render("pageNotFound");
});

module.exports = app;
