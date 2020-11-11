const router = require('express').Router();
let Event = require('../../models/event.model');
let PoliceSession = require('../../models/policeSession.model');

//Sign up (post request)
router.route('/submit').post((req, res) => {
  const { body } = req;
  const {
    datetime,
    type ,
    drivingSide ,
    severity ,
    kmPost  ,
    suburb,
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
                const  newEvent = new Event();
                 newEvent.datetime = datetime;
                 newEvent.type = type;
                 newEvent.drivingSide = drivingSide;
                 newEvent.severity = severity;
                 newEvent.kmPost = kmPost;
                 newEvent.suburb = suburb;
                 newEvent.sessionToken = sessionToken;
                
                 newEvent.save()
                .then(() => 
                    res.send({
                    success:true,
                    message:'Event submitted successfully.'
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