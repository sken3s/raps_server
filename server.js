const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

//Listen at port 5000
const app = express();
const port = process.env.PORT || 5000;

//CORS middleware
app.use(cors());
app.use(express.json());

//MongoDB connection
const uri = process.env.ATLAS_URI221;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

//Routes

const ePointRouter = require("./routes/api/entrancePoints");
const policeRouter = require('./routes/api/policeSignin');
const accidentRouter = require('./routes/api/accidentSubmission');
const eventRouter = require('./routes/api/eventSubmission')
const eTeamRouter = require('./routes/api/eTeam')
const driverRouter = require('./routes/api/driverSignin')
const incidentRouter = require('./routes/api/incidentReporting')
const vehicleRouter = require('./routes/api/driverVehicle')
const publicHolidayRouter = require('./routes/api/publicHoliday')

app.use('/police',policeRouter);
app.use('/accident',accidentRouter);
app.use('/event',eventRouter);
app.use('/eteam', eTeamRouter);
app.use('/driver', driverRouter);
app.use('/incident', incidentRouter);
app.use('/vehicle', vehicleRouter);
app.use("/epoints/", ePointRouter);
app.use("/holiday", publicHolidayRouter);

//Run server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
