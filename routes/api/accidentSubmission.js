const router = require('express').Router();
let Accident = require('../../models/accident.model');
let PoliceSession = require('../../models/policeSession.model');
let ETeamSession = require('../../models/eTeamSession.model');
let PublicHoliday = require('../../models/publicHoliday.model');

//Predictor calculation functions
function getHourCat(datetime) {
    if (!datetime) {
        return null;
    }
    const d = new Date(datetime);
    const h = d.getHours();
    if (h < 5 || h > 20) {
        return 0; //free of charge
    } else if (h < 9 || h > 15) {
        return 1; //rush
    } else
        return 2;//normal
}

function getDayCat(datetime, isPublicHoliday) {
    const d = new Date(datetime.toString());
    const h = d.getDay();
    if (isPublicHoliday) {
        return 2; //pubHoliday
    } else if (h == 0 || h == 6) {
        return 1; //weekend
    } else {
        return 0; //weekday
    }
}

function getMonthCat(datetime) {
    if (!datetime) {
        return null;
    }
    const d = new Date(datetime);
    const m = d.getMonth();
    //check public holiday? return 2
    if (m < 2 || m > 8) {
        return true; //offpeak
    } else
        return false;//peak
}

function getVision(datetime, weather) {
    if (!datetime) {
        return null;
    }
    const d = new Date(datetime);
    const t = d.getHours() * 60 + d.getMinutes;
    if (t < 330 || t >= 1140) {
        return 0; //poor
    } else if (t < 420 || t >= 1050) {
        return 1; //glare
    } else if (weather == true) {
        return 3; //blurred
    } else {
        return 2; //normal
    }
}

function getAgeCat(age) {
    if (!age) {
        return null;
    }
    if (age < 30) {
        return 0; //young
    } else if (age < 50) {
        return 1; //mid
    } else
        return 2;//old
}

function getKmCat(kmPost) {
    if (kmPost < 26) {
        return 0; //km1
    } else if (kmPost < 51) {
        return 1; //km2
    } else if (kmPost < 76) {
        return 2; //km3
    } else if (kmPost < 101) {
        return 3; //km4
    } else {
        return 5; //km6
    }
}

function getDrowsiness(datetime) {
    if (!datetime) {
        return null;
    }
    const d = new Date(datetime);
    const t = d.getHours() * 60 + d.getMinutes();
    if (t >= 480 && t < 600 || t >= 840 && t < 960 || t >= 1260 || t < 300) {
        return true;
    } else {
        return false;
    }
}

function getAnimalCrossing(datetime, weather) {
    if (!datetime) {
        return null;
    }
    const d = new Date(datetime);
    const t = d.getHours() * 60 + d.getMinutes;
    //logic should be implemened
    return false;
}

function getEnoughGap(reason) {
    if (reason == 3) {
        return false;
    } else {
        return true;
    }
}

//Submit (police)
router.route('/submit').post((req, res) => {
    const { body } = req;
    const {
        datetime,
        driverAge,
        driverGender,
        weather,
        roadSurface,
        vehicleType,
        vehicleYOM,
        licenseIssueDate,
        drivingSide,
        severity,
        reason,
        kmPost,
        suburb,
        operatedSpeed,
        vehicle_condition,
        sessionToken
    } = body;
    var isPublicHoliday = false;
    //Data constraints
    if (!datetime) {
        return res.send({
            success: false,
            message: 'Error: Date/Time invalid.'
        })
    }
    if (!sessionToken || sessionToken.length != 24) {
        return res.send({
            success: false,
            message: 'Error: Session Token invalid.'
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
            //check if publicHoliday
            isPublicHoliday = false;
            const d = new Date(datetime.toString());
            const gte = new Date(d.setDate(d.getDate() - 1))
            const lt = new Date(d.setDate(d.getDate() + 1))
            PublicHoliday.find({
                date: { "$lt": lt, "$gte": gte },
            }, (err, pubhollist) => {
                if (err) {
                    pass;
                } else {
                    if (pubhollist.length > 0) {
                        //holiday found
                        isPublicHoliday = true;
                    }
                    //save to database
                    const newAccident = new Accident();
                    newAccident.datetime = datetime;
                    newAccident.driverAge = driverAge;
                    newAccident.driverGender = driverGender;
                    newAccident.weather = weather;
                    newAccident.roadSurface = roadSurface;
                    newAccident.vehicleType = vehicleType;
                    newAccident.vehicleYOM = vehicleYOM;
                    newAccident.licenseIssueDate = licenseIssueDate;
                    newAccident.drivingSide = drivingSide;
                    newAccident.severity = severity;
                    newAccident.reason = reason;
                    newAccident.kmPost = kmPost;
                    newAccident.suburb = suburb;
                    newAccident.operatedSpeed = operatedSpeed;
                    newAccident.vehicle_condition = vehicle_condition;
                    newAccident.isDeleted = false;
                    newAccident.sessionToken = sessionToken;
                    newAccident.day_cat = getDayCat(datetime, isPublicHoliday);
                    newAccident.hour_cat = getHourCat(datetime);
                    newAccident.month_cat = getMonthCat(datetime);
                    newAccident.vision = getVision(datetime, weather);
                    newAccident.age_cat = getAgeCat(driverAge);
                    newAccident.km_cat = getKmCat(kmPost);
                    newAccident.drowsiness = getDrowsiness(datetime);
                    newAccident.enough_gap = getEnoughGap(reason);
                    newAccident.animal_crossing_problem = getAnimalCrossing(datetime, weather);
                    newAccident.save()
                        .then(() =>
                            res.send({
                                success: true,
                                message: 'Accident submitted successfully.',
                                data: newAccident
                            })
                        )
                        .catch(err => res.send({
                            success: false,
                            message: 'Error:Data Validation Error'
                        })
                        )

                }
            })
        }
    }
    )

});

