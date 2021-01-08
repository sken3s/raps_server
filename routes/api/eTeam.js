const router = require("express").Router();
let ETeam = require("../../models/eTeam.model");
let ETeamSession = require('../../models/eTeamSession.model');

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



module.exports = router;
