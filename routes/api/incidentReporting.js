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
      isBlocked: false
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
        //add a way to check if reported/dispatched status incidents within 100m are there in the DB.
        //if not:
        //update to database

        const newIncident = new IncidentReport();
        newIncident.isAccident = isAccident;
        newIncident.drivingSide = drivingSide;
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

//List Handled Incidents
router.route("/list").get((req, res) => {
  IncidentReport.find(
    {
      status:2
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


//Listing Incidents by driver (report history)
router.route('/driver/reported').post((req, res) => {
  const { body } = req;
  const { sessionToken} = body; // session token of driverSession
      //Data constraints
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
            //incident list
            IncidentReport.find(
              {
                driverUsername:sessions[0].username,
                status:0
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
                }
            }) 
    });




//Deleting an Incident (for driver. has to be the one who submitted)
router.route('/delete').delete((req, res) => {
  const { body } = req;
  const {id, sessionToken} = body; //id of incident to be deleted, session token of driverSession 
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
              _id: id, 
              driverUsername:sessions[0].username
          }, function (err, docs) { 
              if (err){ 
                  return res.send({
                      success:false,
                      message:'Error:Server error or Incident invalid',
                      error:err
                  })
              }
              else if(!docs){ 
                return res.send({
                    success:false,
                    message:'Incident not found',
                    deletedRecord:docs
                })
            }  
              else{ 
                  return res.send({
                      success:true,
                      message:'Incident deleted',
                      deletedRecord:docs
                  })
              } 
          })
            
                }
            }) 
    });

//Deleting an Incident (for police)
router.route('/police/delete').delete((req, res) => {
  const { body } = req;
  const {id, sessionToken} = body; //id of incident to be deleted, session token of police session 
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
                      message:'Error:Server error or Incident invalid',
                      error:err
                  })
              }
              else if(!docs){ 
                return res.send({
                    success:false,
                    message:'Incident not found',
                    deletedRecord:docs
                })
            }  
              else{ 
                  return res.send({
                      success:true,
                      message:'Incident deleted',
                      deletedRecord:docs
                  })
              } 
          })
            
                }
            }) 
    });




module.exports = router;