//Submit (eteam)
router.route('/eteam/submit/').post((req, res) => {
    const { body } = req;
    const {
        datetime,
        driverAge,
        driverGender,
        weather,
        roadSurface,
        vehicleType,
        vehicleYOM,
        licenseIssueDate,
        drivingSide,
        severity,
        reason,
        kmPost,
        suburb,
        operatedSpeed,
        vehicle_condition,
        sessionToken
    } = body;
    var isPublicHoliday = false;
    //Data constraints
    if (!datetime) {
        return res.send({
            success: false,
            message: 'Error: Date/Time invalid.'
        })
    }
    if (!sessionToken || sessionToken.length != 24) {
        return res.send({
            success: false,
            message: 'Error: Session Token invalid.'
        })
    }
    //validating session
    ETeamSession.find({
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
            //check if publicHoliday
            isPublicHoliday = false;
            const d = new Date(datetime.toString());
            const gte = new Date(d.setDate(d.getDate() - 1))
            const lt = new Date(d.setDate(d.getDate() + 1))
            PublicHoliday.find({
                date: { "$lt": lt, "$gte": gte },
            }, (err, pubhollist) => {
                if (err) {
                    pass;
                } else {
                    if (pubhollist.length > 0) {
                        //holiday found
                        isPublicHoliday = true;
                    }
                    //save to database
                    const newAccident = new Accident();
                    newAccident.datetime = datetime;
                    newAccident.driverAge = driverAge;
                    newAccident.driverGender = driverGender;
                    newAccident.weather = weather;
                    newAccident.roadSurface = roadSurface;
                    newAccident.vehicleType = vehicleType;
                    newAccident.vehicleYOM = vehicleYOM;
                    newAccident.licenseIssueDate = licenseIssueDate;
                    newAccident.drivingSide = drivingSide;
                    newAccident.severity = severity;
                    newAccident.reason = reason;
                    newAccident.kmPost = kmPost;
                    newAccident.suburb = suburb;
                    newAccident.operatedSpeed = operatedSpeed;
                    newAccident.vehicle_condition = vehicle_condition;
                    newAccident.isDeleted = false;
                    newAccident.sessionToken = sessionToken;
                    newAccident.day_cat = getDayCat(datetime, isPublicHoliday);
                    newAccident.hour_cat = getHourCat(datetime);
                    newAccident.month_cat = getMonthCat(datetime);
                    newAccident.vision = getVision(datetime, weather);
                    newAccident.age_cat = getAgeCat(driverAge);
                    newAccident.km_cat = getKmCat(kmPost);
                    newAccident.drowsiness = getDrowsiness(datetime);
                    newAccident.enough_gap = getEnoughGap(reason);
                    newAccident.animal_crossing_problem = getAnimalCrossing(datetime, weather);
                    newAccident.save()
                        .then(() =>
                            res.send({
                                success: true,
                                message: 'Accident submitted successfully.',
                                data: newAccident
                            })
                        )
                        .catch(err => res.send({
                            success: false,
                            message: 'Error:Data Validation Error'
                        })
                        )

                }
            })
        }
    }
    )

});

