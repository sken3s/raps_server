const router = require("express").Router();
let Event = require("../../models/event.model");
let PoliceSession = require("../../models/policeSession.model");
let ETeamSession = require("../../models/eTeamSession.model");
let PublicHoliday = require("../../models/publicHoliday.model");

//Submit (police)
router.route("/submit").post((req, res) => {
  const { body } = req;
  const {
    datetime,
    type,
    drivingSide,
    severity,
    kmPost,
    suburb,
    sessionToken,
  } = body;
  //Data constraints
  if (!datetime) {
    return res.send({
      success: false,
      message: "Error: Date/Time invalid.",
    });
  }
  if (!sessionToken || sessionToken.length != 24) {
    return res.send({
      success: false,
      message: "Error: Session Token invalid.",
    });
  }
  //validating session
  PoliceSession.find(
    {
      _id: sessionToken,
      isDeleted: false,
    },
    (err, sessions) => {
      if (err) {
        return res.send({
          success: false,
          message: "Error:Server error or Session not found",
        });
      }
      if (sessions.length != 1) {
        return res.send({
          success: false,
          message: "Error:Invalid Session",
        });
      } else {
        //save to database
        const newEvent = new Event();
        newEvent.datetime = datetime;
        newEvent.type = type;
        newEvent.drivingSide = drivingSide;
        newEvent.severity = severity;
        newEvent.kmPost = kmPost;
        newEvent.suburb = suburb;
        newEvent.isDeleted = false;
        newEvent.sessionToken = sessionToken;
        newEvent
          .save()
          .then(() =>
            res.send({
              success: true,
              message: "Event submitted successfully.",
            })
          )
          .catch((err) =>
            res.send({
              success: false,
              message: "Error:Data Validation Error",
            })
          );
      }
    }
  );
});

//Submit (eteam)
router.route("/eteam/submit").post((req, res) => {
  const { body } = req;
  const {
    datetime,
    type,
    drivingSide,
    severity,
    kmPost,
    suburb,
    sessionToken,
  } = body;
  //Data constraints
  if (!datetime) {
    return res.send({
      success: false,
      message: "Error: Date/Time invalid.",
    });
  }
  if (!sessionToken || sessionToken.length != 24) {
    return res.send({
      success: false,
      message: "Error: Session Token invalid.",
    });
  }
  //validating session
  ETeamSession.find(
    {
      _id: sessionToken,
      isDeleted: false,
    },
    (err, sessions) => {
      if (err) {
        return res.send({
          success: false,
          message: "Error:Server error or Session not found",
        });
      }
      if (sessions.length != 1) {
        return res.send({
          success: false,
          message: "Error:Invalid Session",
        });
      } else {
        //save to database
        const newEvent = new Event();
        newEvent.datetime = datetime;
        newEvent.type = type;
        newEvent.drivingSide = drivingSide;
        newEvent.severity = severity;
        newEvent.kmPost = kmPost;
        newEvent.suburb = suburb;
        newEvent.isDeleted = false;
        newEvent.sessionToken = sessionToken;
        newEvent
          .save()
          .then(() =>
            res.send({
              success: true,
              message: "Event submitted successfully.",
            })
          )
          .catch((err) =>
            res.send({
              success: false,
              message: "Error:Data Validation Error",
            })
          );
      }
    }
  );
});

//List All Events
router.route("/list").get((req, res) => {
  Event.find(
    {
      isDeleted:false
    },
    (err, eventList) => {
      if (err) {
        return res.send({
          success: false,
          message: "Error:Server error",
        });
      } else {
        let data = [];
        for (i in eventList) {
          data.push({
            id: eventList[i]._id,
            datetime: eventList[i].datetime,
            type: eventList[i].type,
            drivingSide: eventList[i].drivingSide,
            severity: eventList[i].severity,
            kmPost: eventList[i].kmPost,
            suburb: eventList[i].suburb,
          });
        }

        return res.send({
          success: true,
          message: "List received",
          data: data,
        });
      }
    }
  );
});

//Deleting an event
router.route('/delete').delete((req, res) => {
  const { body } = req;
  const { id, sessionToken } = body; //id of event to be deleted, session token of police user 
  //Data constraints
  if (!id || id.length != 24) {
      return res.send({
          success: false,
          message: 'Error: Event invalid.'
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
          //validating event deletion
          Event.findOneAndUpdate({
              _id: id,
              isDeleted: false
          }, { $set: { isDeleted: true } }, null,
              (err, event) => {
                  if (err) {
                      return res.send({
                          success: false,
                          message: 'Error: Server error'
                      })
                  }
                  else {
                      return res.send({
                          success: true,
                          message: 'Event Deleted.'
                      })
                  }
              })

      }
  })
});

//Update event
router.route("/update").post((req, res) => {
  const { body } = req;
  const {
    id,
    datetime,
    type,
    drivingSide,
    severity,
    kmPost,
    suburb,
    sessionToken,
  } = body;
  //Data constraints
  if (!datetime) {
    return res.send({
      success: false,
      message: "Error: Date/Time invalid.",
    });
  }
  if (!sessionToken || sessionToken.length != 24) {
    return res.send({
      success: false,
      message: "Error: Session Token invalid.",
    });
  }
  if (!id || id.length != 24) {
    return res.send({
      success: false,
      message: "Error: Event ID invalid.",
    });
  }
  //validating session
  PoliceSession.find(
    {
      _id: sessionToken,
      isDeleted: false,
    },
    (err, sessions) => {
      if (err) {
        return res.send({
          success: false,
          message: "Error:Server error or Session not found",
        });
      }
      if (sessions.length != 1) {
        return res.send({
          success: false,
          message: "Error:Invalid Session",
        });
      } else {
              //validating event update
              Event.findOneAndUpdate(
                {
                  _id: id,
                  isDeleted: false,
                },
                {
                  $set: {
                    datetime: datetime,
                    type: type,
                    drivingSide: drivingSide,
                    severity: severity,
                    kmPost: kmPost,
                    suburb: suburb
                  },
                },
                null,
                (err, event) => {
                  if (err) {
                    console.log("update terminated.");
                    return res.send({
                      success: false,
                      message: "Error: Server error",
                    });
                  } else {
                    console.log("update completed");
                    return res.send({
                      success: true,
                      message: "Event Updated."
                    });
                  }
                }
              );
            
      }
    }
  );
});

module.exports = router;
