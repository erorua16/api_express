//Imports
const db = require('./database');
require('dotenv').config({silent: true})
///routers///
const genreRouter = require('./routers/genreRouter');
const actorRouter = require('./routers/actorRouter');
const filmRouter = require('./routers/filmRouter');
const filmActorRouter = require('./routers/filmActorRouter');
//Defined vars
const express = require("express");
var app = express();
const logger = require('morgan')
var bodyParser = require("body-parser");


//App
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use( (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  });
app.use((req, res, next) => {
  const bearerToken = req.headers.authorization;
  const expectedToken = `Bearer ${process.env.API_KEY}`;

  if (!bearerToken || bearerToken !== expectedToken) {
    console.log(bearerToken);
    console.log(expectedToken);
    res.status(401).json({ error: 'Unauthorized' });
  } else {
    next();
  }
});

//Routes
app.use('/genre', genreRouter);
app.use('/actor', actorRouter);
app.use('/film', filmRouter);
app.use('/filmActors', filmActorRouter)

const HTTP_PORT = 8000
app.listen(HTTP_PORT, () => {
    console.log("Server is listening on port " + HTTP_PORT);
});