//List All Accidents
router.route('/list').get((req, res) => {
    Accident.find({
        isDeleted: false
    }, (err, accidentList) => {
        if (err) {
            return res.send({
                success: false,
                message: 'Error:Server error'
            })
        } else {
            let data = [];
            for (i in accidentList) {
                data.push({
                    'id': accidentList[i]._id,
                    'datetime': accidentList[i].datetime,
                    'driverAge': accidentList[i].driverAge,
                    'driverGender': accidentList[i].driverGender,
                    'weather': accidentList[i].weather,
                    'roadSurface': accidentList[i].roadSurface,
                    'vehicleType': accidentList[i].vehicleType,
                    'vehicleYOM': accidentList[i].vehicleYOM,
                    'licenseIssueDate': accidentList[i].licenseIssueDate,
                    'drivingSide': accidentList[i].drivingSide,
                    'severity': accidentList[i].severity,
                    'reason': accidentList[i].reason,
                    'kmPost': accidentList[i].kmPost,
                    'suburb': accidentList[i].suburb,
                    'operatedSpeed': accidentList[i].operatedSpeed,
                    'vehicle_condition': accidentList[i].vehicle_condition,
                    'day_cat': accidentList[i].day_cat,
                    'hour_cat': accidentList[i].hour_cat,
                    'month_cat': accidentList[i].month_cat,
                    'vision': accidentList[i].vision,
                    'age_cat': accidentList[i].age_cat,
                    'km_cat': accidentList[i].km_cat,
                    'drowsiness': accidentList[i].drowsiness,
                    'enough_gap': accidentList[i].enough_gap,
                    'animal_crossing_problem': accidentList[i].animal_crossing_problem
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

//Deleting an accident
router.route('/delete').delete((req, res) => {
    const { body } = req;
    const { id, sessionToken } = body; //id of accident to be deleted, session token of police user 
    //Data constraints
    if (!id || id.length != 24) {
        return res.send({
            success: false,
            message: 'Error: Accident invalid.'
        })
    }
    if (!sessionToken || sessionToken.length != 24) {
        return res.send({
            success: false,
            message: 'Error: Session Token invalid.'
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
        if (sessions.length != 1 || sessions[0].isDeleted) {
            return res.send({
                success: false,
                message: 'Error:Invalid Session'
            })
        } else {
            //validating accident deletion
            Accident.findOneAndUpdate({
                _id: id,
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
                        return res.send({
                            success: true,
                            message: 'Accident Deleted.'
                        })
                    }
                })

        }
    })
});

//Update accident
router.route('/update').post((req, res) => {
    const { body } = req;
    const {
        id,
        datetime,
        driverAge,
        driverGender,
        weather,
        roadSurface,
        vehicleType,
        vehicleYOM,
        licenseIssueDate,
        drivingSide,
        severity,
        reason,
        kmPost,
        suburb,
        operatedSpeed,
        vehicle_condition,
        sessionToken
    } = body;
    //Data constraints
    if (!datetime) {
        return res.send({
            success: false,
            message: 'Error: Date/Time invalid.'
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
            message: 'Error: Accident ID invalid.'
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
            //check if publicHoliday
            isPublicHoliday = false;
            const d = new Date(datetime.toString());
            const gte = new Date(d.setDate(d.getDate() - 1))
            const lt = new Date(d.setDate(d.getDate() + 1))
            PublicHoliday.find({
                date: { "$lt": lt, "$gte": gte },
            }, (err1, pubhollist) => {
                if (err1) {
                    pass;
                } else {
                    if (pubhollist.length > 0) {
                        //holiday found
                        isPublicHoliday = true;
                    }
                    //validating accident update
            Accident.findOneAndUpdate({
                _id: id,
                isDeleted: false
            }, {
                $set: {
                    datetime: datetime,
                    driverAge: driverAge,
                    driverGender: driverGender,
                    weather: weather,
                    roadSurface: roadSurface,
                    vehicleType: vehicleType,
                    vehicleYOM: vehicleYOM,
                    licenseIssueDate: licenseIssueDate,
                    drivingSide: drivingSide,
                    severity: severity,
                    reason: reason,
                    kmPost: kmPost,
                    suburb: suburb,
                    operatedSpeed: operatedSpeed,
                    vehicle_condition: vehicle_condition,
                    day_cat: getDayCat(datetime,isPublicHoliday),
                    hour_cat: getHourCat(datetime),
                    month_cat: getMonthCat(datetime),
                    vision: getVision(datetime, weather),
                    age_cat: getAgeCat(driverAge),
                    km_cat: getKmCat(kmPost),
                    drowsiness: getDrowsiness(datetime),
                    enough_gap: getEnoughGap(reason),
                    animal_crossing_problem: getAnimalCrossing(datetime, weather)
                }
            }, null,
                (err, accident) => {
                    if (err) {
                        console.log("update terminated.")
                        return res.send({
                            success: false,
                            message: 'Error: Server error'
                        })
                    }
                    else {
                        console.log("update completed")
                        return res.send({
                            success: true,
                            message: 'Accident Updated.',
                            data: accident
                        })
                    }
                })
                }
            })
            
        }
    }
    )
});


module.exports = router;