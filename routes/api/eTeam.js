const router = require("express").Router();
const { startSession } = require('mongoose');
let ETeam = require("../../models/eTeam.model");
let ETeamSession = require('../../models/eTeamSession.model');
let Driver = require("../../models/driver.model");
let DriverSession = require('../../models/driverSession.model');
let IncidentReport = require("../../models/incidentReport.model");
let Accident = require('../../models/accident.model');
let Event = require('../../models/event.model');

//list eteams
router.route("/list").get((req, res) => {
  ETeam.find()
    .then((teams) => res.json(teams))
    .catch((err) => res.status(400).json("SERVER_ERROR"));
});

//Sign in
router.route('/signin').post((req, res) => {
  const { body } = req;
  const {username, password} = body;
  
  if(!username || username.length<4){
      return res.send({
          success:false,
          message:'Error: Username invalid.'
      })}

  if(!password|| password.length<4){
      return res.send({
          success:false,
          message:'Error: Password invalid.'
      })}    
  //find by username
  ETeam.find({
      username:username
  },(err,users)=>{
      if(err){
          return res.send({
              success:false,
              message:'Error:Server error'
          })
      }
      if(users.length!=1){
          return res.send({
              success:false,
              message:'Error:Invalid username (password validation)'
          })
      }
      const eTeam = users[0];
      if(!eTeam.validPassword(password)){
          return res.send({
              success:false,
              message:'Error:Invalid password'
          })
      }
      if(eTeam.isDeleted){
          return res.send({
              success:false,
              message:'Error:Deleted account'
          })
      }
      //otherwise create user session
      const eTeamSession = new ETeamSession();
      eTeamSession.username=eTeam.username;
      eTeamSession.save((err,doc)=>{
          if(err){
              return res.send({
                  success:false,
                  message:'Error:Server error',
              });
          };

          return res.send({
              success:true,
              message:'Valid sign in',
              token:doc._id //session id taken from mongodb doc (record)
          });
      });
      
  });
});

//Verify
router.route('/verifysession').get((req, res) => {
    //get the token
    const { query } =req;
    const { token } = query;
    //verify if its one of a kind and not deleted.
    ETeamSession.find({   
            _id:token, 
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
                return res.send({
                    success:true,
                    message:'Session verified',
                    username:sessions[0].username
                })
            }
})
})



//Logout
router.route('/logout').get((req, res) => {
  //get the token
  const { query } =req;
  const { token } = query;
  //verify if its one of a kind and not deleted.
  ETeamSession.findOneAndUpdate({   
          _id:token, 
          isDeleted:false
      },{
          $set:{isDeleted:true}
      }, null,(err,sessions) =>{
          if(err){
              return res.send({
                  success:false,
                  message:'Error:Server error or Session not found'
              })
          }
          return res.send({
              success:true,
              message:'Session deleted'
          })
})
})


//set Availability
router.route('/availability').post((req, res) => {
    const { body } = req;
    const {sessionToken, value} = body; //eteam session, value
    //Data constraints
    if(typeof value != "boolean"){
        return res.send({
            success:false,
            message:'Error: Value invalid.'
        })}
      if(!sessionToken|| sessionToken.length!=24){
          return res.send({
              success:false,
              message:'Error: Session Token invalid.'
          })}
      //validating session
      ETeamSession.find({   
          _id:sessionToken, 
          isDeleted:false,
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
              //get username
              let username  = sessions[0].username
              //validating update
              ETeam.findOneAndUpdate({
                  username:username,
                  isDeleted:false
              }, {$set:{availability:value}},null,
              (err, eteam)=>{
                  if(err){
                      return res.send({
                          success:false,
                          message:'Error: Server error'
                      })
                  }
                  else{
                      return res.send({
                          success:true,
                          message:'Availability set.',
                          value:value
                      })
                  }
              })
          }
          })
      });


