const router = require('express').Router();
let Accident = require('../../models/accident.model');
let PoliceSession = require('../../models/policeSession.model');

//Submit (post request)
router.route('/submit').post((req, res) => {
  const { body } = req;
  const {
    datetime,
    driverAge,
    driverGender,
    weather ,
    vehicleType ,
    vehicleYOM  ,
    licenseIssueDate,
    drivingSide ,
    severity ,
    reason ,
    kmPost  ,
    suburb,
    operatedSpeed,
    drowsiness,
    enough_gap,
    animal_crossing_problem,
    vehicle_condition,
    roadSurface,
    sessionToken
} = body;
  //Data constraints
  if(!datetime){
      return res.send({
          success:false,
          message:'Error: Date/Time invalid.'
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
        if(sessions.length!=1){
            return res.send({
                success:false,
                message:'Error:Invalid Session'
            })
        }else{
                //save to database
                const  newAccident = new Accident();
                 newAccident.datetime = datetime;
                 newAccident.driverAge = driverAge;
                 newAccident.driverGender = driverGender;
                 newAccident.weather = weather;
                 newAccident.vehicleType = vehicleType;
                 newAccident.vehicleYOM = vehicleYOM;
                 newAccident.licenseIssueDate = licenseIssueDate;
                 newAccident.drivingSide = drivingSide;
                 newAccident.severity = severity;
                 newAccident.reason = reason;
                 newAccident.kmPost = kmPost;
                 newAccident.suburb = suburb;
                 newAccident.operatedSpeed = operatedSpeed;
                 newAccident.status = "reported";
                 newAccident.drowsiness=drowsiness,
                 newAccident.enough_gap=enough_gap,
                 newAccident.animal_crossing_problem=animal_crossing_problem,
                 newAccident.vehicle_condition=vehicle_condition,
                 newAccident.roadSurface=roadSurface,
                 newAccident.sessionToken = sessionToken;
                 
                 newAccident.save()
                .then(() => 
                    res.send({
                    success:true,
                    message:'Accident submitted successfully.'
                })
                )
                .catch(err => res.send({
                    success:false,
                    message:'Error:Data Validation Error'
                })
                )

            }
        }
        )
    });



//List All Accidents
router.route('/list').get((req,res) => {
    Accident.find({   
            //finds without filter
        }, (err,accidentList) =>{
            if(err){
                return res.send({
                    success:false,
                    message:'Error:Server error'
                })
            }else{
                let data=[];
                for(i in accidentList){
                   data.push({
                        'id':accidentList[i]._id,
                        'datetime':accidentList[i].datetime, 
                        'driverAge':accidentList[i].driverAge,
                        'driverGender':accidentList[i].driverGender,
                        'weather':accidentList[i].weather,
                        'vehicleType':accidentList[i].vehicleType,
                        'vehicleYOM':accidentList[i].vehicleYOM,
                        'licenseIssueDate':accidentList[i].licenseIssueDate,
                        'drivingSide':accidentList[i].drivingSide,
                        'severity':accidentList[i].severity,
                        'reason':accidentList[i].reason,
                        'kmPost':accidentList[i].kmPost,
                        'suburb':accidentList[i].suburb,
                        'operatedSpeed':accidentList[i].operatedSpeed,
                        'status':accidentList[i].status
                })
                }

                return res.send({
                    success:true,
                    message:'List received',
                    data:data
                })
            }
})
})

//Deleting an accident
router.route('/delete').delete((req, res) => {
    const { body } = req;
    const {id, sessionToken} = body; //id of accident to be deleted, session token of police user 
        //Data constraints
    if(!id || id.length!=24){
        return res.send({
            success:false,
            message:'Error: Accident invalid.'
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
              //validating accident deletion
              Accident.findOneAndDelete({
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
                        message:'Accident deleted'
                    })
                } 
            })
              
                  }
              }) 
      });

  

module.exports = router;