const router = require("express").Router();
let IncidentReport = require("../../models/incidentReport.model");
let DriverSession = require("../../models/driverSession.model");
let PoliceSession = require("../../models/policeSession.model");

//Submit (post request)
router.route("/submit").post((req, res) => {
  const { body } = req;
  const {
    isAccident,
    drivingSide,
    kmPost,
    lat,
    lng,
    sessionToken
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
        newIncident.drivingSide = drivingSide;
        newIncident.kmPost = kmPost;
        newIncident.lat = lat;
        newIncident.lng = lng;
        newIncident.status = 0; //reported
        newIncident.sessionToken = sessionToken;
        newIncident.driverUsername = sessions[0].username;

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
            drivingSide: incidentList[i].drivingSide,
            kmPost: incidentList[i].kmPost,
            lat: incidentList[i].lat,
            lng: incidentList[i].lng,
            status: incidentList[i].status,
            driverUsername: incidentList[i].driverUsername,
            eTeamUsername: incidentList[i].eTeamUsername
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

//Deleting an Incident (for driver. has to be the one who submitted) NOT WORKING
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
    DriverSession.find({   
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
              _id: id, driverUsername:sessions[0].username //RECHECK
          }, function (err, docs) { 
              if (err){ 
                  return res.send({
                      success:false,
                      message:'Error:Server error or Incident invalid'
                  })
              } 
              else{ 
                  return res.send({
                      success:true,
                      message:'Incident deleted'
                  })
              } 
          })
            
                }
            }) 
    });




module.exports = router;
