const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

//Listen at port 5000
const app = express();
const port = process.env.PORT || 5000;

//CORS middleware
app.use(cors());
app.use(express.json());

//MongoDB connection
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

//Routes
const exercisesRouter = require('./routes/p_exercises');
const usersRouter = require('./routes/p_users');

app.use('/exercises',exercisesRouter);
app.use('/users',usersRouter);


//Run server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});