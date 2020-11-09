const router = require('express').Router();
let Accident = require('../../models/accident.model');
let PoliceSession = require('../../models/policeSession.model');

//Sign up (post request)
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
                 newAccident
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
                 newAccident.sessionToken = sessionToken;
                 
    /*driverAge,
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
    sessionToken*/
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


module.exports = router;