const router = require('express').Router();
let Police = require('../../models/police.model');
let PoliceSession = require('../../models/policeSession.model');

let ETeam = require('../../models/eTeam.model');
let ETeamSession = require('../../models/eTeamSession.model');

//List All Police Accounts
router.route('/list').get((req, res) => {
    Police.find({
        isDeleted: false
    }, (err, policeList) => {
        if (err) {
            return res.send({
                success: false,
                message: 'Error:Server error'
            })
        } else {
            let data = [];
            for (i in policeList) {
                let username = policeList[i].username;
                let name = policeList[i].name;
                let adminRights = policeList[i].adminRights;
                data.push({ 'username': username, 'name': name, 'adminRights': adminRights })
            }

            return res.send({
                success: true,
                message: 'List received',
                data: data
            })
        }
    })
})



//Sign up (post request)
router.route('/signup').post((req, res) => {
    const { body } = req;
    const { username, name, password, adminRights, sessionToken } = body; //session token of an admin should be added
    //Data constraints
    if (!username || username.length < 4) {
        return res.send({
            success: false,
            message: 'Error: Username invalid.'
        })
    }
    if (!name) {
        return res.send({
            success: false,
            message: 'Error: Name cannot be blank.'
        })
    }
    if (!password || password.length < 4) {
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
    //validating admin session
    PoliceSession.find({
        _id: sessionToken,
        isDeleted: false,
        adminRights: true
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
            //validating police user creation
            Police.find({
                username: username
            }, (err, previousPolice) => {
                if (err) {
                    return res.send({
                        success: false,
                        message: 'Error: Server error (police find in signin.js)'
                    })
                }
                else if (previousPolice.length > 0) {
                    return res.send({
                        success: false,
                        message: 'Error:Username taken.'
                    })
                }
                //save to database
                const newPolice = new Police();
                newPolice.username = username;
                newPolice.name = name;
                newPolice.password = newPolice.generateHash(password);
                newPolice.adminRights = adminRights;
                newPolice.save()
                    .then(() =>
                        res.send({
                            success: true,
                            message: 'New user signed up.'
                        })
                    )
                    .catch(err => res.status(400).json('Error: ' + err));
            })
        }
    })
});

//Password Validation/ Sign in
router.route('/signin').post((req, res) => {
    const { body } = req;
    const { username, password } = body;

    if (!username || username.length < 4) {
        return res.send({
            success: false,
            message: 'Error: Username invalid.'
        })
    }

    if (!password || password.length < 4) {
        return res.send({
            success: false,
            message: 'Error: Password invalid.'
        })
    }
    //find by username
    Police.find({
        username: username
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
                message: 'Error:Invalid username (password validation)'
            })
        }
        const police = users[0];
        if (!police.validPassword(password)) {
            return res.send({
                success: false,
                message: 'Error:Invalid password'
            })
        }
        if (police.isDeleted) {
            return res.send({
                success: false,
                message: 'Error:Deleted account'
            })
        }
        //otherwise create user session
        const policeSession = new PoliceSession();
        policeSession.username = police.username;
        policeSession.adminRights = police.adminRights;
        policeSession.save((err, doc) => {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Error:Server error',
                    adminRights: policeSession.adminRights
                });
            };

            return res.send({
                success: true,
                message: 'Valid sign in',
                token: doc._id //session id taken from mongodb doc (record)
            });
        });

    });
});

//Verify
router.route('/verifysession').get((req, res) => {
    //get the token
    const { query } = req;
    const { token } = query;
    //verify if its one of a kind and not deleted.
    PoliceSession.find({
        _id: token,
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
            return res.send({
                success: true,
                message: 'Session verified',
                adminRights: sessions[0].adminRights,
                username: sessions[0].username
            })
        }
    })
})

//Logout
router.route('/logout').get((req, res) => {
    //get the token
    const { query } = req;
    const { token } = query;
    //verify if its one of a kind and not deleted.
    PoliceSession.findOneAndUpdate({
        _id: token,
        isDeleted: false
    }, {
        $set: { isDeleted: true }
    }, null, (err, sessions) => {
        if (err) {
            return res.send({
                success: false,
                message: 'Error:Server error or Session not found'
            })
        }
        return res.send({
            success: true,
            message: 'Session deleted'
        })
    })
})

//Deleting a user
router.route('/delete').delete((req, res) => {
    const { body } = req;
    const { username, sessionToken } = body; //username of account to be deleted, session token of an admin should be added
    //Data constraints
    if (!username || username.length < 4) {
        return res.send({
            success: false,
            message: 'Error: Username invalid.'
        })
    }
    if (!sessionToken || sessionToken.length != 24) {
        return res.send({
            success: false,
            message: 'Error: Session Token invalid.'
        })
    }
    //validating admin session
    PoliceSession.find({
        _id: sessionToken,
        isDeleted: false,
        adminRights: true
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
            //validating police user deletion
            Police.findOneAndUpdate({
                username: username,
                isDeleted: false
            }, { $set: { isDeleted: true } }, null,
                (err, police) => {
                    if (err) {
                        return res.send({
                            success: false,
                            message: 'Error: Server error'
                        })
                    }
                    else {
                        //delete all sessions
                        PoliceSession.updateMany({
                            username: username,
                            isDeleted: false
                        }, {
                            $set: { isDeleted: true }
                        }, null, (err2, sessions) => {
                            if (err2) {
                                return res.send({
                                    success: false,
                                    message: 'Error:Server error or Session not found'
                                })
                            }
                            return res.send({
                                success: true,
                                message: 'Police User and Sessions deleted'
                            })
                        })
                    }
                })
        }
    })
});

