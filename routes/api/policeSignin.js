const router = require('express').Router();
let Police = require('../../models/police.model');
let PoliceSession = require('../../models/policeSession.model');

/*
//get all polices (get request)
router.route('/').get((req, res) => {
  Police.find()
    .then(polices => res.json(polices))
    .catch(err => res.status(400).json('Error: ' + err));
});
*/

//Sign up (post request)
router.route('/signup').post((req, res) => {
  const { body } = req;
  const {username, name, password, adminRights} = body;
  //Data constraints
  if(!username || username.length<4){
      return res.send({
          success:false,
          message:'Error: Username invalid.'
      })}
    if(!name){
        return res.send({
            success:false,
            message:'Error: Name cannot be blank.'
        })}
    if(!password|| password.length<4){
            return res.send({
                success:false,
                message:'Error: Password invalid.'
            })}
    Police.find({
        username:username
    }, (err, previousPolice)=>{
        if(err){
            return res.send({
                success:false,
                message:'Error: Server error (police find in signin.js)'
            })
        }
        else if(previousPolice.length>0){
            return res.send({
                success:false,
                message:'Error:Username taken.'
            })
        }
        //save to database
        const newPolice = new Police();
        newPolice.username=username;
        newPolice.name=name;
        newPolice.password=newPolice.generateHash(password);
        newPolice.adminRights=adminRights;
        newPolice.save()
        .then(() => res.json('New Police signed up!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
});

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
    Police.find({
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
        const police = users[0];
        if(!police.validPassword(password)){
            return res.send({
                success:false,
                message:'Error:Invalid password'
            })
        }
        //otherwise create user session
        const policeSession = new PoliceSession();
        policeSession.username=police.username;
        policeSession.save((err,doc)=>{
            if(err){
                return res.send({
                    success:false,
                    message:'Error:Server error'
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
    PoliceSession.find({   
            _id:token, 
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
                return res.send({
                    success:true,
                    message:'Session verified'
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
    PoliceSession.findOneAndUpdate({   
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