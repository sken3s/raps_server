const router = require("express").Router();
let IncidentReport = require("../../models/incidentReport.model");
let DriverSession = require("../../models/driverSession.model");
let PoliceSession = require("../../models/policeSession.model");

//Submit (post request)
router.route("/submit").post((req, res) => {
  const { body } = req;
  const {
    isAccident,
    weather,
    vehicleType,
    drivingSide,
    severity,
    kmPost,
    suburb,
    operatedSpeed,
    sessionToken,
  } = body;
  //Data constraints

  if (!sessionToken || sessionToken.length != 24) {
    return res.send({
      success: false,
      message: "Error: Session Token invalid.",
    });
  }
  //validating session
  DriverSession.find(
    {
      _id: sessionToken,
      isDeleted: false,
    },
    (err, sessions) => {
      if (err) {
        return res.send({
          success: false,
          message: "Error:Server error or Session not found",
        });
      }
      if (sessions.length != 1) {
        return res.send({
          success: false,
          message: "Error:Invalid Session",
        });
      } else {
        //update to database

        const newIncident = new IncidentReport();

        newIncident.isAccident = isAccident;
        newIncident.weather = weather;
        newIncident.vehicleType = vehicleType;
        newIncident.drivingSide = drivingSide;
        newIncident.severity = severity;
        newIncident.kmPost = kmPost;
        newIncident.suburb = suburb;
        newIncident.operatedSpeed = operatedSpeed;
        newIncident.sessionToken = sessionToken;

        newIncident
          .save()
          .then(() =>
            res.send({
              success: true,
              message: "Report submitted successfully.",
            })
          )
          .catch((err) =>
            res.send({
              success: false,
              message: "Error:Data Validation Error",
            })
          );
      }
    }
  );
});

//Submit (post request)
router.route("/update").post((req, res) => {
  const { body } = req;
  const {
    id,
    isAccident,
    weather,
    vehicleType,
    drivingSide,
    severity,
    kmPost,
    suburb,
    operatedSpeed,
    sessionToken,
  } = body;
  //Data constraints

  if (!id || id.length != 24) {
    return res.send({
      success: false,
      message: "Error: Incident invalid." + id,
    });
  }

  if (!sessionToken || sessionToken.length != 24) {
    return res.send({
      success: false,
      message: "Error: Session Token invalid.",
    });
  }

  //validating session
  DriverSession.find(
    {
      _id: sessionToken,
      isDeleted: false,
    },
    (err, sessions) => {
      if (err) {
        return res.send({
          success: false,
          message: "Error:Server error or Session not found",
        });
      }
      if (sessions.length != 1) {
        return res.send({
          success: false,
          message: "Error:Invalid Session",
        });
      } else {
        //update dB
        const updateIncident = new IncidentReport();

        updateIncident.isAccident = isAccident;
        updateIncident.weather = weather;
        updateIncident.vehicleType = vehicleType;
        updateIncident.drivingSide = drivingSide;
        updateIncident.severity = severity;
        updateIncident.kmPost = kmPost;
        updateIncident.suburb = suburb;
        updateIncident.operatedSpeed = operatedSpeed;
        updateIncident.sessionToken = sessionToken;

        console.log(updateIncident);
        IncidentReport.findOneAndUpdate(
          { _id: id },
          updateIncident,
          { upsert: true },
          function (err, doc) {
            if (err) return res.send(500, { error: err });
            return res.send("Succesfully saved.");
          }
        );
      }
    }
  );
});

//List All Incidents
router.route("/list").get((req, res) => {
  IncidentReport.find(
    {
      //finds without filter
    },
    (err, incidentList) => {
      if (err) {
        return res.send({
          success: false,
          message: "Error:Server error",
        });
      } else {
        let data = [];
        for (i in incidentList) {
          data.push({
            id: incidentList[i]._id,
            datetime: incidentList[i].datetime,
            isAccident: incidentList[i].isAccident,
            weather: incidentList[i].weather,
            vehicleType: incidentList[i].vehicleType,
            drivingSide: incidentList[i].drivingSide,
            severity: incidentList[i].severity,
            kmPost: incidentList[i].kmPost,
            suburb: incidentList[i].suburb,
            operatedSpeed: incidentList[i].operatedSpeed
          });
        }

        return res.send({
          success: true,
          message: "List received",
          data: data,
        });
      }
    }
  );
});

//Deleting an Incident
router.route('/delete').delete((req, res) => {
  const { body } = req;
  const {id, sessionToken} = body; //id of incident to be deleted, session token of police user 
      //Data constraints
  if(!id || id.length!=24){
      return res.send({
          success:false,
          message:'Error: Incident invalid.'
      })}
    if(!sessionToken|| sessionToken.length!=24){
        return res.send({
            success:false,
            message:'Error: Session Token invalid.'
        })}
    //validating session
    PoliceSession.find({   
        _id:sessionToken, 
        isDeleted:false
    }, (err,sessions) =>{
        if(err){
            return res.send({
                success:false,
                message:'Error:Server error or Session not found'
            })
        }
        if(sessions.length!=1 || sessions[0].isDeleted){
            return res.send({
                success:false,
                message:'Error:Invalid Session'
            })
        }else{
            //validating event deletion
            IncidentReport.findOneAndDelete({
              _id: id
          }, function (err, docs) { 
              if (err){ 
                  return res.send({
                      success:false,
                      message:'Error:Server error'
                  })
              } 
              else{ 
                  return res.send({
                      success:true,
                      message:'Event deleted'
                  })
              } 
          })
            
                }
            }) 
    });




module.exports = router;