//Updating user details
router.route('/update').post((req, res) => {
    const { body } = req;
    const { username, name, adminRights, sessionToken } = body; //username of account to be updated, session token of an admin should be added
    //Data constraints
    if (!username || username.length < 4) {
        return res.send({
            success: false,
            message: 'Error: Username invalid!.',
            invalid_username: username
        })
    }
    if (!sessionToken || sessionToken.length != 24) {
        return res.send({
            success: false,
            message: 'Error: Session Token invalid.'
        })
    }
    //validating admin session
    PoliceSession.find({
        _id: sessionToken,
        isDeleted: false,
        adminRights: true
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
            //validating police user update
            Police.findOneAndUpdate({
                username: username,
                isDeleted: false
            }, { $set: { name: name, adminRights: adminRights } }, null,
                (err, police) => {
                    if (err) {
                        return res.send({
                            success: false,
                            message: 'Error: Server error'
                        })
                    }
                    else {
                        return res.send({
                            success: true,
                            message: 'Police User Updated.',
                            new_name: name,
                            new_adminRights: adminRights
                        })
                    }
                })
        }
    })
});





//Emergency Tean Add (post request)
router.route('/eteam/add').post((req, res) => {
    const { body } = req;
    const { username, name, contactNumber, password, sessionToken } = body; //session token of an police admin should be added
    //Data constraints
    if (!username || username.length < 4) {
        return res.send({
            success: false,
            message: 'Error: Username invalid.'
        })
    }
    if (!name) {
        return res.send({
            success: false,
            message: 'Error: Name cannot be blank.'
        })
    }
    if (!contactNumber) {
        return res.send({
            success: false,
            message: 'Error: contactNumber cannot be blank.'
        })
    }
    if (!password || password.length < 4) {
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
    //validating admin session
    PoliceSession.find({
        _id: sessionToken,
        isDeleted: false,
        adminRights: true
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
            //validating police user creation
            ETeam.find({
                username: username
            }, (err, previousETeam) => {
                if (err) {
                    return res.send({
                        success: false,
                        message: 'Error: Server error (ETeam reg find in police signin.js)'
                    })
                }
                else if (previousETeam.length > 0) {
                    return res.send({
                        success: false,
                        message: 'Error:Username taken.'
                    })
                }
                //save to database
                const newETeam = new ETeam();
                newETeam.username = username;
                newETeam.name = name;
                newETeam.password = newETeam.generateHash(password);
                newETeam.contactNumber = contactNumber;
                newETeam.availability = false; //auto sae availability as false
                newETeam.lat = "0";
                newETeam.lng = "0";
                newETeam.save()
                    .then(() =>
                        res.send({
                            success: true,
                            message: 'New ETeam added.'
                        })
                    )
                    .catch(err => res.status(400).json('Error: ' + err));
            })
        }
    })
});

//Emergency Team Delete(post request)
router.route('/eteam/delete').delete((req, res) => {
    const { body } = req;
    const { username, sessionToken } = body; //username of account to be deleted, session token of an admin should be added
    //Data constraints
    if (!username || username.length < 4) {
        return res.send({
            success: false,
            message: 'Error: Username invalid.'
        })
    }
    if (!sessionToken || sessionToken.length != 24) {
        return res.send({
            success: false,
            message: 'Error: Session Token invalid.'
        })
    }
    //validating admin session
    PoliceSession.find({
        _id: sessionToken,
        isDeleted: false,
        adminRights: true
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
            //validating eTeam user
            ETeam.findOneAndUpdate({
                username: username,
                isDeleted: false
            }, { $set: { isDeleted: true } }, null,
                (err, eteam) => {
                    if (err) {
                        return res.send({
                            success: false,
                            message: 'Error: Server error'
                        })
                    }
                    else {
                        //delete all sessions
                        ETeamSession.updateMany({
                            username: username,
                            isDeleted: false
                        }, {
                            $set: { isDeleted: true }
                        }, null, (err2, sessions) => {
                            if (err2) {
                                return res.send({
                                    success: false,
                                    message: 'Error:Server error or Session not found'
                                })
                            }
                            return res.send({
                                success: true,
                                message: 'ETeam and Sessions deleted'
                            })
                        })
                    }
                })
        }
    })
});


//Emergency Team List (get)
router.route('/eteam/list').get((req, res) => {
    ETeam.find({
        isDeleted: false
    }, (err, eteamlist) => {
        if (err) {
            return res.send({
                success: false,
                message: 'Error:Server error'
            })
        } else {
            let data = [];
            for (i in eteamlist) {
                let username = eteamlist[i].username;
                let availability = eteamlist[i].availability;
                let contactNumber = eteamlist[i].contactNumber;
                let lat = eteamlist[i].lat;
                let lng = eteamlist[i].lng;
                data.push({
                    'username': username,
                    'availability': availability,
                    'contactNumber': contactNumber,
                    'lat': lat,
                    'lng': lng,
                })
            }

            return res.send({
                success: true,
                message: 'List received',
                data: data
            })
        }
    })
})





module.exports = router;