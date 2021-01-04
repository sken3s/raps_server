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



module.exports = router;
