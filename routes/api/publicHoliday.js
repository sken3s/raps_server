const router = require('express').Router();
let PublicHoliday = require('../../models/publicHoliday.model');
let PoliceSession = require('../../models/policeSession.model');

//Add (post request)
router.route('/add').post((req, res) => {
  const { body } = req;
  const {
    date,
    name,
    sessionToken
} = body;
  //Data constraints
  if(!date){
      return res.send({
          success:false,
          message:'Error: Date invalid.'
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
                const  newPublicHoliday = new PublicHoliday();
                 newPublicHoliday.date = date;
                 newPublicHoliday.name = name;
                 newPublicHoliday.sessionToken = sessionToken;
                 newPublicHoliday.save()
                .then(() => 
                    res.send({
                    success:true,
                    message:'Public Holiday added successfully.'
                })
                )
                .catch(err => res.send({
                    success:false,
                    message:'Data Validation Error: Date might already be set as holiday.',
                })
                )

            }
        }
        )
    });




//List All PublicHolidays
router.route('/list').get((req,res) => {
    PublicHoliday.find({   
            //finds without filter
        }, (err,publicHolidayList) =>{
            if(err){
                return res.send({
                    success:false,
                    message:'Error:Server error'
                })
            }else{
                let data=[];
                for(i in publicHolidayList){
                    console.log(publicHolidayList[i].date)
                   data.push({
                        'id':publicHolidayList[i]._id,
                        'date':publicHolidayList[i].date, 
                        'name':publicHolidayList[i].name
                })
                }

                return res.send({
                    success:true,
                    message:'List received',
                    data:data
                })
            }
}).sort({'date':0})
})

//Deleting an publicHoliday
router.route('/delete').delete((req, res) => {
    const { body } = req;
    const {id, sessionToken} = body; //id of publicHoliday to be deleted, session token of police user 
        //Data constraints
    if(!id || id.length!=24){
        return res.send({
            success:false,
            message:'Error: Public Holiday invalid.'
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
              //validating publicHoliday deletion
              PublicHoliday.findOneAndDelete({
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
                        message:'PublicHoliday deleted'
                    })
                } 
            })
              
                  }
              }) 
      });

//Updating public holiday
router.route('/update').post((req, res) => {
    const { body } = req;
    const {
        id,
        date,
        name,
        sessionToken
    } = body;
    //Data constraints
    if (!date) {
        return res.send({
            success: false,
            message: 'Error: Date invalid.'
        })
    }
    if (!sessionToken || sessionToken.length != 24) {
        return res.send({
            success: false,
            message: 'Error: Session Token invalid.'
        })
    }
    if (!id || id.length != 24) {
        return res.send({
            success: false,
            message: 'Error: PublicHoliday ID invalid.'
        })
    }
    //validating session
    PoliceSession.find({
        _id: sessionToken,
        isDeleted: false
    }, (err, sessions) => {
        if (err) {
            return res.send({
                success: false,
                message: 'Error:Server error or Session not found'
            })
        }
        if (sessions.length != 1) {
            return res.send({
                success: false,
                message: 'Error:Invalid Session'
            })
        } else {
            //validating publicHoliday update
            PublicHoliday.findOneAndUpdate({
                _id: id
            }, {
                $set: {
                    date: date,
                    name: name,
                    sessionToken: sessionToken
                }
            }, null,
                (err, publicHoliday) => {
                    if (err) {
                        return res.send({
                            success: false,
                            message: 'Error: Server error'
                        })
                    }
                    else {
                        return res.send({
                            success: true,
                            message: 'Public Holiday Updated.',
                            data: publicHoliday
                        })
                    }
                })
        }
    }
    )
});



module.exports = router;