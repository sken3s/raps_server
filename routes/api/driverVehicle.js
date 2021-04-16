const router = require('express').Router();
let Vehicle = require('../../models/vehicle.model');
let DriverSession = require('../../models/driverSession.model');
let Driver = require('../../models/driver.model');

/*username: { type: String, required: true}, //vehicle username
  regno: { type: String, default:'' }, //registration number
  type: { type: String, default:'' }, //vehicle type
  yom: { type: String, default:'' }, //vehicle year of manufacture
*/



//Add vehicle (post request)
router.route('/add').post((req, res) => {
  const { body } = req;
  const {
    regno,
    type,
    yom,
    sessionToken
} = body;
  //Data constraints
  if(!regno){
      return res.send({
          success:false,
          message:'Error: Registration number invalid.'
      })}
    if(!sessionToken|| sessionToken.length!=24){
        return res.send({
            success:false,
            message:'Error: Session Token invalid.'
        })}
    if(!type|| !yom){
        return res.send({
            success:false,
            message:'Error: Fields cannot be empty.'
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
        if(sessions.length!=1){
            return res.send({
                success:false,
                message:'Error:Invalid Session'
            })
        }
        else{
                //validate unique entry
                const username = sessions[0].username; 
                Vehicle.find({
                    username:username,
                    regno:regno
                },(err,vehicles) =>{
                    if(err){
                        return res.send({
                            success:false,
                            message:'Error:Server error'
                        })
                    }else
                    if(vehicles.length!=0){
                        return res.send({
                            success:false,
                            message:'Error:Vehicle already added'
                        })
                    }else{
                        const  newVehicle = new Vehicle();
                 newVehicle.username = username;
                 newVehicle.regno = regno;
                 newVehicle.type = type;
                 newVehicle.yom = yom;
                 newVehicle.save()
                .then(() => 
                    res.send({
                    success:true,
                    message:'Vehicle submitted successfully.'
                })
                )
                .catch(err => res.send({
                    success:false,
                    message:'Error:Data Validation Error',
                    err:err
                })
                )

                    }
                })
                

            }
        }
        )
    });



//Remove vehicle (delete request)
router.route('/remove').delete((req, res) => {
    const { body } = req;
    const {
      regno,
      sessionToken
  } = body;
    //Data constraints
    if(!regno){ //registration number RegEx should be written
        return res.send({
            success:false,
            message:'Error: Registration number invalid.'
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
          if(sessions.length!=1){
              return res.send({
                  success:false,
                  message:'Error:Invalid Session'
              })
          }
          else{
                  //validate unique entry
                  const username = sessions[0].username; 
                  Vehicle.find({
                      username:username,
                      regno:regno
                  },(err,vehicles) =>{
                      if(err){
                          return res.send({
                              success:false,
                              message:'Error:Server error'
                          })
                      }else
                      if(vehicles.length!=1){
                          return res.send({
                              success:false,
                              message:'Error:Vehicle does not exist'
                          })
                      }else{
                        Vehicle.findOneAndDelete({
                            regno: regno,
                            username:username
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
                                    message:'Vehicle deleted'
                                })
                            } 
                        }); 
  
                      }
                  })
                  
  
              }
          }
          )
      });
  
  
  

//List All Vehicles (for testing)
router.route('/listall').get((req,res) => {
    Vehicle.find({   
        }, (err,vehicleList) =>{
            if(err){
                return res.send({
                    success:false,
                    message:'Error:Server error'
                })
            }else{
                let data=[];
                for(i in vehicleList){
                    let vehicle= vehicleList[i];
                    //view all vehicle details. only for implementation purposes. change this later.
                   data.push(vehicle)
                }

                return res.send({
                    success:true,
                    message:'List received',
                    data:data
                })
            }
})
})


//List vehicles linked to driver (post request)
router.route('/list').post((req, res) => {
    const { body } = req;
    const {
      sessionToken
  } = body;
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
          if(sessions.length!=1){
              return res.send({
                  success:false,
                  message:'Error:Invalid Session'
              })
          }
          else{
                  //session validated
                  const username = sessions[0].username; 
                  Vehicle.find({
                      username:username,
                  },(err,vehicleList) =>{
                      if(err){
                          return res.send({
                              success:false,
                              message:'Error:Server error'
                          })
                      }else{
                        let data=[];
                        for(i in vehicleList){
                            let vehicle= vehicleList[i];
                           data.push(vehicle)
                        }
        
                        return res.send({
                            success:true,
                            message:'List received',
                            data:data
                        })
                    }
                      
                  })
                  
  
              }
          }
          )
      });
  
  


module.exports = router;