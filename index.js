const app = require("./app");
// eslint-disable-next-line no-undef
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server started at - ${port}`);
});
