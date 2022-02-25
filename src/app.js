import { dirname, join } from "path";
import { fileURLToPath } from "url";

import express from "express";
import session from "express-session";
import dotenv from "dotenv";

import passport from "./login.js";
import { router as basicRouter } from "./routes/basic-routes.js";
import { router as adminRouter } from "./routes/admin-routes.js";

dotenv.config();

const {
  HOST: hostname = '127.0.0.1',
  PORT: port = 6969,
  NODE_ENV: nodeEnv = 'development',
  SESSION_SECRET: sessionSecret,
  DATABASE_URL: connectionString,
} = process.env;

// if (!connectionString || !sessionSecret) {
//   console.error("Vantar gögn í env");
//   process.exit(1);
// }

const app = express();

app.use(express.urlencoded({ extended: true }));

const path = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(path, "../public")));
app.set("views", join(path, "../views"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    maxAge: 20 * 1000, // 20 sek
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.locals.formatDate = (str) => {
  let date = "";

  try {
    date = format(str || "", "dd.MM.yyyy");
  } catch {
    return "";
  }

  return date;
};
app.use("/admin", adminRouter);
app.use("/", basicRouter);

/**
 * Middleware sem sér um 404 villur.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @param {function} next Næsta middleware
 */
// eslint-disable-next-line no-unused-vars
function notFoundHandler(req, res, next) {
  const title = "Síða fannst ekki";
  res.status(404).render("error", {
    title,
    validated: req.isAuthenticated(),
  });
}

/**
 * Middleware sem sér um villumeðhöndlun.
 *
 * @param {object} err Villa sem kom upp
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @param {function} next Næsta middleware
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  const title = "Villa kom upp";
  res.status(500).render("error", {
    title,
    validated: req.isAuthenticated(),
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