//set Location
router.route('/location').post((req, res) => {
    const { body } = req;
    const {sessionToken, lat, lng} = body; //eteam session, value
    //Data constraints
    if(typeof lat != "string" || typeof lng != "string"){ //Update this condition
        return res.send({
            success:false,
            message:'Error: Values invalid.'
        })}
      if(!sessionToken|| sessionToken.length!=24){
          return res.send({
              success:false,
              message:'Error: Session Token invalid.'
          })}
      //validating session
      ETeamSession.find({   
          _id:sessionToken, 
          isDeleted:false,
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
              //get username
              let username  = sessions[0].username
              //validating update
              ETeam.findOneAndUpdate({
                  username:username,
                  isDeleted:false
              }, {$set:{lat:lat,lng:lng}},null,
              (err, eteam)=>{
                  if(err){
                      return res.send({
                          success:false,
                          message:'Error: Server error'
                      })
                  }
                  else{
                      return res.send({
                          success:true,
                          message:'Location set.',
                          lat:lat,
                          lng:lng
                      })
                  }
              })
          }
          })
      });

//Listing Incidents filtered by status(reported) and drivingSide
router.route('/incidents/reported').post((req, res) => {
    const { body } = req;
    const { drivingSide, sessionToken} = body; // session token of eTeamSession
        //Data constraints
      if(typeof drivingSide != "boolean"){
            return res.send({
                success:false,
                message:'Error: Driving Side invalid.'
            })}
      if(!sessionToken|| sessionToken.length!=24){
          return res.send({
              success:false,
              message:'Error: Session Token invalid.'
          })}
      //validating session
      ETeamSession.find({   
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
                  status:0,
                  drivingSide:drivingSide
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
                        lng: incidentList[i].lng
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

//Listing Incidents filtered by status(handled) and username
router.route('/incidents/handled').post((req, res) => {
    const { body } = req;
    const { sessionToken} = body; // session token of eTeamSession
        //Data constraints
      if(!sessionToken|| sessionToken.length!=24){
          return res.send({
              success:false,
              message:'Error: Session Token invalid.'
          })}
      //validating session
      ETeamSession.find({   
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
                  status:2,
                  eTeamUsername:sessions[0].username
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
                        driverUsername:  incidentList[i].driverUsername
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

//Chosing incident for handling.
router.route('/dispatch').post( async (req, res) => {
    const { body } = req;
    const { id, sessionToken} = body; // id of incident, session token of eTeamSession
        //Data constraints
        if(!id|| id.length!=24){
            return res.send({
                success:false,
                message:'Error: Incident ID invalid.'
            })}
        if(!sessionToken|| sessionToken.length!=24){
            return res.send({
              success:false,
              message:'Error: Session Token invalid.'
            })}
      //validating eTeam
    ETeamSession.find(
          {   
        _id:sessionToken, 
        isDeleted:false
    }, async (err,sessions) => {
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
            //start transaction
            const transactionSession = await startSession();
            transactionSession.startTransaction();
            try {
                //reads
                let eTeam = await ETeam.findOne(
                    { username: sessions[0].username}).session(transactionSession);

                if(!eTeam.availability){
                    throw new Error('ETeam unavailable');
                }

                let incident = await IncidentReport.findOne(
                    { _id:id}).session(transactionSession);

                if(incident.eTeamUsername || incident.status!=0){
                    throw new Error('Incident unavailable');
                }

                //set values
                eTeam.availability= false;       
                incident.status= 1;
                incident.eTeamUsername= eTeam.username;

                //save
                await eTeam.save();
                await incident.save();

                await transactionSession.commitTransaction()

            } catch (err) {
                await transactionSession.abortTransaction()
                return res.send({
                    success: false,
                    message: err.message
                  });
            }
            transactionSession.endSession()
            return res.send({
                success: true,
                message: "Emergency Team Dispatched."
            });
                }
            }) 
      });

//Complete incident handling.
router.route('/complete').post( async (req, res) => {
    const { body } = req;
    const { id, sessionToken} = body; // id of incident, session token of eTeamSession
        //Data constraints
        if(!id|| id.length!=24){
            return res.send({
                success:false,
                message:'Error: Incident ID invalid.'
            })}
        if(!sessionToken|| sessionToken.length!=24){
            return res.send({
              success:false,
              message:'Error: Session Token invalid.'
            })}
      //validating eTeam
    ETeamSession.find(
          {   
        _id:sessionToken, 
        isDeleted:false
    }, async (err,sessions) => {
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
            //start transaction
            const transactionSession = await startSession();
            transactionSession.startTransaction();
            try {
                //reads
                let eTeam = await ETeam.findOne(
                    { username: sessions[0].username}).session(transactionSession);

                if(eTeam.availability){
                    throw new Error('ETeam unavailable');
                }

                let incident = await IncidentReport.findOne(
                    { _id:id}).session(transactionSession);

                if(incident.eTeamUsername!=eTeam.username || incident.status!=1){
                    throw new Error('Incident unavailable');
                }

                //set values
                eTeam.availability= true;       
                incident.status= 2;

                //save
                await eTeam.save();
                await incident.save();

                await transactionSession.commitTransaction()

            } catch (err) {
                await transactionSession.abortTransaction()
                return res.send({
                    success: false,
                    message: err.message
                  });
            }
            transactionSession.endSession()
            return res.send({
                success: true,
                message: "Incident handling completed."
            });
                }
            }) 
      });


//NOT WORKING. Report the incident as a false alarm. Blocks the driver who reported from further incident reports.
router.route('/falsealarm').post( async (req, res) => {
    const { body } = req;
    const { id, sessionToken} = body; // id of incident, session token of eTeamSession
        //Data constraints
        if(!id|| id.length!=24){
            return res.send({
                success:false,
                message:'Error: Incident ID invalid.'
            })}
      if(!sessionToken|| sessionToken.length!=24){
          return res.send({
              success:false,
              message:'Error: Session Token invalid.'
          })}
      //validating eTeam
      ETeamSession.find({   
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
            //find incident
            IncidentReport.find(
              {
                _id:id,
                eTeamUsername:sessions[0].username,
                status:1
              },
              async (err, incidentList) => {
                if (err) {
                  return res.send({
                    success: false,
                    message: "Error:Server error",
                  });
                } else {
                    //start transaction
                    const transactionSession = await startSession();
                    try {
                        transactionSession.startTransaction()

                        let doc = await ETeam.findOneAndUpdate(
                            { username: sessions[0].username, availability: false }, { $set: { availability: true } }, {transactionSession});
                        
                        if(!doc){
                            await transactionSession.abortTransaction()
                            res.send('ETeam unavailable '+sessions[0].username)
                            transactionSession.endSession()
                        }else{
                            let doc2 = await IncidentReport.findOneAndDelete(
                                { _id:id, eTeamUsername:sessions[0].username, status:1 }, {transactionSession});
                            
                            if(!doc2){
                                    await transactionSession.abortTransaction()
                                    res.send('Incident unavailable')
                                    transactionSession.endSession()
                                }
                            else{
                                let doc3 = await Driver.findOneAndUpdate(
                                    { username: incidentList[0].username }, { $set: { isBlocked: true } }, {transactionSession});
                                
                                if(!doc3){
                                    await transactionSession.abortTransaction()
                                    res.send('Driver unavailable '+incidentList[0].username)
                                    transactionSession.endSession()
                                }
                                else{
                                    await DriverSession.updateMany(
                                        { username: incidentList[0].username }, { $set: { isBlocked: true } }, {transactionSession});               
                                    await transactionSession.commitTransaction()
                                    transactionSession.endSession()
                                    res.send('ETeam completion transaction successfull')
                                }
                            }
                        }

       
                    } catch (err) {
                        await transactionSession.abortTransaction()
                        transactionSession.endSession()
                        console.log(err)
                        res.send('Error when execution eteam/complete')
                    }

          
                  return res.send({
                    success: true,
                    message: "FalseAlarm reported"
                  });
                }
              }
            );
                }
            }) 
      });
   


module.exports = router;
