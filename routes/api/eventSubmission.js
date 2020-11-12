const router = require('express').Router();
let Event = require('../../models/event.model');
let PoliceSession = require('../../models/policeSession.model');

//Submit (post request)
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
                 newEvent.status = "reported";
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




//List All Events
router.route('/list').get((req,res) => {
    Event.find({   
            //finds without filter
        }, (err,eventList) =>{
            if(err){
                return res.send({
                    success:false,
                    message:'Error:Server error'
                })
            }else{
                let data=[];
                for(i in eventList){
                   data.push({
                        'id':eventList[i]._id,
                        'datetime':eventList[i].datetime, 
                        'type':eventList[i].type,
                        'drivingSide':eventList[i].drivingSide,
                        'severity':eventList[i].severity,
                        'kmPost':eventList[i].kmPost,
                        'suburb':eventList[i].suburb,
                        'status':eventList[i].status
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

//Deleting an event
router.route('/delete').delete((req, res) => {
    const { body } = req;
    const {id, sessionToken} = body; //id of event to be deleted, session token of police user 
        //Data constraints
    if(!id || id.length!=24){
        return res.send({
            success:false,
            message:'Error: Event invalid.'
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
              Event.findOneAndDelete({
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