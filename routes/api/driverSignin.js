const router = require('express').Router();
let Driver = require('../../models/driver.model');
let DriverSession = require('../../models/driverSession.model');

//List All Driver Accounts (only for testing)
router.route('/list').get((req,res) => {
    Driver.find({   
            isDeleted:false
        }, (err,driverList) =>{
            if(err){
                return res.send({
                    success:false,
                    message:'Error:Server error'
                })
            }else{
                let data=[];
                for(i in driverList){
                    let driver= driverList[i];
                    //view all driver details. only for implementation purposes. change this later.
                   data.push(driver)
                }

                return res.send({
                    success:true,
                    message:'List received',
                    data:data
                })
            }
})
})


/*{
  username: { type: String, required: true, unique: true },
  name: { type: String, default:'' },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  licenseIssueDate: { type: Date, required: true },
  isDeleted:{type:Boolean, default:false} //whether user is deleted or not 
}*/

//Sign up (post request)
router.route('/signup').post((req, res) => {
  const { body } = req;
  const {username, name, password, age, gender, licenseIssueDate} = body; 
  //Data constraints
  if(username.length<4){
      return res.send({
          success:false,
          message:'Error: Username invalid.'
      })}
    if(!username || !password){
        return res.send({
            success:false,
            message:'Error: Fields cannot be empty.'
        })}
    if(password.length<4){
            return res.send({
                success:false,
                message:'Error: Password invalid.'
            })}
    
    
            //validating driver user creation
            Driver.find({
                username:username
            }, (err, previousDriver)=>{
                if(err){
                    return res.send({
                        success:false,
                        message:'Error: Server error (driver find in signin.js)'
                    })
                }
                else if(previousDriver.length>0){
                    return res.send({
                        success:false,
                        message:'Error:Username taken.'
                    })
                }
                //save to database
                const newDriver = new Driver();
                newDriver.username=username;
                newDriver.name=name;
                newDriver.password=newDriver.generateHash(password);
                newDriver.age=age;
                newDriver.gender=gender;
                newDriver.licenseIssueDate=licenseIssueDate;
                newDriver.save()
                .then(() => 
                    res.send({
                    success:true,
                    message:'New driver signed up.'
                })
                )
                .catch(err => res.status(400).json('Error: ' + err));
            })
        }
    );

//Password Validation/ Sign in
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
    Driver.find({
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
        const driver = users[0];
        if(!driver.validPassword(password)){
            return res.send({
                success:false,
                message:'Error:Invalid password'
            })
        }
        if(driver.isDeleted){
            return res.send({
                success:false,
                message:'Error:Deleted account'
            })
        }
        //otherwise create user session
        const driverSession = new DriverSession();
        driverSession.username=driver.username;
        driverSession.save((err,doc)=>{
            if(err){
                return res.send({
                    success:false,
                    message:'Error:Server error'
                });
            };

            return res.send({
                success:true,
                message:'Valid sign in',
                token:doc._id //session id taken from mongodb doc (record). save this to state and localStorage
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
    DriverSession.find({   
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
    DriverSession.findOneAndUpdate({   
            _id:token, 
            isDeleted:false
        },{
            $set:{isDeleted:true}
        },
         null,(err,sessions) =>{
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


//Deleting (Self)
router.route('/delete').delete((req, res) => {
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
    Driver.find({
        username:username,
        isDeleted:false
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
                message:'Error:Invalid username'
            })
        }
        const driver = users[0];
        if(!driver.validPassword(password)){
            return res.send({
                success:false,
                message:'Error:Invalid password'
            })
        }
        if(driver.isDeleted){
            return res.send({
                success:false,
                message:'Error:Account already deleted'
            })
        }
        //otherwise create user session
        Driver.findOneAndUpdate({   
            username:username,
            isDeleted:false
        },{
            $set:{isDeleted:true}
        }, null,(err,sessions) =>{
            if(err){
                return res.send({
                    success:false,
                    message:'Error:Server error or Driver not found'
                })
            }
            return res.send({
                success:true,
                message:'Driver deleted'
            })
        })
    });
});

//Updating password
router.route('/changepassword').post((req, res) => {
    const { body } = req;
    const {sessionToken, oldpassword, newpassword } = body; //username of account to be updated, session token of an admin should be added
    //Data constraints
    if (!oldpassword || !newpassword || oldpassword.length < 4 ||newpassword.length < 4) {
        return res.send({
            success: false,
            message: 'Error: Password invalid.'
        })
    }
    if (!sessionToken || sessionToken.length != 24) {
        return res.send({
            success: false,
            message: 'Error: Session Token invalid.'
        })
    }
    //validating session
    DriverSession.find({
        _id: sessionToken,
        isDeleted: false
    }, (err, sessions) => {
        if (err) {
            return res.send({
                success: false,
                message: 'Error:Server error or Session not found'
            })
        }
        if (sessions.length != 1 || sessions[0].isDeleted) {
            return res.send({
                success: false,
                message: 'Error:Invalid Session'
            })
        } else {
            //validate password
            Driver.find({
                username: sessions[0].username
            }, (err, users) => {
                if (err) {
                    return res.send({
                        success: false,
                        message: 'Error:Server error'
                    })
                }
                if (users.length != 1) {
                    return res.send({
                        success: false,
                        message: 'Error : Invalid username'
                    })
                }
                const driver = users[0];
                if (!driver.validPassword(oldpassword)) {
                    return res.send({
                        success: false,
                        message: 'Error :Invalid password'
                    })
                }
                if (driver.isDeleted) {
                    return res.send({
                        success: false,
                        message: 'Error:Deleted account'
                    })
                }
                //update password
                Driver.findOneAndUpdate({
                    username: sessions[0].username,
                    isDeleted: false
                }, { $set: { password: driver.generateHash(newpassword) } }, null,
                    (err, driver) => {
                        if (err) {
                            return res.send({
                                success: false,
                                message: 'Error: Server error'
                            })
                        }
                        else {
                            return res.send({
                                success: true,
                                message: 'Password updated.'
                            })
                        }
                    })
        
            });
        }
    })
});

   

module.exports = router;