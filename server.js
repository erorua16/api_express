// Imports
const db = require("./database");
require("dotenv").config({ silent: true });

// Routers
const genreRouter = require("./routers/genreRouter");
const actorRouter = require("./routers/actorRouter");
const filmRouter = require("./routers/filmRouter");
const filmActorRouter = require("./routers/filmActorRouter");

// Defined vars
const express = require("express");
const app = express();
const logger = require("morgan");
const bodyParser = require("body-parser");
const crypto = require("crypto"); // Added crypto module for MD5 hashing

// App
app.enable('etag')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use((req, res, next) => {
  const bearerToken = req.headers.authorization;
  const expectedToken = `Bearer ${process.env.API_KEY}`;

  if (!bearerToken || bearerToken !== expectedToken) {
    console.log(bearerToken);
    console.log(expectedToken);
    res.status(401).json({ error: "Unauthorized" });
  } else {
    next();
  }
});

app.use((req, res, next) => {
  if (req.method === "GET") {
    const originalSend = res.send;
    res.send = function (data) {
      const jsonData = JSON.stringify(data);
      const hash = crypto.createHash("md5").update(jsonData).digest("hex");
      res.set("ETag", hash);
      originalSend.apply(res, arguments);
    };
  }
  next();
});

// app.use((req, res, next) => {
//   if (req.method === "PUT") {
//     console.log(req.originalUrl)
//     const requestETag = req.headers["if-match"];
//     next()
//     console.log(requestETag)
//   //   if(requestETag !== currentETag || !requestETag) {
//   //     return res.status(412).json({
//   //       message: 'precognition failed'
//   //   })
//   //   }
//   //   if (requestETag && currentETag && requestETag === currentETag) {
//   //     res.status(304).end();
//   //   } else {
//   //     next();
//   //   }
//   // } else {
//   //   next();
//   }
// });

// Routes
app.use("/api/genre", genreRouter);
app.use("/api/actor", actorRouter);
app.use("/api/film", filmRouter);
app.use("/api/filmActors", filmActorRouter);

app.use((req, res, next) => {
  res.status(404).json({
      message: 'route does not exist'
  })
})

const HTTP_PORT = 8000;
app.listen(HTTP_PORT, () => {
  console.log("Server is listening on port " + HTTP_PORT);
});
