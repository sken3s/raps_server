const router = require('express').Router();
let IncidentReport = require('../../models/incidentReport.model');
let DriverSession = require('../../models/driverSession.model');


//Submit (post request)
router.route('/submit').post((req, res) => {
  const { body } = req;
  const {
  reporterName,
  incidentType,
  weather,
  vehicleType,
  drivingSide,
  severity,
  kmPost,
  suburb,
  operatedSpeed,
  incidentDescription,
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
        }else{ 
                //save to database
                const  newIncident = new IncidentReport();
                                
                 newIncident.reporterName = reporterName;
                 newIncident.incidentType = incidentType;
                 newIncident.weather = weather;
                 newIncident.vehicleType = vehicleType;               
                 newIncident.drivingSide = drivingSide;
                 newIncident.severity = severity;
                 newIncident.kmPost = kmPost;
                 newIncident.suburb = suburb;
                 newIncident.operatedSpeed = operatedSpeed;
                 newIncident.incidentDescription = incidentDescription;
                 newIncident.sessionToken = sessionToken;
                 
                 newIncident.save()
                .then(() => 
                    res.send({
                    success:true,
                    message:'Report submitted successfully.'
                })
                )
                .catch(err => res.send({
                    success:false,
                    message:'Error:Data Validation Error'
                })
                ) 

            }
        }
        )
    });



//List All Incidents
router.route('/list').get((req,res) => {
    IncidentReport.find({   
            //finds without filter
        }, (err,incidentList) =>{
            if(err){
                return res.send({
                    success:false,
                    message:'Error:Server error'
                })
            }else{
                let data=[];
                for(i in incidentList){
                   data.push({
                        'id':incidentList[i]._id,
                        'reporterName':incidentList[i].datetime, 
                        'incidentType':incidentList[i].incidentType,
                        'weather':incidentList[i].weather,
                        'vehicleType':incidentList[i].vehicleType,
                        'drivingSide':incidentList[i].drivingSide,
                        'severity':incidentList[i].severity,
                        'kmPost':incidentList[i].kmPost,
                        'suburb':incidentList[i].suburb,
                        'operatedSpeed':incidentList[i].operatedSpeed,
                        'incidentDescription':incidentList[i].incidentDescription
                })
                }

                return res.send({
                    success:true,
                    message:'List received',
                    data:data
                })
            }
})
})



/*

//List All IncidentReports
router.route('/list').get((req,res) => {
    IncidentReport.find({   
            //finds without filter
        }, (err,incidentReportList) =>{
            if(err){
                return res.send({
                    success:false,
                    message:'Error:Server error'
                })
            }else{
                let data=[];
                for(i in incidentReportList){
                   data.push({
                        'id':incidentReportList[i]._id,
                        'datetime':incidentReportList[i].datetime, 
                        'driverAge':incidentReportList[i].reporterName,
                        'driverGender':incidentReportList[i].incidentType,
                        'weather':incidentReportList[i].weather,
                        'vehicleType':incidentReportList[i].vehicleType,                   
                        'drivingSide':incidentReportList[i].drivingSide,
                        'severity':incidentReportList[i].severity,                        
                        'kmPost':incidentReportList[i].kmPost,
                        'suburb':incidentReportList[i].suburb,
                        'operatedSpeed':incidentReportList[i].operatedSpeed,
                        'incidentDescription':incidentReportList[i].incidentDescription
                })
                }

                return res.send({
                    success:true,
                    message:'List received',
                    data:data
                })
            }
})
}) */



  

module.exports = router;