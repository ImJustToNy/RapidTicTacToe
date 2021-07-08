const express = require('express');
const createError = require('http-errors');
const logger = require('morgan');
const cors = require('cors')

require('dotenv').config();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/game', require('./routes/game'));

app.listen(process.env.PORT);
