const router = require('express').Router();
let User = require('../models/p_user.model');

//get all users
router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

//add users (post request)
router.route('/add').post((req, res) => {
  const username = req.body.username;
  const newUser = new User({username});
  //save to database
  newUser.save()
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;