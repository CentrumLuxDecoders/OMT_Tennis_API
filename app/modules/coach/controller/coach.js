const output = require("../../_models/output");
const db_library = require("../../_helpers/db_library");
const mail_template = require("../../MailTemplate/mailTemplate");
const appConfig = require("../../../../config/appConfig");
const moment = require("moment");
const lang = require("../../../lang/language").franchContent;
const calculateLocation = require("../../_helpers/calculateRadiusDistance");

async function setStatusBookingSlotDbs(booking_id, status) {
  try {
    const Query =
      "UPDATE `booking_slot_dbs` SET `status`= '" +
      status +
      "' WHERE `booking_Id`= '" +
      booking_id +
      "'";
    return await db_library.execute(Query).then(async data => {

      return data;
    });
  } catch (error) {
    return error;
  }
}

async function setStatusAvaiablity(arrayData) {
  try {
    const {
      coach_id,
      user_id,
      status,
      booking_date,
      booking_course,
      booking_time
    } = arrayData;
    const Query =
      "UPDATE `avaiablity` SET `Status`= '" +
      status +
      "' WHERE `CoachId`= '" +
      coach_id +
      "' AND `UserId`= '" +
      user_id +
      "' AND `Date`= '" +
      formatDate(booking_date) +
      "' AND `CourseId`= '" +
      booking_course +
      "' AND `Hour`= '" +
      booking_time +
      "'";
    return await db_library.execute(Query).then(async data => {
      return data;
    });
  } catch (error) {
    return error;
  }
}

async function getStatusBookingSlotData(id) {
  try {
    const Query =
      "SELECT * FROM `booking_slot_dbs` WHERE `booking_Id`= '" + id + "'";
    return await db_library.execute(Query).then(async data => {
      return data;
    });
  } catch (error) {
    return error;
  }
}

async function getRemainingTen(coach_id, user_id, booking_course) {
  try {
    const arrData = [];
    const query =
      "SELECT * FROM `booking_dbs` WHERE `Coach_ID` = '" +
      coach_id +
      "' AND `user_Id` = '" +
      user_id +
      "' AND `bookingCourse` = '" +
      booking_course +
      "' AND `remaingSlotStatus` = 'Yes'";
    return await db_library.execute(query).then(async data => {
      for (let i = 0; i < data.length; i++) {
        const bookingSlotData = await getStatusBookingSlotData(
          data[i].booking_Id
        );
        const obj = {
          booking_id: data[i].booking_Id,
          coach_id: parseInt(data[i].Coach_ID),
          user_id: parseInt(data[i].user_Id),
          amount: data[i].amount,
          booking_course: data[i].bookingCourse,
          remaingSlot: data[i].remaingSlot,
          remaingSlotStatus: data[i].remaingSlotStatus,
          slot: bookingSlotData
        };
        arrData.push(obj);
      }
      return arrData;
    });
  } catch (error) {
    return error;
  }
}

exports.get_remaining_slot = async function (req, res, next) {
  const coach_id = req.params.coach_id;
  const user_id = req.params.user_id;
  const booking_course = req.params.booking_course;
  var _output = new output();
  const data = await getRemainingTen(coach_id, user_id, booking_course);
  if (data.length > 0) {
    _output.data = data;
    _output.isSuccess = true;
    _output.message = "Get remaining data successful";
  } else {
    _output.data = data;
    _output.isSuccess = true;
    _output.message = " No Found";
  }
  res.send(_output);
};

async function check_avail_ten_is_or_not(id, date) {
  try {
    const Query =
      "SELECT count(id) AS total FROM `avaiablity` WHERE `CoachId`= '" +
      id +
      "' AND `Status`= 'Y' AND `Date` >= '" +
      date +
      "'";
    return await db_library.execute(Query).then(async data => {
      return data;
    });
  } catch (error) {
    return error;
  }
}

exports.get_avail_ten_is_or_not = async function (req, res, next) {
  const coach_id = req.params.coach_id;
  const date = req.params.date;
  var _output = new output();
  const data = await check_avail_ten_is_or_not(coach_id, date);
  if (data[0].total >= 10) {
    _output.data = { ten: true };
    _output.isSuccess = true;
    _output.message = "Get remaining data successful";
  } else {
    _output.data = { ten: false };
    _output.isSuccess = true;
    _output.message = " No Found";
  }
  res.send(_output);
};

exports.search_for_coach = async function (req, res, next) {
  const ville = req.query.ville;
  const date = req.query.date;
  var _output = new output();
  // if (ville != "" && date != "") {
  var query = "call filtercoach('" + ville + "','" + date + "','','')";
  await db_library
    .execute(query)
    .then(value => {
      if (value[0].length > 0) {
        var result = value[0];
        for (var i = 0; i < value[0].length; i++) {
          result[i].Coach_Services = value[0][i].Coach_Services.split(",");
        }
        var obj = {
          coach_list: result
        };
        _output.data = obj;
        _output.isSuccess = true;
        _output.message = "L'entraîneur réussit";
      } else {
        var obj = {
          coach_list: []
        };
        _output.data = obj;
        _output.isSuccess = true;
        _output.message = "Aucun entraîneur trouvé";
      }
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "L'entraîneur a échoué";
    });
  res.send(_output);
};

// async function getbookingdemanddetails(idss, date) {

//   if (idss != "" && date != "") {


//   } else {
//     console.log("[coach.js - line 1409]", err)
//   }
//   // return obj;
// };



async function getbookingdemanddetails(idss, result,course) {


  return new Promise(function (resolve, reject) {
    let responseResult = [];
    let count = result.length;
    let flag = 1;
    // console.log('result',result);
    for (let value of result) {
      let date = moment(value.start).format('YYYY-MM-DD');
      var query1 =
        "select  CONCAT(s.firstName,' ',s.lastName)as title ,bk.bookingDate as start ,bk.bookingDate as end,'background' as 'display','#539654' as 'color' from booking_dbs bk inner join users s on bk.user_Id = s.id" +
        " where bk.bookingDate = '" +
        date +
        "' and bk.Coach_ID = '" +
        idss +
        "' and bk.bookingCourse = 'CoursCollectifOndemand'";

        // console.log('generalQuery',query1);
      db_library
        .execute(query1)
        .then(async value1 => {
          console.log('value1',value1);
          if (value1.length > 0) {
            responseResult = [...responseResult,value1];
            // console.log(value1);
          }
        })
        .catch(err => {
          console.log("[coach.js - line 1409]", err)
        });
      if (count == flag) {
        // console.log('running..',responseResult);
        resolve(responseResult);
      }
      flag++;
    }
    


  });

}

exports.getallavailabilityforCoachDetail = async function (req, res, next) {
  const coachId = req.query.coachId;
  const course = req.query.course;
  var _output = new output();
  if (course == 'CoursCollectifOndemand') {
    var query = "call CoachCalendarWithUserInfo('" + coachId + "')";
  } else { 
    var query = "call CoachCalendarWithUserInfoIndividual('" + coachId + "')";
  }
  console.log('query',query);
  var results = [];
  await db_library
    .execute(query)
    .then(value => {
      console.log('valuevalue',JSON.stringify(value));

      if ((value[0].length > 0 && course == 'CoursCollectifOndemand') || (course != 'CoursCollectifOndemand' && value.length>0)) {
       
        if (course == 'CoursCollectifOndemand') {
          results = value[0];
          getbookingdemanddetails(coachId, value[0],course).then(async function (response) {
            // console.log('response',response);
            var obj = {
              coach_list: response
            };
            _output.data = obj;
            _output.isSuccess = true;
            _output.message = lang.coach_availability_success;
          });
        }else{
          results = value[0];
          const disponibleStartDates = new Set();
          // Create a filtered array
          const filteredArr = results.filter(item => {
              // Check if the title is "Disponible"
              if (item.title === "Disponible") {
                  // If it's "Disponible," add the start date to the Set
                  disponibleStartDates.add(item.start);
                  return true; // Keep the "Disponible" item
              } else if (item.title === "Non Disponible") {
                  // If it's "Non Disponible" and the start date is in the Set, remove it
                  if (disponibleStartDates.has(item.start)) {
                      return false; // Remove the "Non Disponible" item
                  }
              }
              return true; // Keep all other items
          });

          var obj = {
            coach_list: filteredArr
            };
            _output.data = obj;
            _output.isSuccess = true;
            _output.message = lang.coach_availability_success;
        }
       

      } else {
        var obj = {
          coach_list: []
        };
        _output.data = obj;
        _output.isSuccess = true;
        _output.message = "Aucune date de disponibilité de coach trouvée";
      }
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "Date de disponibilité de l'entraîneur";
    });
  res.send(_output);
};

exports.find_your_coach = async function (req, res, next) {
  const ville = req.query.ville;
  const date = req.query.date;
  const rayon = req.query.rayon;
  const course = req.query.course;
  var _output = new output();
  var query =
    "call filtercoach('" +
    ville +
    "','" +
    date +
    "','" +
    rayon +
    "','" +
    course +
    "')";
  await db_library
    .execute(query)
    .then(value => {
      if (value.length > 0) {
        var result = value[0];
        for (var i = 0; i < value[0].length; i++) {
          result[i].Coach_Services = value[0][i].Coach_Services.split(",");
        }
        var res = {
          coach_list: result
        };
        _output.data = res;
        _output.isSuccess = true;
        _output.message = "L'entraîneur réussit";
      } else {
        var obj = {
          coach_list: []
        };
        _output.data = obj;
        _output.isSuccess = true;
        _output.message = "Aucun entraîneur trouvé";
      }
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "L'entraîneur a échoué";
    });
  res.send(_output);
};

// exports.searchByCoach = async function (req, res, next) {
//   const ville = req.query.ville;
//   const date = req.query.date;
//   const rayon = req.query.rayon;
//   const course = req.query.course;
//   var _output = new output();
//   //SDKAT - START
//   var where = "";
//   var query = "";

//   // Checking for the Rayon is Empty
//   if (rayon == "0") {
//     if (ville !== "") {
//       const postalCode = ville.trim();
//       // where += " AND u.postalCode = '" + postalCode + "'";
//       where += " AND c.Coach_Ville = '" + postalCode + "'";

//     }
//     if (course !== "") {
//       const courses = course.trim();
//       where += " AND c.Coach_Services LIKE '%" + courses + "%'";
//     }
//     if (date != "" && date != "null") {
//       const dateData = formatDateToString(new Date(date));
//       where += " AND a.Date = '" + dateData + "' GROUP BY a.Date";
//     }

//     var query =
//       "SELECT DISTINCT (c.Coach_ID), c.Coach_Fname, c.InstagramURL,c.Coach_Resume, c.TwitterURL,c.FacebookURL, c.Coach_Phone, c.Coach_Lname, c.Coach_Email, c.Coach_Price, c.Coach_PriceX10, c.Coach_Description, c.Coach_Services,c.Coach_Image, u.Id FROM coaches_dbs c inner join users u on c.Coach_Email = u.email left join avaiablity a on u.id = a.CoachId WHERE u.roleId = 2 AND u.isActive = 1" +
//       where;

//     console.log(query, 'Query');

//   } // End of rayon=='null' || rayon=='0'
//   else {
//     if (course !== "") {
//       //const courses = course.trim();
//       where += " AND coaches_dbs.Coach_Services LIKE '%" + course + "%'";
//     }
//     if (date != "" && date != "null") {
//       where += " AND avaiablity.Date = '" + date + "' GROUP BY avaiablity.Date";
//     }
//     var query_internal =
//       "SELECT Code_postal,coordonnees_gps FROM cities WHERE `Code_postal`=" +
//       ville;
//     await db_library.execute(query_internal).then(async results => {
//       if (results.length > 0) {
//         // If Results Greater than 0 Process the Code postal along with latitude and Longitude
//         let Code_postal = results[0].Code_postal;
//         let coordonnees_gps = results[0].coordonnees_gps;
//         let lat_long = coordonnees_gps.split(",");
//         let longitude = lat_long[0];
//         let latitude = lat_long[1];
//         const postal_codes_list = await calculateLocation.calculateLocationRadius(
//           longitude,
//           latitude,
//           Code_postal,
//           rayon
//         );
//         console.log(postal_codes_list, 'IN');
//         if (postal_codes_list.length > 0) {
//           query =
//             "SELECT DISTINCT(coaches_dbs.Coach_ID),coaches_dbs.Coach_Fname,coaches_dbs.Coach_Resume,coaches_dbs.Coach_Lname,coaches_dbs.InstagramURL,coaches_dbs.TwitterURL,coaches_dbs.FacebookURL,coaches_dbs.Coach_Phone, coaches_dbs.Coach_Email,coaches_dbs.Coach_Price, coaches_dbs.Coach_PriceX10, coaches_dbs.Coach_Description,coaches_dbs.Coach_Services,users.id FROM users JOIN coaches_dbs ON users.email = coaches_dbs.Coach_Email LEFT JOIN avaiablity ON users.id=avaiablity.CoachId WHERE users.postalCode IN (" +
//             postal_codes_list +
//             ") AND users.roleId='2' AND users.isActive='1'" +
//             where;
//         } else {
//           query =
//             "SELECT DISTINCT(coaches_dbs.Coach_ID),coaches_dbs.Coach_Fname,coaches_dbs.Coach_Resume,coaches_dbs.Coach_Lname,coaches_dbs.InstagramURL,coaches_dbs.TwitterURL,coaches_dbs.FacebookURL,coaches_dbs.Coach_Phone, coaches_dbs.Coach_Email,coaches_dbs.Coach_Price, coaches_dbs.Coach_PriceX10, coaches_dbs.Coach_Description,coaches_dbs.Coach_Services,users.id FROM users JOIN coaches_dbs ON users.email = coaches_dbs.Coach_Email LEFT JOIN avaiablity ON users.id=avaiablity.CoachId WHERE users.postalCode IN ('') AND users.roleId='2' AND users.isActive='1'" +
//             where;
//         } // End of Postal_codes.length <0
//       } // End of results.length > 0
//       else {
//         query =
//           "SELECT Code_postal,coordonnees_gps FROM cities WHERE `Code_postal`=" +
//           ville;
//       } // End of results.length < 0
//     }); // End of async results
//   } // End of rayon!='null' || rayon!='0'
//   await db_library
//     .execute(query)
//     .then(value => {

//       if (value.length > 0) {
//         var result = value;
//         for (var i = 0; i < value.length; i++) {
//           result[i].Coach_Services = value[i].Coach_Services.split(",");
//         }
//         var res = {
//           coach_list: result
//         };
//         _output.data = res;
//         _output.isSuccess = true;
//         _output.message = "L'entraîneur réussit";
//       } else {
//         var obj = {
//           coach_list: []
//         };
//         _output.data = obj;
//         _output.isSuccess = true;
//         _output.message = "Aucun entraîneur trouvé";
//       }
//     })
//     .catch(err => {
//       _output.data = err.message;
//       _output.isSuccess = false;
//       _output.message = "L'entraîneur a échoué";
//     });
//   res.send(_output);
// };


exports.searchByCoach = async function (req, res, next) {
  const ville = req.query.ville;
  const date = req.query.date;
  const rayon = req.query.rayon;
  const course = req.query.course;
  var _output = new output();
  //SDKAT - START
  var where = "";
  var query = "";

  // Checking for the Rayon is Empty
  if (rayon == "0") {
    if (ville !== "") {
      const postalCode = ville.trim();
      // where += " AND u.postalCode = '" + postalCode + "'";
      where += " AND c.Coach_Ville = '" + postalCode + "'";

    }
    if (course !== "") {
      const courses = course.trim();
      where += " AND c.Coach_Services LIKE '%" + courses + "%'";
    }
    if (date != "" && date != "null") {
      const dateData = formatDateToString(new Date(date));
      // where += " AND a.Date = '" + dateData + "' GROUP BY a.Date"; feb-08
      where += " AND a.Date = '" + dateData + "'";


    }

    where += "  GROUP BY c.Coach_ID ";

    var query =
      "SELECT c.Coach_ID, c.Coach_Fname, c.Coach_Ville, c.InstagramURL,c.Coach_Resume, c.TwitterURL,c.FacebookURL, c.Coach_Phone, c.Coach_Lname, c.Coach_Email, c.Coach_Price, c.Coach_PriceX10, c.Coach_Description, c.Coach_Services,c.Coach_Image, u.Id FROM coaches_dbs c inner join users u on c.Coach_Email = u.email LEFT JOIN avaiablity a ON u.id = a.CoachId  where u.isActive = 1" +
      where;

    console.log(query, 'Query');

  } // End of rayon=='null' || rayon=='0'
  else {
    if (course !== "") {
      //const courses = course.trim();
      where += " AND c.Coach_Services LIKE '%" + course + "%'";
    }
    if (date != "" && date != "null") {
      // where += " AND avaiablity.Date = '" + date + "' GROUP BY avaiablity.Date";
      where += " AND avaiablity.Date = '" + date + "' ";
    }


    
    var query_internal =
      "SELECT Code_postal,coordonnees_gps FROM cities WHERE `Code_postal`=" +
      ville;
      console.log('query_internal111',query_internal)
    await db_library.execute(query_internal).then(async results => {
      if (results.length > 0) {
        // If Results Greater than 0 Process the Code postal along with latitude and Longitude
        let Code_postal = results[0].Code_postal;
        let coordonnees_gps = results[0].coordonnees_gps;
        let lat_long = coordonnees_gps.split(",");
        let longitude = lat_long[0];
        let latitude = lat_long[1];
        // console.log('isssueee...');
        let postal_codes_list = await calculateLocation.calculateLocationbyrayon(
          longitude,
          latitude,
          Code_postal,
          rayon
        );
        // console.log('postal_codes_list',postal_codes_list);

        //query =
        //             "SELECT DISTINCT(coaches_dbs.Coach_ID),coaches_dbs.Coach_Fname,coaches_dbs.Coach_Resume,coaches_dbs.Coach_Lname,coaches_dbs.InstagramURL,coaches_dbs.TwitterURL,coaches_dbs.FacebookURL,coaches_dbs.Coach_Phone, coaches_dbs.Coach_Email,coaches_dbs.Coach_Price, coaches_dbs.Coach_PriceX10, coaches_dbs.Coach_Description,coaches_dbs.Coach_Services,users.id FROM users JOIN coaches_dbs ON users.email = coaches_dbs.Coach_Email LEFT JOIN avaiablity ON users.id=avaiablity.CoachId WHERE users.postalCode IN (" +
        //             postal_codes_list +
        //             ") AND users.roleId='2' AND users.isActive='1'" +
        //             where;

        //  query = "SELECT c.Coach_ID,c.Coach_Rayon as crayon,c.Coach_Fname,c.Coach_Resume,c.Coach_Lname,c.InstagramURL,c.TwitterURL,c.FacebookURL,c.Coach_Phone,c.Coach_Email,c.Coach_Price,c.Coach_PriceX10,c.Coach_Description,c.Coach_Services,users.id,111.111 *DEGREES(ACOS(LEAST(1.0, COS(RADIANS(SUBSTRING_INDEX(t.coordonnees_gps, ',', -1))) * COS(RADIANS(" +
        //              latitude +
        //              "))* COS(RADIANS(SUBSTRING_INDEX(t.coordonnees_gps, ',', 1) - " +
        //              longitude +
        //              "))+ SIN(RADIANS(SUBSTRING_INDEX(t.coordonnees_gps, ',', -1)))* SIN(RADIANS(" +
        //              latitude +
        //             "))))) AS distance_in_km FROM coaches_dbs c left join cities t on t.Code_postal = c.Coach_Ville left join users on users.email = c.Coach_Email LEFT JOIN avaiablity ON users.id = avaiablity.CoachId where users.roleId='2' AND users.isActive='1'"
        //              + where +
        //              "  having (distance_in_km - crayon) <= " +
        //               rayon ;

        // query = "SELECT c.Coach_ID,c.Coach_Rayon as crayon,c.Coach_Fname,c.Coach_Resume,c.Coach_Lname,c.InstagramURL,c.TwitterURL,c.FacebookURL,c.Coach_Phone,c.Coach_Email,c.Coach_Price,c.Coach_PriceX10,c.Coach_Description,c.Coach_Services,users.id, " +
        //   " (SELECT JSON_ARRAYAGG( Code_postal) FROM(SELECT c.Code_postal, (6371 * ACOS(COS(RADIANS(SUBSTRING_INDEX(t.coordonnees_gps, ',', -1))) * COS(RADIANS(SUBSTRING_INDEX(c.coordonnees_gps, ',', -1))) * COS(RADIANS(SUBSTRING_INDEX(c.coordonnees_gps, ',', 1)) - RADIANS(SUBSTRING_INDEX(t.coordonnees_gps, ',', 1))) + SIN(RADIANS(SUBSTRING_INDEX(t.coordonnees_gps, ',', -1))) * SIN(RADIANS(SUBSTRING_INDEX(c.coordonnees_gps, ',', -1))))) AS distance, c.coordonnees_gps FROM cities c GROUP BY c.Code_postal HAVING ( distance > 0 AND distance <= "+ rayon +") ORDER BY distance ASC) AS table1) AS pcodes" +
        //   " FROM coaches_dbs c left join cities t on t.Code_postal = c.Coach_Ville left join users on users.email = c.Coach_Email LEFT JOIN avaiablity ON users.id = avaiablity.CoachId where users.roleId='2' AND users.isActive='1'" +
        //    where +
        //   "  having  JSON_OVERLAPS(pcodes, JSON_ARRAY(" + postal_codes_list + ")) > 0 "
        //   ;

         postal_codes_list.push(Number(ville));

        // console.log("postal_codes_list==========::::::::> ", postal_codes_list)

    

        where += "  GROUP BY c.Coach_ID ";

          query = "SELECT c.Coach_ID,c.Coach_Rayon as crayon,c.Coach_Ville,c.Coach_Fname,c.Coach_Resume,c.Coach_Lname,c.InstagramURL,c.TwitterURL,c.FacebookURL,c.Coach_Phone,c.Coach_Email,c.Coach_Price,c.Coach_PriceX10,c.Coach_Description,c.Coach_Services,users.id, " +
          
          " c.Service_codes as pcodes FROM coaches_dbs c left join cities t on t.Code_postal = c.Coach_Ville left join users on users.email = c.Coach_Email LEFT JOIN avaiablity ON users.id = avaiablity.CoachId where users.roleId='2' AND users.isActive='1'" +
           where 
         + " having JSON_OVERLAPS(pcodes, JSON_ARRAY(" + postal_codes_list.join(",") + ")) > 0  "
          ;




        //console.log(query, 'IN');
        // End of Postal_codes.length <0
      } // End of results.length > 0
      else {
        query =
          "SELECT Code_postal,coordonnees_gps FROM cities WHERE `Code_postal`=" +
          ville;
      }
      console.log(query, 'Querysureshtesting...');
    });
    
  } // End of rayon!='null' || rayon!='0'
  
  await db_library
    .execute(query)
    .then(value => {

      if (value.length > 0) {
        var result = value;
        for (var i = 0; i < value.length; i++) {
          result[i].Coach_Services = value[i].Coach_Services.split(",");
        }
        var res = {
          coach_list: result
        };
        _output.data = res;
        _output.isSuccess = true;
        _output.message = "L'entraîneur réussit";
      } else {
        var obj = {
          coach_list: []
        };
        _output.data = obj;
        _output.isSuccess = true;
        _output.message = "Aucun entraîneur trouvé";
      }
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "L'entraîneur a échoué";
    });
  res.send(_output);
};



exports.searchByCoachList = async function (req, res, next) {
  const ville = req.query.ville;
  const date = req.query.date;
  const rayon = req.query.rayon;
  const course = req.query.course;
  var _output = new output();
  var where = "";
  var query;
  var query_data;
  var where1 = "";

  if (rayon == "0") {
    if (course == "CoursIndividuel") {
      const postalCode = ville.trim();
      where1 = " c.Postalcode = '" + postalCode + "'";
      where1 += " OR d.postalCode = '" + postalCode + "'";
      query =
        "SELECT DISTINCT  c.Coach_Id FROM individualcourses c join users d on c.Coach_Id = d.id WHERE " +
        where1;
    } else if (course == "CoursCollectifOndemand") {

      const postalCode = ville.trim();
      where1 = " c.Postalcode = '" + postalCode + "'";
      where1 += " OR d.postalCode = '" + postalCode + "'";
      query =
        "SELECT c.Coach_Id FROM course_collective_if_demand c join users d on c.Coach_Id = d.id WHERE " +
        where1;
    } else if (course == "CoursCollectifClub") {

      const postalCode = ville.trim();
      where1 = " c.Postalcode = '" + postalCode + "'";
      where1 += " OR d.postalCode = '" + postalCode + "'";
      query =
        "SELECT c.Coach_Id FROM couse_collective_if_club c join users d on c.Coach_Id = d.id WHERE " +
        where1;
    }
    else if (course == "TeamBuilding") {
      const postalCode = ville.trim();
      where1 = " c.Postalcode = '" + postalCode + "'";
      where1 += " OR d.postalCode = '" + postalCode + "'";
      query =
        "SELECT c.Coach_Id FROM team_building c join users d on c.Coach_Id = d.id WHERE " +
        where1;
    }
    else {
      const postalCode = ville.trim();
      where1 = " d.postalCode = '" + postalCode + "'";
      query =
        "SELECT Coach_ID as Coach_Id FROM coaches_dbs d WHERE " +
        where1;
    }

    if (course !== "") {
      const courses = course.trim();
      where += " AND c.Coach_Services LIKE '%" + courses + "%'";
    }
    if (date != "" && date != "null") {
      const dateData = formatDateToString(new Date(date));
      where += " AND a.Date = '" + dateData + "' GROUP BY a.Date";
    }
    await db_library.execute(query).then(async value => {
      if (value.length > 0) {
        var arrData = [];
        for (let j = 0; j < value.length; j++) {
          arrData.push(value[j].Coach_Id);
        }
        query_data =
          "SELECT DISTINCT (c.Coach_ID), c.Coach_Fname, c.InstagramURL, c.TwitterURL,c.FacebookURL, c.Coach_Phone, c.Coach_Lname, c.Coach_Email, c.Coach_Price, c.Coach_PriceX10, c.Coach_Description, c.Coach_Services,c.Coach_Image, u.Id FROM coaches_dbs c inner join users u on c.Coach_Email = u.email left join avaiablity a on u.id = a.CoachId WHERE u.id IN (" +
          arrData +
          ") AND u.roleId = 2 AND u.isActive = 1";
      } else {
        if (ville !== "") {
          const postalCode = ville.trim();
          where += " AND u.postalCode = '" + postalCode + "'";
        }
        query_data =
          "SELECT DISTINCT (c.Coach_ID), c.Coach_Fname, c.InstagramURL, c.TwitterURL,c.FacebookURL, c.Coach_Phone, c.Coach_Lname, c.Coach_Email, c.Coach_Price, c.Coach_PriceX10, c.Coach_Description, c.Coach_Services,c.Coach_Image, u.Id FROM coaches_dbs c inner join users u on c.Coach_Email = u.email left join avaiablity a on u.id = a.CoachId WHERE u.roleId = 2 AND u.isActive = 1" +
          where;
      }
    });
  } else {
    var Rayon = parseInt(rayon, 10);
    if (ville !== "") {
      const postalCode = ville.trim();
      where1 += " AND c.Coach_Ville = '" + postalCode + "'";
      where1 += " AND c.Coach_Rayon <= '" + Rayon + "'";
      where1 += " AND c.Coach_Services LIKE '%" + course + "%'";
    }
    query_data =
      "SELECT DISTINCT (c.Coach_ID), c.Coach_Fname, c.InstagramURL, c.TwitterURL,c.FacebookURL, c.Coach_Phone, c.Coach_Lname, c.Coach_Email, c.Coach_Price, c.Coach_PriceX10, c.Coach_Description, c.Coach_Services,c.Coach_Image, u.Id FROM coaches_dbs c inner join users u on c.Coach_Email = u.email left join avaiablity a on u.id = a.CoachId WHERE u.roleId = 2 AND u.isActive = 1" +
      where1;
  }
  console.log(query_data);
  await db_library.execute(query_data).then(value_data => {
    if (value_data.length > 0) {
      var result = value_data;
      for (var i = 0; i < value_data.length; i++) {
        result[i].Coach_Services = value_data[i].Coach_Services.split(",");
      }
      var res = {
        coach_list: result
      };
      _output.data = res;
      _output.isSuccess = true;
      _output.message = "L'entraîneur réussit";
    } else {
      var obj = {
        coach_list: []
      };
      _output.data = obj;
      _output.isSuccess = true;
      _output.message = "Aucun entraîneur trouvé";
    }
  });
  res.send(_output);
}





// exports.searchByEvent = async function (req, res, next) {
//   const ville = req.query.ville;
//   const date = req.query.date;
//   const rayon = req.query.rayon;
//   const course = req.query.course;
//   var _output = new output();
//   var where = "";
//   var query;
//   var where1 = "";

//   if (course == "Stage" || course == "Tournament") {
//     if (ville !== "") {
//       var postalcodequery = (course == "Stage") ? "cs.postalCode" : "t.postalCode";
//       const postalCode = ville.trim();
//       where += " AND " + postalcodequery + " = '" + postalCode + "'";
//     }
//     if (date != "" && date != 'null') {
//       var dateData = formatDateToString(new Date(date));
//       var currentMonth = new Date(dateData).getMonth() + 1;
//       var currentYear = new Date(dateData).getFullYear();
//     } else {
//       var dateData = formatDateToString(new Date());
//       var currentMonth = new Date().getMonth() + 1;
//       var currentYear = new Date().getFullYear();
//     }

//   } else {
//     if (ville !== "") {
//       var postalcodequery = (course == "Animation") ? "a.postalCode" : "tb.postalCode";
//       const postalCode = ville.trim();
//       where += " where " + postalcodequery + " = '" + postalCode + "';";
//     } else {
//       where += "";
//     }
//   }
//   if (rayon == '0') {
//     if (course == "Stage") {
//       query =
//         "SELECT  cs.id,cs.Eventname,cs.address,cs.from_date,cs.to_date,cs.Description,cs.Postalcode,cs.Mode_of_transport,cs.Eventdetails,cs.Photo,cs.filename,cs.Price,cs.Plan,cs.Coach_Id,ci.Libelle_acheminement as Location FROM course_stage  cs INNER join cities ci on ci.Code_commune_INSEE = cs.Coach_Ville and  ci.Code_postal = cs.Postalcode INNER join users u on u.id=cs.Coach_Id   INNER join  coaches_dbs coach on coach.Coach_Email=u.email where cs.from_date >= '" +
//         dateData +
//         "' AND MONTH(cs.to_date) >= '" +
//         currentMonth +
//         "' AND YEAR(cs.to_date) >= '" +
//         currentYear + "'" + where + " GROUP BY cs.id ORDER BY cs.id DESC";

//     } else if (course == "Tournament") {
//       query =
//         "SELECT t.id,t.Tournamentname,t.Mode_of_transport,t.from_date,t.to_date,t.Description,t.Postalcode,t.address,t.Eventdetails,t.Photo,t.filename,t.Price,t.Plan,t.Coach_Id,ci.Libelle_acheminement as Location FROM tournament t INNER join cities ci on ci.Code_commune_INSEE = t.Coach_Ville and ci.Code_postal = t.Postalcode INNER join users u on u.id=t.Coach_Id INNER join coaches_dbs coach on coach.Coach_Email=u.email where t.from_date >= '" +
//         dateData +
//         "' AND MONTH(t.to_date) >= '" +
//         currentMonth +
//         "' AND YEAR(t.to_date) >= '" +
//         currentYear + "'" + where + " GROUP BY t.id ORDER BY t.id DESC";


//     } else if (course == "Animation") {

//       query =
//         "SELECT a.id,a.animations_name as Eventname,a.Mode_of_transport,a.Description,a.Postalcode,a.address,a.Eventdetails,a.Photo,a.filename,a.Plan,a.Coach_Id,ci.Libelle_acheminement as Location FROM animations a INNER join cities ci on ci.Code_commune_INSEE = a.Coach_Ville and ci.Code_postal = a.Postalcode INNER join users u on u.id=a.Coach_Id  INNER join  coaches_dbs coach on coach.Coach_Email=u.email" + where + " GROUP BY a.id ORDER BY a.id DESC";
//       ;

//     } else {

//       query = "SELECT tb.id,tb.Eventname,tb.Description,tb.Mode_of_transport,tb.address,tb.Eventdetails,tb.Photo,tb.filename,tb.Plan,tb.Postalcode,tb.Coach_Id,ci.Libelle_acheminement as Location FROM team_building tb INNER join cities ci on ci.Code_commune_INSEE = tb.Coach_Ville and ci.Code_postal = tb.Postalcode INNER join users u on u.id=tb.Coach_Id  INNER join  coaches_dbs coach on coach.Coach_Email=u.email" + where + " GROUP BY tb.id ORDER BY tb.id DESC";
//       ;
//     }
//     //console.log(query);
//     await db_library
//       .execute(query)
//       .then(value => {
//         if (value.length > 0) {
//           if (course == "Stage") {
//             var resultObj = [];
//             let objects = {};
//             for (let i = 0; i < value.length; i++) {
//               const resultCurrentMonth =
//                 new Date(value[i].to_date).getMonth() + 1;
//               const resultCurrentYear = new Date(value[i].to_date).getFullYear();

//               if (
//                 resultCurrentMonth == currentMonth &&
//                 resultCurrentYear == currentYear
//               ) {
//                 const currentDate = formatDateToString(new Date());
//                 const resultCurrentDate = formatDateToString(
//                   new Date(value[i].to_date)
//                 );
//                 if (resultCurrentDate > currentDate) {

//                   objects = {
//                     id: value[i].id,
//                     Eventname: value[i].Eventname,
//                     from_date: value[i].from_date,
//                     to_date: value[i].to_date,
//                     Description: value[i].Description,
//                     Location: value[i].Location,
//                     Postalcode: value[i].Postalcode,
//                     Mode_of_transport: value[i].Mode_of_transport,
//                     Eventdetails: value[i].Eventdetails,
//                     Photo: value[i].Photo,
//                     filename: value[i].filename,
//                     Price: value[i].Price,
//                     Address: value[i].address,
//                     Plan: value[i].Plan,
//                     Coach_Id: value[i].Coach_Id,
//                     isReserveButton: true
//                   };
//                 } else {

//                   objects = {
//                     id: value[i].id,
//                     Eventname: value[i].Eventname,
//                     from_date: value[i].from_date,
//                     to_date: value[i].to_date,
//                     Description: value[i].Description,
//                     Location: value[i].Location,
//                     Postalcode: value[i].Postalcode,
//                     Mode_of_transport: value[i].Mode_of_transport,
//                     Eventdetails: value[i].Eventdetails,
//                     Photo: '',
//                     filename: value[i].filename,
//                     Price: value[i].Price,
//                     Address: value[i].address,
//                     Plan: value[i].Plan,
//                     Coach_Id: value[i].Coach_Id,
//                     isReserveButton: false
//                   };
//                 }
//               } else {

//                 objects = {
//                   id: value[i].id,
//                   Eventname: value[i].Eventname,
//                   from_date: value[i].from_date,
//                   to_date: value[i].to_date,
//                   Description: value[i].Description,
//                   Location: value[i].Location,
//                   Postalcode: value[i].Postalcode,
//                   Mode_of_transport: value[i].Mode_of_transport,
//                   Eventdetails: value[i].Eventdetails,
//                   Photo: value[i].Photo,
//                   filename: value[i].filename,
//                   Price: value[i].Price,
//                   Address: value[i].address,
//                   Plan: value[i].Plan,
//                   Coach_Id: value[i].Coach_Id,
//                   isReserveButton: true
//                 };
//               }
//               resultObj.push(objects);
//             }
//             var obj = {
//               event_list: resultObj
//             };
//           } else {
//             var obj = {
//               event_list: value
//             };
//           }
//           _output.data = obj;
//           _output.isSuccess = true;
//           _output.message = "Événement réussi";
//         } else {
//           var obj = {
//             event_list: []
//           };
//           _output.data = obj;
//           _output.isSuccess = true;
//           _output.message = "Aucun événement trouvé";
//         }
//       })
//       .catch(err => {
//         _output.data = err.message;
//         _output.isSuccess = false;
//         _output.message = "L'événement a échoué";
//       });

//   } else {


//     if (course == "Stage") {
//       var Rayon = parseInt(rayon, 10);
//       if (ville !== "") {
//         const postalCode = ville.trim();
//         where1 += " AND cs.Postalcode = '" + postalCode + "'";
//         where1 += " AND coach.Coach_Rayon <= '" + Rayon + "' GROUP BY cs.id ORDER BY cs.id DESC ";
//       }

//       query_internal =
//         "SELECT  cs.id,cs.Eventname,cs.from_date,cs.address,cs.to_date,cs.Description,cs.Postalcode,cs.Mode_of_transport,cs.Eventdetails,cs.Photo,cs.filename,cs.Price,cs.Plan,cs.Coach_Id,ci.Libelle_acheminement as Location FROM course_stage  cs INNER join cities ci on ci.Code_commune_INSEE = cs.Coach_Ville and  ci.Code_postal = cs.Postalcode INNER join users u on u.id=cs.Coach_Id   INNER join  coaches_dbs coach on coach.Coach_Email=u.email where cs.from_date >= '" +
//         dateData +
//         "' AND MONTH(cs.to_date) >= '" +
//         currentMonth +
//         "' AND YEAR(cs.to_date) >= '" +
//         currentYear + "'" + where1



//     } else if (course == "Tournament") {

//       var Rayon = parseInt(rayon, 10);
//       if (ville !== "") {
//         const postalCode = ville.trim();
//         where1 += " AND t.Postalcode = '" + postalCode + "'";
//         where1 += " AND coach.Coach_Rayon <= '" + Rayon + "' GROUP BY tournament.id ORDER BY tournament.id DESC";
//       }
//       query_internal =
//         "SELECT t.id,t.Tournamentname,t.from_date,t.to_date,t.address,t.Description,t.Postalcode,t.Eventdetails,t.Photo,t.filename,t.Price,t.Plan,t.Coach_Id,ci.Libelle_acheminement as Location FROM tournament t INNER join cities ci on ci.Code_commune_INSEE = t.Coach_Ville and ci.Code_postal = t.Postalcode INNER join users u on u.id=t.Coach_Id INNER join coaches_dbs coach on coach.Coach_Email=u.email where t.from_date >= '" +
//         dateData +
//         "' AND MONTH(t.to_date) >= '" +
//         currentMonth +
//         "' AND YEAR(t.to_date) >= '" +
//         currentYear + "'" + where1

//     } else if (course == "Animation") {

//       var Rayon = parseInt(rayon, 10);
//       if (ville !== "") {
//         const postalCode = ville.trim();
//         where1 += " WHERE a.Postalcode = '" + postalCode + "'";
//         where1 += " AND coach.Coach_Rayon <= '" + Rayon + "' GROUP BY a.id ORDER BY a.id DESC";
//       }

//       query_internal =
//         "SELECT a.id,a.animations_name as Eventname,a.Description,a.address,a.Postalcode,a.Eventdetails,a.Photo,a.filename,a.Plan,a.Coach_Id,ci.Libelle_acheminement as Location FROM animations a INNER join cities ci on ci.Code_commune_INSEE = a.Coach_Ville and ci.Code_postal = a.Postalcode INNER join users u on u.id=a.Coach_Id  INNER join  coaches_dbs coach on coach.Coach_Email=u.email" + where1;


//     } else {
//       var Rayon = parseInt(rayon, 10);
//       if (ville !== "") {
//         const postalCode = ville.trim();
//         where1 += " AND tb.Postalcode = '" + postalCode + "'";
//         where1 += " AND coach.Coach_Rayon <= '" + Rayon + "' GROUP BY tb.id ORDER BY tb.id DESC";
//       }

//       /*query_internal =
//       "SELECT team_building.*,coaches_dbs.* from team_building JOIN coaches_dbs ON  team_building.Coach_Id = coaches_dbs.Coach_ID " + where1;*/

//       query_internal = "SELECT tb.id,tb.Eventname,tb.Description,tb.address,tb.Mode_of_transport,tb.Eventdetails,tb.Photo,tb.filename,tb.Plan,tb.Postalcode,tb.Coach_Id,ci.Libelle_acheminement as Location FROM team_building tb INNER join cities ci on ci.Code_commune_INSEE = tb.Coach_Ville and ci.Code_postal = tb.Postalcode INNER join users u on u.id=tb.Coach_Id  INNER join  coaches_dbs coach on coach.Coach_Email=u.email" + where1;

//     }


//     await db_library
//       .execute(query_internal)
//       .then(value => {
//         if (value.length > 0) {
//           if (course == "Stage") {
//             var resultObj = [];
//             let objects = {};
//             for (let i = 0; i < value.length; i++) {
//               const resultCurrentMonth =
//                 new Date(value[i].to_date).getMonth() + 1;
//               const resultCurrentYear = new Date(value[i].to_date).getFullYear();
//               if (
//                 resultCurrentMonth == currentMonth &&
//                 resultCurrentYear == currentYear
//               ) {
//                 const currentDate = formatDateToString(new Date());
//                 const resultCurrentDate = formatDateToString(
//                   new Date(value[i].to_date)
//                 );
//                 if (resultCurrentDate > currentDate) {
//                   objects = {
//                     id: value[i].id,
//                     Eventname: value[i].Eventname,
//                     from_date: value[i].from_date,
//                     to_date: value[i].to_date,
//                     Description: value[i].Description,
//                     Location: value[i].Location,
//                     Postalcode: value[i].Postalcode,
//                     Mode_of_transport: value[i].Mode_of_transport,
//                     Eventdetails: value[i].Eventdetails,
//                     Photo: value[i].Photo,
//                     filename: value[i].filename,
//                     Price: value[i].Price,
//                     Address: value[i].address,
//                     Plan: value[i].Plan,
//                     Coach_Id: value[i].Coach_Id,
//                     isReserveButton: true
//                   };
//                 } else {
//                   objects = {
//                     id: value[i].id,
//                     Eventname: value[i].Eventname,
//                     from_date: value[i].from_date,
//                     to_date: value[i].to_date,
//                     Description: value[i].Description,
//                     Location: value[i].Location,
//                     Postalcode: value[i].Postalcode,
//                     Mode_of_transport: value[i].Mode_of_transport,
//                     Eventdetails: value[i].Eventdetails,
//                     Photo: '',
//                     filename: value[i].filename,
//                     Price: value[i].Price,
//                     Address: value[i].address,
//                     Plan: value[i].Plan,
//                     Coach_Id: value[i].Coach_Id,
//                     isReserveButton: false
//                   };
//                 }
//               } else {
//                 objects = {
//                   id: value[i].id,
//                   Eventname: value[i].Eventname,
//                   from_date: value[i].from_date,
//                   to_date: value[i].to_date,
//                   Description: value[i].Description,
//                   Location: value[i].Location,
//                   Postalcode: value[i].Postalcode,
//                   Mode_of_transport: value[i].Mode_of_transport,
//                   Eventdetails: value[i].Eventdetails,
//                   Photo: '',
//                   filename: value[i].filename,
//                   Price: value[i].Price,
//                   Address: value[i].address,
//                   Plan: value[i].Plan,
//                   Coach_Id: value[i].Coach_Id,
//                   isReserveButton: true
//                 };
//               }
//               resultObj.push(objects);
//             }
//             var obj = {
//               event_list: resultObj
//             };
//           } else {
//             var obj = {
//               event_list: value
//             };
//           }
//           _output.data = obj;
//           _output.isSuccess = true;
//           _output.message = "Événement réussi";
//         } else {
//           var obj = {
//             event_list: []
//           };
//           _output.data = obj;
//           _output.isSuccess = true;
//           _output.message = "Aucun événement trouvé";
//         }
//       })
//       .catch(err => {
//         _output.data = err.message;
//         _output.isSuccess = false;
//         _output.message = "L'événement a échoué";
//       });


//   }


//   res.send(_output);
// }

exports.searchByEvent = async function (req, res, next) {
  const ville = req.query.ville;
  const date = req.query.date;
  const rayon = req.query.rayon;
  const course = req.query.course;
  var _output = new output();
  var where = "";
  var query;
  var where1 = "";
  let Code_postal = "";
  let coordonnees_gps = "";
  let lat_long = "";
  let longitude = "";
  let latitude = "";




  var external_query =
    "SELECT Code_postal,coordonnees_gps FROM cities WHERE `Code_postal`=" +
    ville;
  console.log('external_query',external_query);
  // await db_library.execute(external_query).then(async results => {

  //   // If Results Greater than 0 Process the Code postal along with latitude and Longitude
  //   Code_postal = results[0].Code_postal;
  //   coordonnees_gps = results[0].coordonnees_gps;
  //   lat_long = coordonnees_gps.split(",");
  //   longitude = lat_long[0];
  //   latitude = lat_long[1];
  // })

  if (course == "Stage" || course == "Tournament") {
    if (ville !== "") {
      var postalcodequery = (course == "Stage") ? "cs.Postalcode" : "t.postalCode";
      const postalCode = ville.trim();
      where += " AND " + postalcodequery + " = '" + postalCode + "'";
    }
    if (date != "" && date != 'null') {
      var dateData = formatDateToString(new Date(date));
      var currentMonth = new Date(dateData).getMonth() + 1;
      var currentYear = new Date(dateData).getFullYear();
    } else {
      var dateData = formatDateToString(new Date());
      var currentMonth = new Date().getMonth() + 1;
      var currentYear = new Date().getFullYear();
    }

  } else {
    if (ville !== "") {
      var postalcodequery = (course == "Animation") ? "a.postalCode" : "tb.postalCode";
      const postalCode = ville.trim();
      where += " where " + postalcodequery + " = '" + postalCode + "'";
    } else {
      where += "";
    }
  }
  if (rayon == '0') {
    if (course == "Stage") {
      query =
        "SELECT  cs.id,cs.Eventname,cs.address,cs.from_date,cs.to_date,cs.Description,cs.Postalcode,cs.Mode_of_transport,cs.Eventdetails,cs.Photo,cs.filename,cs.Price,cs.Plan,cs.Coach_Id,ci.Libelle_acheminement as Location FROM course_stage  cs INNER join cities ci on ci.Code_commune_INSEE = cs.Coach_Ville and  ci.Code_postal = cs.Postalcode INNER join users u on u.id=cs.Coach_Id   INNER join  coaches_dbs coach on coach.Coach_Email=u.email where cs.from_date >= " +
        dateData +
        " AND MONTH(cs.to_date) >= " +
        currentMonth +
        " AND YEAR(cs.to_date) >= " +
        currentYear + " " + where + " GROUP BY cs.id ORDER BY cs.id DESC";

    } else if (course == "Tournament") {
      query =
        "SELECT t.id,t.Tournamentname,t.Mode_of_transport,t.from_date,t.to_date,t.Description,t.Postalcode,t.address,t.Eventdetails,t.Photo,t.filename,t.Price,t.Plan,t.Coach_Id,ci.Libelle_acheminement as Location FROM tournament t INNER join cities ci on ci.Code_commune_INSEE = t.Coach_Ville and ci.Code_postal = t.Postalcode INNER join users u on u.id=t.Coach_Id INNER join coaches_dbs coach on coach.Coach_Email=u.email where t.from_date >= '" +
        dateData +
        "' AND MONTH(t.to_date) >= '" +
        currentMonth +
        "' AND YEAR(t.to_date) >= '" +
        currentYear + "'" + where + " GROUP BY t.id ORDER BY t.id DESC";


    } else if (course == "Animation") {

      query =
        "SELECT a.id,a.animations_name as Eventname,a.Mode_of_transport,a.Description,a.Postalcode,a.address,a.Eventdetails,a.Photo,a.filename,a.Plan,a.Coach_Id,ci.Libelle_acheminement as Location FROM animations a INNER join cities ci on ci.Code_commune_INSEE = a.Coach_Ville and ci.Code_postal = a.Postalcode INNER join users u on u.id=a.Coach_Id  INNER join  coaches_dbs coach on coach.Coach_Email=u.email" + where + " GROUP BY a.id ORDER BY a.id DESC";
      ;

    } else {

      query = "SELECT tb.id,tb.Eventname,tb.Description,tb.Mode_of_transport,tb.address,tb.Eventdetails,tb.Photo,tb.filename,tb.Plan,tb.Postalcode,tb.Coach_Id,ci.Libelle_acheminement as Location FROM team_building tb INNER join cities ci on ci.Code_commune_INSEE = tb.Coach_Ville and ci.Code_postal = tb.Postalcode INNER join users u on u.id=tb.Coach_Id  INNER join  coaches_dbs coach on coach.Coach_Email=u.email" + where + " GROUP BY tb.id ORDER BY tb.id DESC";
      ;
    }
    console.log(query);
    await db_library
      .execute(query)
      .then(value => {
        if (value.length > 0) {
          if (course == "Stage") {
            var resultObj = [];
            let objects = {};
            for (let i = 0; i < value.length; i++) {
              const resultCurrentMonth =
                new Date(value[i].to_date).getMonth() + 1;
              const resultCurrentYear = new Date(value[i].to_date).getFullYear();

              if (
                resultCurrentMonth == currentMonth &&
                resultCurrentYear == currentYear
              ) {
                const currentDate = formatDateToString(new Date());
                const resultCurrentDate = formatDateToString(
                  new Date(value[i].to_date)
                );
                if (resultCurrentDate > currentDate) {

                  objects = {
                    id: value[i].id,
                    Eventname: value[i].Eventname,
                    from_date: value[i].from_date,
                    to_date: value[i].to_date,
                    Description: value[i].Description,
                    Location: value[i].Location,
                    Postalcode: value[i].Postalcode,
                    Mode_of_transport: value[i].Mode_of_transport,
                    Eventdetails: value[i].Eventdetails,
                    Photo: value[i].Photo,
                    filename: value[i].filename,
                    Price: value[i].Price,
                    Address: value[i].address,
                    Plan: value[i].Plan,
                    Coach_Id: value[i].Coach_Id,
                    isReserveButton: true
                  };
                } else {

                  objects = {
                    id: value[i].id,
                    Eventname: value[i].Eventname,
                    from_date: value[i].from_date,
                    to_date: value[i].to_date,
                    Description: value[i].Description,
                    Location: value[i].Location,
                    Postalcode: value[i].Postalcode,
                    Mode_of_transport: value[i].Mode_of_transport,
                    Eventdetails: value[i].Eventdetails,
                    Photo: '',
                    filename: value[i].filename,
                    Price: value[i].Price,
                    Address: value[i].address,
                    Plan: value[i].Plan,
                    Coach_Id: value[i].Coach_Id,
                    isReserveButton: false
                  };
                }
              } else {

                objects = {
                  id: value[i].id,
                  Eventname: value[i].Eventname,
                  from_date: value[i].from_date,
                  to_date: value[i].to_date,
                  Description: value[i].Description,
                  Location: value[i].Location,
                  Postalcode: value[i].Postalcode,
                  Mode_of_transport: value[i].Mode_of_transport,
                  Eventdetails: value[i].Eventdetails,
                  Photo: value[i].Photo,
                  filename: value[i].filename,
                  Price: value[i].Price,
                  Address: value[i].address,
                  Plan: value[i].Plan,
                  Coach_Id: value[i].Coach_Id,
                  isReserveButton: true
                };
              }
              resultObj.push(objects);
            }
            var obj = {
              event_list: resultObj
            };
          } else {
            var obj = {
              event_list: value
            };
          }
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Événement réussi";
        } else {
          var obj = {
            event_list: []
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Aucun événement trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "L'événement a échoué";
      });

  } else {

    const postalCode = ville.trim();

    let service_codes = [];
    if ( rayon == "0") {
      service_codes.push(postalCode);
    }else {
         var query_internal =
        "SELECT Code_postal,coordonnees_gps FROM cities WHERE `Code_postal`=" +
        postalCode;
      await db_library.execute(query_internal).then(async results => {
        if (results.length > 0) {
          // If Results Greater than 0 Process the Code postal along with latitude and Longitude
          let Code_postal = results[0].Code_postal;
          let coordonnees_gps = results[0].coordonnees_gps;
          let lat_long = coordonnees_gps.split(",");
          let longitude = lat_long[0];
          let latitude = lat_long[1];
          let pincodes = await calculateLocation.calculateLocationbyrayon(
            longitude,
            latitude,
            Code_postal,
            rayon
          );
          service_codes = service_codes.concat(pincodes);
         
        }else {
          service_codes.push(postalCode);
        }
      })
    }

    service_codes.push(postalCode);
    
    
    
    service_codes = service_codes.join(",");


    if (course == "Stage") {
      var Rayon = parseInt(rayon, 10);
      if (ville !== "") {
       

        // service_codes.join(',');====================================================

        where1 += " AND cs.Postalcode in("+service_codes+") GROUP BY cs.id ";
        //where1 += " AND coach.Coach_Rayon <= '" + Rayon + "' GROUP BY cs.id ORDER BY cs.id DESC ";
      }

      // query1 =
      //   "SELECT  cs.id,cs.Eventname,cs.from_date,cs.address,cs.to_date,cs.Description,cs.Postalcode,cs.Mode_of_transport,cs.Eventdetails,cs.Photo,cs.filename,cs.Price,cs.Plan,cs.Coach_Id,ci.Libelle_acheminement as Location FROM course_stage  cs INNER join cities ci on ci.Code_commune_INSEE = cs.Coach_Ville and  ci.Code_postal = cs.Postalcode INNER join users u on u.id=cs.Coach_Id   INNER join  coaches_dbs coach on coach.Coach_Email=u.email where cs.from_date >= '" +
      //   dateData +
      //   "' AND MONTH(cs.to_date) >= '" +
      //   currentMonth +
      //   "' AND YEAR(cs.to_date) >= '" +
      //   currentYear + "'" + where1


      query_internal = "SELECT  cs.id,cs.Eventname,cs.from_date,cs.address,cs.to_date,cs.Description,cs.Postalcode,cs.Mode_of_transport,cs.Eventdetails,cs.Photo,cs.filename,cs.Price,cs.Plan,cs.Coach_Id, ci.Libelle_acheminement as Location FROM course_stage  cs INNER join cities ci on ci.Code_commune_INSEE = cs.Coach_Ville and  ci.Code_postal = cs.Postalcode INNER join users u on u.id=cs.Coach_Id   INNER join  coaches_dbs coach on coach.Coach_Email=u.email where cs.from_date >= " +
        dateData +
        " AND MONTH(cs.to_date) >= " +
        currentMonth +
        " AND YEAR(cs.to_date) >= " +
        currentYear + " " +
        where1 +
        "ORDER BY cs.id DESC"



    } else if (course == "Tournament") {

      var Rayon = parseInt(rayon, 10);
      if (ville !== "") {
        where1 += " AND t.Postalcode in("+service_codes+") GROUP BY t.id ";
        //where1 += " AND coach.Coach_Rayon <= '" + Rayon + "' GROUP BY t.id ORDER BY t.id DESC";
      }
      // query_internal =
      //   "SELECT t.id,t.Tournamentname,t.from_date,t.to_date,t.address,t.Description,t.Postalcode,t.Eventdetails,t.Photo,t.filename,t.Price,t.Plan,t.Coach_Id,ci.Libelle_acheminement as Location FROM tournament t INNER join cities ci on ci.Code_commune_INSEE = t.Coach_Ville and ci.Code_postal = t.Postalcode INNER join users u on u.id=t.Coach_Id INNER join coaches_dbs coach on coach.Coach_Email=u.email where t.from_date >= '" +
      //   dateData +
      //   "' AND MONTH(t.to_date) >= '" +
      //   currentMonth +
      //   "' AND YEAR(t.to_date) >= '" +
      //   currentYear + "'" + where1

      query_internal = "SELECT  t.id,t.Tournamentname,coach.Coach_Rayon as crayon,t.from_date,t.address,t.to_date,t.Description,t.Postalcode,t.Mode_of_transport,t.Eventdetails,t.Photo,t.filename,t.Price,t.Plan,t.Coach_Id, ci.Libelle_acheminement as Location FROM tournament  t INNER join cities ci on ci.Code_commune_INSEE = t.Coach_Ville and  ci.Code_postal = t.Postalcode INNER join users u on u.id=t.Coach_Id   INNER join  coaches_dbs coach on coach.Coach_Email=u.email where  t.from_date >= " +
        dateData +
        " AND MONTH(t.to_date) >= " +
        currentMonth +
        " AND YEAR(t.to_date) >= " +
        currentYear + " " +
        where1 +
        "ORDER BY t.id DESC"


    } else if (course == "Animation") {

      var Rayon = parseInt(rayon, 10);
      if (ville !== "") {
        where1 += " AND a.Postalcode in("+service_codes+") GROUP BY a.id ";
        //where1 += " AND coach.Coach_Rayon <= '" + Rayon + "' GROUP BY a.id ORDER BY a.id DESC";
      }

      // query_internal =
      //   "SELECT a.id,a.animations_name as Eventname,a.Description,a.address,a.Postalcode,a.Eventdetails,a.Photo,a.filename,a.Plan,a.Coach_Id,ci.Libelle_acheminement as Location FROM animations a INNER join cities ci on ci.Code_commune_INSEE = a.Coach_Ville and ci.Code_postal = a.Postalcode INNER join users u on u.id=a.Coach_Id  INNER join  coaches_dbs coach on coach.Coach_Email=u.email" + where1;
      query_internal = "SELECT  a.id,a.animations_name as Eventname,coach.Coach_Rayon as crayon,a.address,a.Description,a.Postalcode,a.Eventdetails,a.Photo,a.filename,a.Plan,a.Coach_Id, ci.Libelle_acheminement as Location FROM animations  a INNER join cities ci on ci.Code_commune_INSEE = a.Coach_Ville and  ci.Code_postal = a.Postalcode INNER join users u on u.id=a.Coach_Id   INNER join  coaches_dbs coach on coach.Coach_Email=u.email  " +
        where1 +
        "ORDER BY a.id DESC"


    } else {
      var Rayon = parseInt(rayon, 10);
      if (ville !== "") {
        
        where1 += " AND tb.Postalcode in("+service_codes+") GROUP BY tb.id ";
        //where1 += " AND coach.Coach_Rayon <= '" + Rayon + "' GROUP BY tb.id ORDER BY tb.id DESC";
      }

      /*query_internal =
      "SELECT team_building.*,coaches_dbs.* from team_building JOIN coaches_dbs ON  team_building.Coach_Id = coaches_dbs.Coach_ID " + where1;*/

      //query_internal = "SELECT tb.id,tb.Eventname,tb.Description,tb.address,tb.Mode_of_transport,tb.Eventdetails,tb.Photo,tb.filename,tb.Plan,tb.Postalcode,tb.Coach_Id,ci.Libelle_acheminement as Location FROM team_building tb INNER join cities ci on ci.Code_commune_INSEE = tb.Coach_Ville and ci.Code_postal = tb.Postalcode INNER join users u on u.id=tb.Coach_Id  INNER join  coaches_dbs coach on coach.Coach_Email=u.email" + where1;


      query_internal = "SELECT  tb.id,tb.Eventname ,coach.Coach_Rayon as crayon,tb.address,tb.Mode_of_transport,tb.Description,tb.Postalcode,tb.Eventdetails,tb.Photo,tb.filename,tb.Plan,tb.Coach_Id, ci.Libelle_acheminement as Location FROM team_building  tb INNER join cities ci on ci.Code_commune_INSEE = tb.Coach_Ville and  ci.Code_postal = tb.Postalcode INNER join users u on u.id=tb.Coach_Id   INNER join  coaches_dbs coach on coach.Coach_Email=u.email  " +
        where1 +
        "ORDER BY tb.id DESC"

    }
    console.log(query_internal, "<=====query_internal")

    await db_library
      .execute(query_internal)
      .then(value => {
        if (value.length > 0) {
          if (course == "Stage") {
            var resultObj = [];
            let objects = {};
            for (let i = 0; i < value.length; i++) {
              const resultCurrentMonth =
                new Date(value[i].to_date).getMonth() + 1;
              const resultCurrentYear = new Date(value[i].to_date).getFullYear();
              if (
                resultCurrentMonth == currentMonth &&
                resultCurrentYear == currentYear
              ) {
                const currentDate = formatDateToString(new Date());
                const resultCurrentDate = formatDateToString(
                  new Date(value[i].to_date)
                );
                if (resultCurrentDate > currentDate) {
                  objects = {
                    id: value[i].id,
                    Eventname: value[i].Eventname,
                    from_date: value[i].from_date,
                    to_date: value[i].to_date,
                    Description: value[i].Description,
                    Location: value[i].Location,
                    Postalcode: value[i].Postalcode,
                    Mode_of_transport: value[i].Mode_of_transport,
                    Eventdetails: value[i].Eventdetails,
                    Photo: value[i].Photo,
                    filename: value[i].filename,
                    Price: value[i].Price,
                    Address: value[i].address,
                    Plan: value[i].Plan,
                    Coach_Id: value[i].Coach_Id,
                    isReserveButton: true
                  };
                } else {
                  objects = {
                    id: value[i].id,
                    Eventname: value[i].Eventname,
                    from_date: value[i].from_date,
                    to_date: value[i].to_date,
                    Description: value[i].Description,
                    Location: value[i].Location,
                    Postalcode: value[i].Postalcode,
                    Mode_of_transport: value[i].Mode_of_transport,
                    Eventdetails: value[i].Eventdetails,
                    Photo: '',
                    filename: value[i].filename,
                    Price: value[i].Price,
                    Address: value[i].address,
                    Plan: value[i].Plan,
                    Coach_Id: value[i].Coach_Id,
                    isReserveButton: false
                  };
                }
              } else {
                objects = {
                  id: value[i].id,
                  Eventname: value[i].Eventname,
                  from_date: value[i].from_date,
                  to_date: value[i].to_date,
                  Description: value[i].Description,
                  Location: value[i].Location,
                  Postalcode: value[i].Postalcode,
                  Mode_of_transport: value[i].Mode_of_transport,
                  Eventdetails: value[i].Eventdetails,
                  Photo: '',
                  filename: value[i].filename,
                  Price: value[i].Price,
                  Address: value[i].address,
                  Plan: value[i].Plan,
                  Coach_Id: value[i].Coach_Id,
                  isReserveButton: true
                };
              }
              resultObj.push(objects);
            }
            var obj = {
              event_list: resultObj
            };
          } else {
            var obj = {
              event_list: value
            };
          }
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Événement réussi";
        } else {
          var obj = {
            event_list: []
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Aucun événement trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "L'événement a échoué";
      });


  }


  res.send(_output);
}



function formatDateToString(date) {
  var dd = (date.getDate() < 10 ? "0" : "") + date.getDate();

  var MM = (date.getMonth() + 1 < 10 ? "0" : "") + (date.getMonth() + 1);

  var YY = date.getFullYear();

  return YY + "-" + MM + "-" + dd;
}
// New get coach list by postal code - mobile

exports.getCoachByPostalcode = async function (req, res, next) {
  var _output = new output();
  const code = req.query.code;
  async function checkCourseIndividual(id) {
    try {
      const Query =
        "SELECT 1 FROM `individualcourses` WHERE `Coach_Id`= '" + id + "'";
      return await db_library.execute(Query).then(async data => {
        return data.length > 0 ? true : false;
      });
    } catch (error) {
      return error;
    }
  }

  async function checkOndemand(id) {
    try {
      const Query =
        "SELECT 1 FROM `course_collective_if_demand` WHERE `Coach_Id`= '" +
        id +
        "'";
      return await db_library.execute(Query).then(async data => {
        return data.length > 0 ? true : false;
      });
    } catch (error) {
      return error;
    }
  }
  async function checkClub(id) {
    try {
      const Query =
        "SELECT 1 FROM `couse_collective_if_club` WHERE `Coach_Id`= '" +
        id +
        "'";
      return await db_library.execute(Query).then(async data => {
        return data.length > 0 ? true : false;
      });
    } catch (error) {
      return error;
    }
  }
  async function checkStage(id) {
    try {
      const Query =
        "SELECT 1 FROM `course_stage` WHERE `Coach_Id`= '" + id + "'";
      return await db_library.execute(Query).then(async data => {
        return data.length > 0 ? true : false;
      });
    } catch (error) {
      return error;
    }
  }
  async function checkAnimation(id) {
    try {
      const Query = "SELECT 1 FROM `animations` WHERE `Coach_Id`= '" + id + "'";
      return await db_library.execute(Query).then(async data => {
        return data.length > 0 ? true : false;
      });
    } catch (error) {
      return error;
    }
  }
  async function checkTeamBuilding(id) {
    try {
      const Query =
        "SELECT 1 FROM `team_building` WHERE `Coach_Id`= '" + id + "'";
      return await db_library.execute(Query).then(async data => {
        return data.length > 0 ? true : false;
      });
    } catch (error) {
      return error;
    }
  }
  async function checkTournament(id) {
    try {
      const Query = "SELECT 1 FROM `tournament` WHERE `Coach_Id`= '" + id + "'";
      return await db_library.execute(Query).then(async data => {
        return data.length > 0 ? true : false;
      });
    } catch (error) {
      return error;
    }
  }
  var query =
    "SELECT DISTINCT c.Coach_Fname, c.Coach_ID, c.Coach_Image,c.InstagramURL, c.TwitterURL,c.FacebookURL, c.Coach_Phone, c.Coach_Lname, c.Coach_Email, c.Coach_Price, c.Coach_PriceX10, c.Coach_Description, c.Coach_Services,c.ResumeName,c.Coach_Resume, u.Id FROM coaches_dbs c inner join users u on c.Coach_Email = u.email left join avaiablity a on u.id = a.CoachId WHERE u.roleId = 2 AND u.isActive = 1 AND u.postalCode = '" +
    code +
    "'";
  await db_library
    .execute(query)
    .then(async value => {
      if (value.length > 0) {
        var result = [];
        var indiv = false;
        var ondemand = false;
        var club = false;
        var stage = false;
        var animation = false;
        var teambuilding = false;
        var tournament = false;
        for (var i = 0; i < value.length; i++) {
          value[i].Coach_Services = value[i].Coach_Services.split(",");
          if (value[i].Coach_Services[0].length > 0) {
            if (value[i].Coach_Services.includes("CoursIndividuel")) {
              indiv = true;
            } else if (
              value[i].Coach_Services.includes("CoursCollectifOndemand")
            ) {
              ondemand = true;
            } else if (value[i].Coach_Services.includes("CoursCollectifClub")) {
              club = true;
            } else if (value[i].Coach_Services.includes("Stage")) {
              stage = true;
            } else if (value[i].Coach_Services.includes("Animation")) {
              animation = true;
            } else if (value[i].Coach_Services.includes("TeamBuilding")) {
              teambuilding = true;
            } else if (value[i].Coach_Services.includes("Tournament")) {
              tournament = true;
            }
            if (
              indiv === true ||
              ondemand === true ||
              club === true ||
              stage === true ||
              animation === true ||
              teambuilding === true ||
              tournament === true
            ) {
              const checkCheckIndividual = await checkCourseIndividual(
                value[i].Id
              );
              const checkCheckOndemand = await checkOndemand(value[i].Id);
              const checkCheckClub = await checkClub(value[i].Id);
              const checkCheckStage = await checkStage(value[i].Id);
              const checkCheckAnimation = await checkAnimation(value[i].Id);
              const checkCheckTeamBuilding = await checkTeamBuilding(
                value[i].Id
              );
              const checkCheckTournament = await checkTournament(value[i].Id);

              if (
                checkCheckIndividual === true ||
                checkCheckOndemand === true ||
                checkCheckClub === true ||
                checkCheckStage === true ||
                checkCheckAnimation === true ||
                checkCheckTeamBuilding === true ||
                checkCheckTournament === true
              ) {
                result.push(value[i]);
              }
            }
          }
        }
        var res = {
          coach_list: result
        };
        _output.data = res;
        _output.isSuccess = true;
        _output.message = "L'entraîneur réussit";
      } else {
        var obj = {
          coach_list: []
        };
        _output.data = obj;
        _output.isSuccess = true;
        _output.message = "Aucun entraîneur trouvé";
      }
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "L'entraîneur a échoué";
    });
  res.send(_output);
};

exports.getcoachdetailbyid = async function (req, res, next) {
  const { id } = req.body;
  var _output = new output();

  var query =
    "SELECT DISTINCT c.Coach_Fname, c.Coach_ID, c.InstagramURL, c.Coach_Image,c.Coach_transport, c.TwitterURL,c.FacebookURL, c.Coach_Phone, c.Coach_Lname, c.Coach_Email, c.Coach_Price, c.Coach_PriceX10, c.Coach_Description, c.Coach_Services, u.Id FROM coaches_dbs c inner join users u on c.Coach_Email = u.email left join avaiablity a on u.id = a.CoachId WHERE u.roleId = 2 AND u.isActive = 1 AND c.Coach_ID = '" +
    id +
    "'";

  if (id != "") {
    await db_library
      .execute(query)
      .then(value => {
        if (value.length > 0) {
          var obj = {
            coach_list: value
          };
          var result = obj;
          _output.data = result;
          _output.isSuccess = true;
          _output.message = "L'entraîneur réussit";
        } else {
          _output.data = {};
          _output.isSuccess = false;
          _output.message = "Aucun entraîneur trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "L'entraîneur a échoué";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "L'entraîneur a échoué";
  }
  res.send(_output);
};

exports.getstagebycoachid = async function (req, res, next) {
  var _output = new output();
  const id = req.params.coachId;

  var query =
    "SELECT c.Coach_ID, u.Id as userId, cs.* FROM coaches_dbs c inner join users u on c.Coach_Email = u.email inner join course_stage cs on u.id = cs.Coach_Id WHERE u.roleId = 2 AND u.isActive = 1 AND c.Coach_ID = '" +
    id +
    "' ORDER BY id DESC";

  if (id != "") {
    await db_library
      .execute(query)
      .then(value => {
        if (value.length > 0) {
          var count = value.length;
          var record = value.splice(0, 2);
          var obj = {
            stage_list: record,
            count
          };
          var result = obj;
          _output.data = result;
          _output.isSuccess = true;
          _output.message = "L'entraîneur réussit";
        } else {
          _output.data = {
            stage_list: [],
            count: 0
          };
          _output.isSuccess = true;
          _output.message = "Aucun entraîneur trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "L'entraîneur a échoué";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "L'entraîneur a échoué";
  }
  res.send(_output);
};

exports.getteambuildingbycoachid = async function (req, res, next) {
  var _output = new output();
  const id = req.params.coachId;

  var query =
    "SELECT c.Coach_ID, u.Id as userId, tb.* FROM coaches_dbs c inner join users u on c.Coach_Email = u.email inner join team_building tb on u.id = tb.Coach_Id WHERE u.roleId = 2 AND u.isActive = 1 AND c.Coach_ID = '" +
    id +
    "' ORDER BY id DESC";

  if (id != "") {
    await db_library
      .execute(query)
      .then(value => {
        if (value.length > 0) {
          var count = value.length;
          var record = value.splice(0, 2);
          var obj = {
            teambuilding_list: record,
            count
          };
          var result = obj;
          _output.data = result;
          _output.isSuccess = true;
          _output.message = "L'entraîneur réussit";
        } else {
          _output.data = {
            teambuilding_list: [],
            count: 0
          };
          _output.isSuccess = true;
          _output.message = "Aucun entraîneur trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "L'entraîneur a échoué";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "L'entraîneur a échoué";
  }
  res.send(_output);
};

exports.getanimationsbycoachid = async function (req, res, next) {
  var _output = new output();
  const id = req.params.coachId;

  var query =
    "SELECT c.Coach_ID, u.Id as userId, a.* FROM coaches_dbs c inner join users u on c.Coach_Email = u.email inner join animations a on u.id = a.Coach_Id WHERE u.roleId = 2 AND u.isActive = 1 AND c.Coach_ID = '" +
    id +
    "' ORDER BY id DESC";

  if (id != "") {
    await db_library
      .execute(query)
      .then(value => {
        if (value.length > 0) {
          var count = value.length;
          var record = value.splice(0, 2);
          var obj = {
            animations_list: record,
            count
          };
          var result = obj;
          _output.data = result;
          _output.isSuccess = true;
          _output.message = "L'entraîneur réussit";
        } else {
          _output.data = {
            animations_list: [],
            count: 0
          };
          _output.isSuccess = true;
          _output.message = "Aucun entraîneur trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "L'entraîneur a échoué";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "L'entraîneur a échoué";
  }
  res.send(_output);
};

exports.gettournamentbycoachid = async function (req, res, next) {
  var _output = new output();
  const id = req.params.coachId;

  var query =
    "SELECT c.Coach_ID, u.Id as userId, t.* FROM coaches_dbs c inner join users u on c.Coach_Email = u.email inner join tournament t on u.id = t.Coach_Id WHERE u.roleId = 2 AND u.isActive = 1 AND c.Coach_ID = '" +
    id +
    "' ORDER BY id DESC";
  if (id != "") {
    await db_library
      .execute(query)
      .then(value => {
        if (value.length > 0) {
          var count = value.length;
          var record = value.splice(0, 2);
          var obj = {
            tournament_list: record,
            count
          };
          var result = obj;
          _output.data = result;
          _output.isSuccess = true;
          _output.message = "L'entraîneur réussit";
        } else {
          _output.data = {
            tournament_list: [],
            count: 0
          };
          _output.isSuccess = true;
          _output.message = "Aucun entraîneur trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "L'entraîneur a échoué";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "L'entraîneur a échoué";
  }
  res.send(_output);
};

exports.getallcoaches = async function (req, res, next) {
  var _output = new output();
  var query =
    "SELECT `Coach_ID`, `Coach_Fname`, `Coach_Lname`, `Coach_Image`, `Coach_Description`, `InstagramURL`, `TwitterURL`, `FacebookURL` FROM `coaches_dbs` LIMIT 10";
  await db_library
    .execute(query)
    .then(value => {
      var obj = {
        coach_list: value
      };
      var result = obj;
      _output.data = result;
      _output.isSuccess = true;
      _output.message = "L'entraîneur réussit";
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "Les entraîneurs ont échoué";
    });
  res.send(_output);
};

exports.getcoachbyid = async function (req, res, next) {
  const coach_email = req.body.Coach_Email;
  const coach_id = req.body.CoachId;

  var _output = new output();

  if (coach_email != undefined) {
    await db_library
      .execute(
        "SELECT * FROM `coaches_dbs` WHERE Coach_Email='" + coach_email + "'"
      )
      .then(value => {
        if (value.length > 0) {
          var obj = {
            coach_list: value
          };
          var result = obj;
          _output.data = result;
          _output.isSuccess = true;
          _output.message = "L'entraîneur réussit";

        } else {
          _output.data = {};
          _output.isSuccess = true;
          _output.message = "Aucun entraîneur trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Les entraîneurs ont échoué";
      });
  }
  else if (coach_id != "") {

    await db_library
      .execute(
        "SELECT c.* FROM coaches_dbs c inner join users u on c.Coach_Email = u.email  WHERE u.id ='" + coach_id + "'"
      )
      .then(value => {
        if (value.length > 0) {
          var obj = {
            coach_list: value
          };
          var result = obj;
          _output.data = result;
          _output.isSuccess = true;
          _output.message = "L'entraîneur réussit";

        } else {
          _output.data = {};
          _output.isSuccess = true;
          _output.message = "Aucun entraîneur trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Les entraîneurs ont échoué";
      });
  }
  else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "L'entraîneur a échoué";
  }
  res.send(_output);
};

exports.get_coach_by_id = async function (req, res, next) {
  const coach_email = req.body.Coach_Email;
  var _output = new output();
  if (coach_email != "") {
    var query = "SELECT cd.*,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `coaches_dbs` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Coach_Ville AND ci.Code_commune_INSEE = cd.Coach_City WHERE cd.Coach_Email='" + coach_email + "'";
    await db_library
      .execute(
        query)
      .then(value => {
        if (value.length > 0) {
          var obj = {
            coach_list: value
          };
          var result = obj;
          _output.data = result;
          _output.isSuccess = true;
          _output.message = "L'entraîneur réussit";
          // }, 200);
        } else {
          _output.data = {};
          _output.isSuccess = true;
          _output.message = "Aucun entraîneur trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Les entraîneurs ont échoué";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "L'entraîneur a échoué";
  }
  res.send(_output);
};

function formatDate(date) {
  var monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth() + 1;
  var year = date.getFullYear();

  return year + "-" + monthIndex + "-" + day;
}

exports.getAvailability = async function (req, res, next) {
  var _output = new output();
  const Coach_id = req.query.Coach_ID;
  const Course = req.query.Course;
  const Start_Date = new Date(req.query.Start_Date);
  const End_Date = new Date(req.query.End_Date);

  if (Coach_id != "" && Course != "" && Start_Date != "" && End_Date != "") {
    var Qry =
      "SELECT * FROM `availability_dbs` where (`Start_Date` >= '" +
      Start_Date +
      "' and `Start_Date` <='" +
      End_Date +
      "') and `Course` = '" +
      Course +
      "' and Coach_Id = " +
      Coach_id +
      "";
    await db_library
      .execute(Qry)
      .then(async val => {
        var result = val;
        if (result.length > 0) {
          _output.data = result;
          _output.isSuccess = true;
          _output.message = "Soyez réussi";
        } else {
          _output.data = {};
          _output.isSuccess = true;
          _output.message = "Aucun enregistrement trouvé";
        }
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Échec";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec";
  }
  res.send(_output);
};

async function bookedFun(arr, remaingSlotStatus, totalAmt) {
  try {
    const { P_BookingCourseID, P_CoachId, P_UserId, P_Date, P_CourseId, P_Hour, P_Remarks } = arr;
    const Query =
      "Insert into `booking_dbs` (`bookingCourseID`,`Coach_ID`,`user_Id`,`payment_Id`,`status`,`bookingDate`,`bookingCourse`,`amount`,`BookingTime`,`Remarks`,`remaingSlotStatus`) values ('" + P_BookingCourseID + "','" +
      P_CoachId +
      "','" +
      P_UserId +
      "','0','R','" +
      P_Date +
      "','" +
      P_CourseId +
      "','" +
      totalAmt +
      "','" +
      P_Hour +
      "','" +
      P_Remarks +
      "','" +
      remaingSlotStatus +
      "')";
    return await db_library.execute(Query).then(async data => {
      if (data.insertId) {
        return data.insertId;
      }
    });
  } catch (error) {
    return error;
  }
}



async function availUpdateFun(bookArray) {
  try {
    const {
      P_CoachId,
      P_CourseId,
      P_Date,
      P_Hour,
      P_UserId,
      P_Amount
    } = bookArray;
    const Query =
      "UPDATE `avaiablity` SET `Status`= 'R' , `UserId` = '" +
      P_UserId +
      "', CourseId = '" +
      P_CourseId +
      "', Price = '" +
      P_Amount +
      "', TotalSeat = '1' WHERE `CoachId`= '" +
      P_CoachId +
      "' AND `Date`= '" +
      P_Date +
      "' AND `Hour`= '" +
      P_Hour +
      "'";
    return await db_library.execute(Query).then(async data => {
      return data;
    });
  } catch (error) {
    return error;
  }
}

exports.coachReservationFun = async function (req, res, next) {
  var _output = new output();

  const { bookArray } = req.body;
  var coach_details;
  if (bookArray.length > 0) {
    await db_library
      .execute("SELECT * FROM `users` where `id` = " + bookArray[0].P_CoachId)
      .then(async val => {
        if (val.length > 0) {
          coach_details = val;
        }
      });

    await db_library
      .execute("SELECT * FROM `users` where `id` = " + bookArray[0].P_UserId)
      .then(async value => {
        if (value.length > 0) {
          user_details = value;
        }
      });
    var P_TotalAmt = req.body.totalAmt;
    var P_RemaingTenStatus = req.body.remaingStatus;
    const lastInsertId = await bookedFun(
      bookArray[0],
      P_RemaingTenStatus,
      P_TotalAmt
    );
    var dateArr = [];
    for (var i = 0; i < bookArray.length; i++) {
      await bookedSlotFun(bookArray[i], lastInsertId);

      if (bookArray[i].P_CourseId === "CoursIndividuel") {
        await availUpdateFun(bookArray[i]);
      }
      dateArr.push(bookArray[i].P_Date);
    }

    var dateString = dateArr.join();
    // if (_output.message == "Booking Successfully Inserted") {
    var mailTemplate = await mail_template.getMailTemplate(
      appConfig.MailTemplate.CoachAcceoptance
    );
    const mailOption = require("../../_mailer/mailOptions");
    let _mailOption = new mailOption();
    _mailOption.to = coach_details[0].email;
    _mailOption.subject = lang.booking_request;
    _mailOption.html = mailTemplate[0].template
      .replace(
        "{{username}}",
        coach_details[0].firstName + " " + coach_details[0].lastName
      )
      .replace(
        "{{user}}",
        user_details[0].firstName + " " + user_details[0].lastName
      )
      .replace("{{date}}", dateString)
      .replace("{{course}}", bookArray[0].P_CourseId);
    var _mailer = require("../../_mailer/mailer");
    _mailer.sendMail(_mailOption);

    _output.data = {};
    _output.isSuccess = true;
    _output.message = "Réservation réussie";
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "La réservation a échoué";
  }
  res.send(_output);
};


async function bookedSlotFun(bookArray, bookingID) {
  try {
    const {
      P_CoachId,
      P_CourseId,
      P_Date,
      P_Hour,
      P_UserId,
      P_Amount,
      P_Remarks
    } = bookArray;
    const Query =
      "Insert into `booking_slot_dbs` (`coach_id`, `user_id`, `booking_id`, `status`, `booking_date`, `booking_course`, `amount`, `booking_time`, `remarks`) values ('" +
      P_CoachId +
      "','" +
      P_UserId +
      "','" +
      bookingID +
      "','R','" +
      P_Date +
      "','" +
      P_CourseId +
      "','" +
      P_Amount +
      "','" +
      P_Hour +
      "','" +
      P_Remarks +
      "')";
    return await db_library.execute(Query).then(async data => {
      return data;
    });
  } catch (error) {
    return error;
  }
}

exports.coachReservation = async function (req, res, next) {
  var _output = new output();

  const { bookArray } = req.body;
  var coach_details;
  if (bookArray.length > 0) {
    await db_library
      .execute("SELECT * FROM `users` where `id` = " + bookArray[0].P_CoachId)
      .then(async val => {
        if (val.length > 0) {
          coach_details = val;
        }
      });

    await db_library
      .execute("SELECT * FROM `users` where `id` = " + bookArray[0].P_UserId)
      .then(async value => {
        if (value.length > 0) {
          user_details = value;
        }
      });
    var P_TotalAmt = req.body.totalAmt;
    var P_RemaingTenStatus = req.body.remaingStatus;
    for (var i = 0; i < bookArray.length; i++) {
      const {
        P_CoachId,
        P_CourseId,
        P_Date,
        P_Hour,
        P_UserId,
        P_Amount,
        P_Remarks
      } = bookArray[i];

      var hour = P_Hour.replace(" ", "").replace("- ", "-");
      var amt = P_Amount;
      if (P_Amount == "") {
        amt = 0;
      }
      var query =
        "call proc_ins_booking_dbs(" +
        P_CoachId +
        ",'" +
        P_CourseId +
        "','" +
        P_Date +
        "','" +
        P_Hour +
        "'," +
        P_UserId +
        "," +
        amt +
        ",'" +
        P_Remarks +
        "','" +
        P_TotalAmt +
        "','" +
        P_RemaingTenStatus +
        "')";
      await db_library
        .execute(query)
        .then(async val => {
          if (val) {
            _output.data = {};
            _output.isSuccess = true;
            _output.message = "Réservation réussie";
          } else {
            _output.data = {};
            _output.isSuccess = false;
            _output.message = "La réservation a échoué";
          }
        })
        .catch(err => {
          _output.data = {};
          _output.isSuccess = false;
          _output.message = "La réservation a échoué";
        });
    }
    if (_output.message == "Réservation réussie") {
      var mailTemplate = await mail_template.getMailTemplate(
        appConfig.MailTemplate.CoachAcceoptance
      );
      const mailOption = require("../../_mailer/mailOptions");
      let _mailOption = new mailOption();
      _mailOption.to = coach_details[0].email;
      _mailOption.subject = lang.booking_request;
      _mailOption.html = mailTemplate[0].template
        .replace(
          "{{username}}",
          coach_details[0].firstName + " " + coach_details[0].lastName
        )
        .replace(
          "{{user}}",
          user_details[0].firstName + " " + user_details[0].lastName
        )
        .replace("{{date}}", bookArray[0].P_Date)
        .replace("{{course}}", bookArray[0].P_CourseId);
      var _mailer = require("../../_mailer/mailer");
      _mailer.sendMail(_mailOption);
    }
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "La réservation a échoué";
  }
  res.send(_output);
};



exports.getUserReservationDetails = async function (req, res, next) {
  var _output = new output();
  const bookingId = req.query.booking_Id;
  //const id = req.query.id;

  if (bookingId != "") {
    var query = "select *,DATE_FORMAT(Date,'%d-%m-%Y') as reservedDate from reserved_course where booking_Id = " + bookingId + "";
    await db_library
      .execute(query).then(async (value) => {
        var result = value;
        if (value.length > 0) {
          //result[0].from_date = formatDate(new Date(result[0].from_date))
          var obj = {
            reserve: result
          }
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Stage réussi";
        } else {
          var obj = {
            reserve: []
          }
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Stage pas trouvé";
        }
      }).catch((err) => {
        _output.data = "";
        _output.isSuccess = false;
        _output.message = "Le stage est échoué";
      })
  } else {
    _output.data = "Le champ obligatoire est manquant";
    _output.isSuccess = false;
    _output.message = "Le stage est échoué";
  }
  res.send(_output);
}

exports.getReservationDetails = async function (req, res, next) {
  var _output = new output();
  const Coach_id = req.query.Coach_ID;

  if (Coach_id != "") {
    var query = "select users.firstName,users.lastName,users.postalCode,booking_dbs.*,DATE_FORMAT(booking_dbs.bookingDate,'%d-%m-%Y') as bookdatefillter,cities.Nom_commune from booking_dbs  JOIN users ON  booking_dbs.user_id = users.id JOIN cities ON  users.cityId = cities.Code_commune_INSEE where booking_dbs.Coach_ID = " + Coach_id + " GROUP BY `booking_dbs`.`booking_Id` ORDER BY created_at DESC";
    console.log(query)
    await db_library
      .execute(query).then(async (value) => {
        var result = value;
        if (value.length > 0) {
          var obj = {
            reserve: result
          }
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Stage réussi";
        } else {
          var obj = {
            reserve: []
          }
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Stage pas trouvé";
        }
      }).catch((err) => {
        _output.data = "";
        _output.isSuccess = false;
        _output.message = "Le stage est échoué";
      })
  } else {
    _output.data = "Le champ obligatoire est manquant";
    _output.isSuccess = false;
    _output.message = "Le stage est échoué";
  }
  res.send(_output);
}

exports.getReservations = async function (req, res, next) {
  var _output = new output();
  const Coach_id = req.query.Coach_ID;
  async function getBookingSlotTime(id) {
    try {
      const Query =
        "SELECT * FROM `booking_slot_dbs` WHERE `booking_id`= '" + id + "'";
      return await db_library.execute(Query).then(async data => {
        return data;
      });
    } catch (error) {
      return error;
    }
  }

  async function getcourse_details(data) {

    try {

      if (data.bookingCourseID != '' && data.bookingCourseID != 'undefined') {

        if (data.bookingCourse == 'CoursIndividuel') {

          var query = "SELECT cd.Postalcode,cd.Coach_Ville,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `individualcourses` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE= cd.Coach_Ville WHERE cd.id=" + data.bookingCourseID + "";

        } else if (data.bookingCourse == 'CoursCollectifOndemand') {

          var query = "SELECT cd.Postalcode,cd.Coach_Ville,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `course_collective_if_demand` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE= cd.Coach_Ville WHERE cd.Group_Id=" + data.bookingCourseID + "";

        } else if (data.bookingCourse == 'CoursCollectifClub') {

          var query = "SELECT cd.Postalcode,cd.Coach_Ville,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `couse_collective_if_club` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE= cd.Coach_Ville WHERE cd.Course_Id=" + data.bookingCourseID + "";

        } else if (data.bookingCourse == 'Stage') {

          var query = "SELECT cd.Postalcode,cd.Coach_Ville,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `course_stage` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE= cd.Coach_Ville WHERE cd.id=" + data.bookingCourseID + "";

        } else if (data.bookingCourse == 'Tournoi') {

          var query = "SELECT cd.Postalcode,cd.Coach_Ville,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `tournament` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE= cd.Coach_Ville WHERE cd.id=" + data.bookingCourseID + "";

        } else if (data.bookingCourse == 'TeamBuilding') {

          var query = "SELECT cd.Postalcode,cd.Coach_Ville,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `team_building` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE= cd.Coach_Ville WHERE cd.id=" + data.bookingCourseID + "";

        } else if (data.bookingCourse == 'Animation') {

          var query = "SELECT cd.Postalcode,cd.Coach_Ville,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `animations` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE= cd.Coach_Ville WHERE cd.id=" + data.bookingCourseID + "";

        }
        return await db_library.execute(query).then(async response => {
          return response;
        });

      } else {
        return [];
      }

    } catch (error) {
      return error;
    }

  }

  if (Coach_id != "") {
    var Qry =
      `select booking_Id,bookingCourseID,BookingTime,Coach_ID,amount,bookingCourse, d.CourseName,(select DATE_FORMAT(bookingDate, '%Y-%m-%d')) as bookingDate,discount_club,paymentStatus,payment_Id,status,user_Id, u.firstName, u.lastName,s.Remarks, s.remaingSlotStatus from booking_dbs s
        inner join course_dbs d on s.bookingCourse = d.Course_Shotname
        inner join users u on s.user_Id = u.id where Coach_Id = ` + Coach_id;
    await db_library
      .execute(Qry)
      .then(async val => {
        var result = val;
        if (result.length > 0) {
          for (let i = 0; i < result.length; i++) {
            const slot = await getBookingSlotTime(result[i].booking_Id);
            result[i].slot = slot;
            const getcourseDetails = await getcourse_details(result[i]);
            result[i].courseDetails = getcourseDetails;
          }
          var obj = {
            booking: result
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Soyez réussi";
        } else {
          var obj = {
            booking: []
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Aucun enregistrement trouvé";
        }
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Échec";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec";
  }
  res.send(_output);
};

exports.getReservation = async function (req, res, next) {
  var _output = new output();
  const Coach_id = req.query.Coach_ID;

  if (Coach_id != "") {
    var Qry =
      `select booking_Id,BookingTime,Coach_ID,amount,bookingCourse, d.CourseName,(select DATE_FORMAT(bookingDate, '%Y-%m-%d')) as bookingDate,discount_club,paymentStatus,payment_Id,status,user_Id, u.firstName, u.lastName,s.Remarks from booking_dbs s
        inner join course_dbs d on s.bookingCourse = d.Course_Shotname
        inner join users u on s.user_Id = u.id where Coach_Id = ` + Coach_id;
    await db_library
      .execute(Qry)
      .then(async val => {
        var result = val;
        if (result.length > 0) {
          var obj = {
            booking: result
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Soyez réussi";
        } else {
          var obj = {
            booking: []
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Aucun enregistrement trouvé";
        }
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Échec";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec";
  }
  res.send(_output);
};

exports.getBookingDetail = async function (req, res, next) {
  var _output = new output();
  const booking_Id = req.query.booking_Id;
  if (booking_Id != "") {
    var Qry =
      "SELECT b.*,u.email FROM `booking_dbs` b LEFT JOIN `users` u on b.`user_Id` = u.id where  booking_Id  = " +
      booking_Id +
      "";
    await db_library
      .execute(Qry)
      .then(async val => {
        var result = val;
        if (result.length > 0) {
          var obj = {
            availabilty: result
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Soyez réussi";
        } else {
          _output.data = {};
          _output.isSuccess = true;
          _output.message = "Aucun enregistrement trouvé";
        }
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Échec";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec";
  }
  res.send(_output);
};

async function getSlotDetailsByBookingId(booking_id) {
  try {
    const Query =
      "SELECT * FROM `booking_slot_dbs` where `booking_id` = " + booking_id;
    return await db_library.execute(Query).then(async data => {
      return data;
    });
  } catch (error) {
    return error;
  }
}

async function updateSlotDetailsByBookingId(
  Coach_id,
  user_Id,
  booking_date,
  course,
  booking_time,
  status
) {
  try {
    const Query =
      "UPDATE `avaiablity` SET `Status`= '" +
      status +
      "' WHERE `CoachId`= '" +
      Coach_id +
      "' AND `UserId`= '" +
      user_Id +
      "' AND `Date`= '" +
      booking_date +
      "' AND `Hour`= '" +
      booking_time +
      "' AND `CourseId`= '" +
      course +
      "'";
    return await db_library.execute(Query).then(async data => {
      return data;
    });
  } catch (error) {
    return error;
  }
}

async function setCancelStatusAvaiablity(
  Coach_id,
  user_Id,
  booking_date,
  course,
  booking_id,
  types
) {
  try {
    if (course == "CoursIndividuel") {
      const getSlotBookingId = await getSlotDetailsByBookingId(booking_id);
      for (let i = 0; i < getSlotBookingId.length; i++) {
        //const element = array[i];
        if (types == "Approve") {
          await updateSlotDetailsByBookingId(
            Coach_id,
            user_Id,
            formatDate(getSlotBookingId[i].booking_date),
            course,
            getSlotBookingId[i].booking_time,
            "A"
          );
        } else {
          await updateSlotDetailsByBookingId(
            Coach_id,
            user_Id,
            formatDate(getSlotBookingId[i].booking_date),
            course,
            getSlotBookingId[i].booking_time,
            "Y"
          );
        }
      }
    }
    return true;
  } catch (error) {
    return error;
  }
}

exports.setCoachTable = async function (req, res, next) {
  var _output = new output();
  var arr = [
    "animations",
    "avaiablity",
    "balance",
    "bookingcourse_slot",
    "booking_dbs",
    "booking_slot_dbs",
    "cities",
    "coaches_dbs",
    "courseclub_availablity",
    "courseclub_year",
    "course_collective_if_demand",
    "course_dbs",
    "couse_collective_if_club",
    "email_template",
    "individualcourses",
    "payment_stripe",
    "reserved_course",
    "service",
    "users",
    "slot",
    "tournament"
  ];
  for (let i = 0; i < arr.length; i++) {
    await db_library.execute("DROP TABLE IF EXISTS " + arr[i], function (
      err,
      rows
    ) { });
  }
  _output.data = {};
  _output.isSuccess = true;
  _output.message = "Le cours réussit";
  res.send(_output);
};

exports.setStatus = async function (req, res, next) {
  var _output = new output();
  const discount = req.body.discount;
  const Coach_id = req.body.Coach_ID;
  const user_Id = req.body.user_Id;
  const status = req.body.status;
  const booking_id = req.body.booking_id;
  const amount = req.body.amount;
  const booking_date = req.body.booking_date;
  const booking_time = req.body.booking_time;
  const course = req.body.course;

  if (
    Coach_id != "" &&
    status != "" &&
    booking_id != "" &&
    booking_date != "" &&
    course != ""
  ) {
    if (course == "CoursCollectifOndemand") {
      var update_qry =
        "UPDATE `booking_dbs` SET `status`= '" +
        status +
        "' ,`discount_club`= '" +
        discount +
        "',`amount`= '" +
        amount +
        "' WHERE `Coach_id`=" +
        Coach_id +
        " AND `bookingDate`='" +
        booking_date +
        "' AND `bookingCourse`='" +
        course +
        "'";

      var sel_qry =
        "SELECT b.booking_id as booking_id,s.firstName as UserFirstname,s.email as UserEmail, s.lastName as UserLastname, c.firstName coachfirstname, c.lastName as CoachLastname FROM `booking_dbs` b INNER JOIN users s on b.user_id = s.id INNER JOIN users c on b.Coach_ID = c.id where b.bookingCourse='" +
        course +
        "' AND b.bookingDate ='" +
        booking_date +
        "' AND b.Coach_ID = " +
        Coach_id;
    } else if (course == "CoursIndividuel") {

      var update_qry =
        "UPDATE `booking_dbs` SET `status`= '" +
        status +
        "' ,`amount`= '" +
        amount +
        "' WHERE `booking_Id`= '" +
        booking_id +
        "'";

      var sel_qry =
        "SELECT s.firstName as UserFirstname,s.email as UserEmail, s.lastName as UserLastname, c.firstName coachfirstname, c.lastName as CoachLastname FROM `booking_dbs` b INNER JOIN users s on b.user_id = s.id INNER JOIN users c on b.Coach_ID = c.id where b.booking_Id =" +
        booking_id +
        "";
    } else if (
      course == "Stage" ||
      course == "Tournoi" ||
      course == "TeamBuilding" ||
      course == "Animation"
    ) {
      var update_qry =
        "UPDATE `booking_dbs` SET `status`= '" +
        status +
        "' ,`amount`= '" +
        amount +
        "' WHERE booking_id =" +
        booking_id +
        "";
      var sel_qry =
        "SELECT s.firstName as UserFirstname,s.email as UserEmail, s.lastName as UserLastname, c.firstName coachfirstname, c.lastName as CoachLastname FROM `booking_dbs` b INNER JOIN users s on b.user_id = s.id INNER JOIN users c on b.Coach_ID = c.id where b.booking_Id =" +
        booking_id +
        "";
    } else {
      var update_qry =
        "UPDATE `booking_dbs` SET `status`= '" +
        status +
        "' ,`discount_club`= '" +
        discount +
        "',`amount`= '" +
        amount +
        "' WHERE `Coach_id`=" +
        Coach_id +
        " AND `bookingDate`='" +
        booking_date +
        "' AND `bookingCourse`='" +
        course +
        "'";

      var sel_qry =
        "SELECT s.firstName as UserFirstname,s.email as UserEmail, s.lastName as UserLastname, c.firstName coachfirstname, c.lastName as CoachLastname FROM `booking_dbs` b INNER JOIN users s on b.user_id = s.id INNER JOIN users c on b.Coach_ID = c.id where b.booking_Id =" +
        booking_id +
        "";
    }
    await db_library
      .execute(update_qry)
      .then(async value => {

        if (value.affectedRows > 0) {
          await db_library
            .execute(sel_qry)
            .then(async val => {
              if (val.length > 0) {
                for (var i = 0; i < val.length; i++) {
                  if (status != "C" && status != "S") {
                    await setCancelStatusAvaiablity(
                      Coach_id,
                      user_Id,
                      booking_date,
                      course,
                      booking_id,
                      "Approve"
                    );
                    var discountAmount = discount != "" ? discount : amount;
                    var mailTemplate = await mail_template.getMailTemplate(
                      appConfig.MailTemplate.BookingSuccess
                    );
                    const mailOption = require("../../_mailer/mailOptions");
                    let _mailOption = new mailOption();
                    _mailOption.to = val[i].UserEmail;
                    _mailOption.subject = lang.booking_approved;
                    _mailOption.html = mailTemplate[0].template
                      .replace(
                        "{{username}}",
                        val[i].UserFirstname + " " + val[i].UserLastname
                      )
                      .replace("{{bookingid}}", booking_id)
                      .replace("{{amount}}", discountAmount);
                    var _mailer = require("../../_mailer/mailer");
                    _mailer.sendMail(_mailOption);
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Mise à jour du statut réussie";
                  } else if (status == "S") {
                    var query =
                      "INSERT INTO `balance`(`User_Id`, `Coach_Id`, `Course`, `BalanceAmt`) VALUES (" +
                      user_Id +
                      "," +
                      Coach_id +
                      ",'" +
                      course +
                      "'," +
                      amount +
                      ")";
                    await db_library
                      .execute(query)
                      .then(async update => {
                        if (update.affectedRows > 0) {
                          var mailTemplate = await mail_template.getMailTemplate(
                            appConfig.MailTemplate.Reschedule
                          );
                          const mailOption = require("../../_mailer/mailOptions");
                          let _mailOption = new mailOption();
                          _mailOption.to = val[i].UserEmail;
                          _mailOption.subject = lang.booking_reshedule;
                          _mailOption.html = mailTemplate[0].template
                            .replace(
                              "{{username}}",
                              val[i].UserFirstname + " " + val[i].UserLastname
                            )
                            .replace("{{course}}", course)
                            .replace("{{book_date}}", booking_date)
                            .replace(
                              "{{coach}}",
                              val[i].coachfirstname + " " + val[i].CoachLastname
                            );
                          var _mailer = require("../../_mailer/mailer");
                          _mailer.sendMail(_mailOption);
                          _output.data = {};
                          _output.isSuccess = true;
                          _output.message = "Mise à jour du statut réussie";
                        }
                      })
                      .catch(err => {
                        _output.data = {};
                        _output.isSuccess = false;
                        _output.message = "Replanifier la réservation a échoué";
                      });
                  } else {
                    await setCancelStatusAvaiablity(
                      Coach_id,
                      user_Id,
                      booking_date,
                      course,
                      booking_id,
                      "Cancel"
                    );
                    var mailTemplate = await mail_template.getMailTemplate(
                      appConfig.MailTemplate.BookingCancel
                    );
                    const mailOption = require("../../_mailer/mailOptions");
                    let _mailOption = new mailOption();
                    _mailOption.to = val[i].UserEmail;
                    _mailOption.subject = lang.booking_cancelled;
                    _mailOption.html = mailTemplate[0].template
                      .replace(
                        "{{username}}",
                        val[i].UserFirstname + " " + val[i].UserLastname
                      )
                      .replace("{{course}}", course)
                      .replace("{{book_date}}", booking_date)
                      .replace(
                        "{{coach}}",
                        val[i].coachfirstname + " " + val[i].CoachLastname
                      );
                    var _mailer = require("../../_mailer/mailer");
                    _mailer.sendMail(_mailOption);
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Mise à jour du statut réussie";
                  }
                }
              }
            })
            .catch(err => {
              _output.data = {};
              _output.isSuccess = false;
              _output.message = "Mail Not Sent";
            });
        }
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Échec de la mise à jour du statut";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec de la mise à jour du statut";
  }

  res.send(_output);
};

exports.getTime_slot = async function (req, res, next) {
  const Coach_ID = req.query.Coach_ID;
  const Start_Date = req.query.Start_Date;
  const Course = req.query.Course;
  if (Coach_ID!==undefined && Coach_ID != "" && Start_Date != "" && Course != "") {
    var _output = new output();
    // var query =
    //   "call getAvaiabityBookedlesson('" +
    //   Start_Date +
    //   "','" +
    //   Course +
    //   "'," +
    //   Coach_ID +
    //   ")";
    var query = "SELECT id as SlotId, Hour as description, Status as Availability FROM  avaiablity WHERE Date='"+Start_Date+"' AND CoachId="+Coach_ID+"";
    // var query = "SELECT a.Id AS SlotId, a.Hour AS description, a.Status AS Availability FROM avaiablity a INNER JOIN booking_dbs b ON a.UserId = b.user_id WHERE a.CoachId = "+Coach_ID+" AND a.Date = '"+Start_Date+"' ORDER BY SlotId";

      // console.log('querysuresh',query);
    await db_library
      .execute(query)
      .then(value => {
        if (value.length > 0) {
          var result = value;
          var obj = {
            availabilty: result
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Intervalle de temps réussi";
        } else {
          var result = value;
          var obj = {
            availabilty: result
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Aucun créneau horaire trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Échec de la plage horaire";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec de la plage horaire";
  }
  res.send(_output);
};

exports.setpayment = async function (req, res, next) {
  var _output = new output();
  const status = req.body.status;
  const booking_id = req.body.booking_id;
  const amount = req.body.amount;
  const token = req.body.token;
  if (status != "" && booking_id != "") {
    var update_qry =
      "UPDATE `booking_dbs` SET `status`= '" +
      status +
      "' ,`amount`= '" +
      amount +
      "' ,`token`= '" +
      token +
      "' WHERE `booking_Id`= '" +
      booking_id +
      "'";
    await db_library
      .execute(update_qry)
      .then(async value => {
        if (value.affectedRows > 0) {
          const setStatusBookingSlotData = await setStatusBookingSlotDbs(
            booking_id,
            status
          );
          const getBookingSlotData = await getStatusBookingSlotData(booking_id);
          if (getBookingSlotData.length > 0) {
            for (let i = 0; i < getBookingSlotData.length; i++) {
              await setStatusAvaiablity(getBookingSlotData[i]);
            }
          }

          await db_library
            .execute(
              "SELECT u.*, b.* FROM `users` u INNER JOIN `booking_dbs` b on u.id = b.user_Id where b.`booking_id`=" +
              booking_id +
              ""
            )
            .then(async val => {
              if (val.length > 0) {
                var mailTemplate = await mail_template.getMailTemplate(
                  appConfig.MailTemplate.PaymentSuccess
                );
                const mailOption = require("../../_mailer/mailOptions");
                let _mailOption = new mailOption();
                _mailOption.to = val[0].email;
                _mailOption.subject = lang.payment_successful;
                _mailOption.html = mailTemplate[0].template
                  .replace(
                    "{{username}}",
                    val[0].firstName + " " + val[0].lastName
                  )
                  .replace("{{course}}", val[0].bookingCourse);
                var _mailer = require("../../_mailer/mailer");
                _mailer.sendMail(_mailOption);
                _output.data = {};
                _output.isSuccess = true;
                _output.message = lang.payment_successful;
              }
            })
            .catch(err => {
              _output.data = err;
              _output.isSuccess = false;
              _output.message = "Paiement échoué";
            });
        }
      })
      .catch(err => {
        _output.data = err;
        _output.isSuccess = false;
        _output.message = "Paiement échoué";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Paiement échoué";
  }
  res.send(_output);
};

exports.getdemandavailabilityByCoach = async function (req, res, next) {
  var _output = new output();
  const idss = req.query.Coach_ID;
  const date = req.query.Date;
  if (idss) {

    var query =
      "select s.*,bk.BookingTime from booking_dbs bk inner join users s on bk.user_Id = s.id" +
      " where  bk.bookingDate = '" +
      date +
      "' and bk.Coach_ID = '" +
      idss +
      "' and bk.bookingCourse = 'CoursCollectifOndemand'";

    await db_library
      .execute(query)
      .then(async value => {
        if (value.length > 0) {
          var obj = {
            availabilty: value
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "CourseCollectiveDemand Slot Obtenez avec succès";
        } else {
          var obj = {
            availabilty: []
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Aucun enregistrement trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Échec de l'emplacement CourseCollectiveDemand";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec de l'emplacement CourseCollectiveDemand";
  }
  res.send(_output);
};

exports.getDemandAvailability = async function (req, res, next) {
  var _output = new output();
  const idss = req.query.Coach_ID;
  const slot = req.query.slot;
  const date = req.query.date;
  if (idss != "" && slot != "" && date != "") {

    var query =
      "select s.* from booking_dbs bk inner join users s on bk.user_Id = s.id" +
      " where bk.bookingDate = '" +
      date +
      "' and bk.BookingTime = '" +
      slot +
      "' and bk.Coach_ID = '" +
      idss +
      "' and bk.bookingCourse = 'CoursCollectifOndemand'";

    await db_library
      .execute(query)
      .then(async value => {
        if (value.length > 0) {
          var obj = {
            availabilty: value
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "CourseCollectiveDemand Slot Obtenez avec succès";
        } else {
          var obj = {
            availabilty: []
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Aucun enregistrement trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Échec de l'emplacement CourseCollectiveDemand";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec de l'emplacement CourseCollectiveDemand";
  }
  res.send(_output);
};

exports.getslotAvailability = async function (req, res, next) {
  var _output = new output();
  const cochid = req.query.Coach_ID;
  const slot = req.query.slot;
  const people = req.query.people;

  if (cochid != "" && slot != "" && people != "") {
    await db_library
      .execute(
        "select * from booking_dbs bd inner join bookingcourse_slot bs on BookedId = booking_Id inner join users us on bd.user_Id = us.id where Coach_ID =" +
        cochid +
        " and Slot = '" +
        slot +
        "' and NoofPeople = " +
        people +
        ""
      )
      .then(async value => {
        if (value.length > 0) {
          var result = value;
          var obj = {
            availabilty: result
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message =
            "CourseCollectiveDemand Slot disponible avec succès";
        } else {
          _output.data = {};
          _output.isSuccess = true;
          _output.message = "Aucun enregistrement trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Échec de l'emplacement CourseCollectiveDemand";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec de l'emplacement CourseCollectiveDemand";
  }
  res.send(_output);
};

exports.setClubavailability = async function (req, res, next) {
  var _output = new output();

  const {
    Coach_id,
    Mon_mor,
    Mon_af,
    Mon_eve,
    Tue_mor,
    Tue_af,
    Tue_eve,
    Wed_mor,
    Wed_af,
    Wed_eve,
    Thu_mor,
    Thu_af,
    Thu_eve,
    Fri_mor,
    Fri_af,
    Fri_eve,
    Sat_mor,
    Sat_af,
    Sat_eve,
    Sun_mor,
    Sun_af,
    Sun_eve,
    year,
    Week_Number,
    Course,
    Coach_Flag
  } = req.body;

  if (
    Coach_id != "" &&
    Mon_mor != "" &&
    Mon_af != "" &&
    Mon_eve != "" &&
    Tue_mor != "" &&
    Tue_af != "" &&
    Tue_eve != "" &&
    Wed_mor != "" &&
    Wed_af != "" &&
    Wed_eve != "" &&
    Thu_mor != "" &&
    Thu_af != "" &&
    Thu_eve != "" &&
    Fri_mor != "" &&
    Fri_af != "" &&
    Fri_eve != "" &&
    Sat_mor != "" &&
    Sat_af != "" &&
    Sat_eve != "" &&
    Sun_mor != "" &&
    Sun_af != "" &&
    Sun_eve != "" &&
    Week_Number != "" &&
    Course != "" &&
    Coach_Flag != "" &&
    year != ""
  ) {
    var yr = year.split(" ");
    var end = new Date(yr[2], 5, 01);
    var date = new Date(end);
    date.setDate(date.getDate());
    date.setMonth(date.getMonth() + 1);
    date.setFullYear(date.getFullYear() - 1);
    var start = date;

    var query =
      "INSERT INTO `availability_dbs` (`Coach_Id`, `Course`, `Mon_mor`, `Mon_af`, `Mon_eve`, `Tue_mor`, `Tue_af`," +
      " `Tue_eve`, `Wed_mor`, `Wed_af`, `Wed_eve`, `Thu_mor`, `Thu_af`, `Thu_eve`, `Fri_mor`, `Fri_af`, `Fri_eve`, " +
      "`Sat_mor`, `Sat_af`, `Sat_eve`, `Sun_mor`, `Sun_af`, `Sun_eve`, `Week_Number`, `Start_Date`, `End_Date`, `Coach_Flag`," +
      " `createdAt`, `updatedAt`) VALUES ('" +
      Coach_id +
      "','" +
      Course +
      "', '" +
      Mon_mor +
      "', '" +
      Mon_af +
      "', '" +
      Mon_eve +
      "', '" +
      Tue_mor +
      "', '" +
      Tue_af +
      "'," +
      " '" +
      Tue_eve +
      "', '" +
      Wed_mor +
      "', '" +
      Wed_af +
      "', '" +
      Wed_eve +
      "', '" +
      Thu_mor +
      "', '" +
      Thu_af +
      "', '" +
      Thu_eve +
      "', '" +
      Fri_mor +
      "', " +
      "'" +
      Fri_af +
      "', '" +
      Fri_eve +
      "', '" +
      Sat_mor +
      "', '" +
      Sat_af +
      "', '" +
      Sat_eve +
      "', '" +
      Sun_mor +
      "', '" +
      Sun_af +
      "', '" +
      Sun_eve +
      "', '" +
      Week_Number +
      "'," +
      " '" +
      formatDate(start) +
      "', '" +
      formatDate(end) +
      "', '" +
      Coach_Flag +
      "', NOW(), NOW());";

    var upt_query =
      "UPDATE `availability_dbs` SET `Course` = '" +
      Course +
      "', `Mon_mor`='" +
      Mon_mor +
      "', `Mon_af`='" +
      Mon_af +
      "', `Mon_eve`='" +
      Mon_eve +
      "', `Tue_mor`= '" +
      Tue_mor +
      "', `Tue_af`='" +
      Tue_af +
      "'," +
      " `Tue_eve`= '" +
      Tue_eve +
      "', `Wed_mor` = '" +
      Wed_mor +
      "', `Wed_af`='" +
      Wed_af +
      "', `Wed_eve`='" +
      Wed_eve +
      "', `Thu_mor`='" +
      Thu_mor +
      "', `Thu_af`='" +
      Thu_af +
      "', `Thu_eve`='" +
      Thu_eve +
      "', `Fri_mor`='" +
      Fri_mor +
      "', `Fri_af` = '" +
      Fri_af +
      "', `Fri_eve` ='" +
      Fri_eve +
      "'," +
      "`Sat_mor`='" +
      Sat_mor +
      "', `Sat_af`='" +
      Sat_af +
      "', `Sat_eve`='" +
      Sat_eve +
      "', `Sun_mor`='" +
      Sun_mor +
      "', `Sun_af`='" +
      Sun_af +
      "', `Sun_eve`='" +
      Sun_eve +
      "', `Week_Number`='" +
      Week_Number +
      "', `Coach_Flag`='" +
      Coach_Flag +
      "'," +
      " `createdAt`=NOW(), `updatedAt`=NOW() WHERE Coach_Id=" +
      Coach_id +
      " and course = '" +
      Course +
      "' and Start_Date = '" +
      formatDate(start) +
      "'";

    await db_library
      .execute(
        "SELECT * FROM `availability_dbs` WHERE Coach_Id=" +
        Coach_id +
        " and course = '" +
        Course +
        "' and Start_Date = '" +
        formatDate(start) +
        "'"
      )
      .then(async value => {
        var result = value;
        if (result.length > 0) {
          await db_library
            .execute(upt_query)
            .then(async val => {
              var res = val;
              _output.data = {};
              _output.isSuccess = true;
              _output.message = "Disponibilité mise à jour avec succès";
            })
            .catch(err => {
              _output.data = {};
              _output.isSuccess = false;
              _output.message = "La mise à jour de disponibilité a échoué";
            });
        } else {
          await db_library
            .execute(query)
            .then(async val => {
              var res = val;
              _output.data = {};
              _output.isSuccess = true;
              _output.message = "Disponibilité insérée avec succès";
            })
            .catch(err => {
              _output.data = {};
              _output.isSuccess = false;
              _output.message = "Disponibilité insérée a échoué";
            });
        }
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Erreur dans la mise à jour de disponibilité";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Erreur dans la mise à jour de disponibilité";
  }
  res.send(_output);
};

exports.getClubTime_slot = async function (req, res, next) {
  const Coach_ID = req.query.Coach_ID;
  const Start_Date = req.query.Start_Date;
  const Course = req.query.Course;

  if (Coach_ID != "" && Start_Date != "" && Course != "") {
    var _output = new output();
    var query =
      "call GetDayByAvaiablityForClub('" +
      Start_Date +
      "','" +
      Course +
      "'," +
      Coach_ID +
      ")";

    await db_library
      .execute(query)
      .then(value => {
        if (value.length > 0) {
          var result = value;
          var obj = {
            availabilty: result
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Intervalle de temps réussi";
        } else {
          var obj = {
            availabilty: result
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Aucun créneau horaire trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Échec de la plage horaire";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec de la plage horaire";
  }
  res.send(_output);
};
exports.insertAvailability = async function (req, res, next) {
  var _output = new output();
  var availability = req.body.availability

  if (availability.length > 0) {
    var start = new Date(availability[0].Start_Date);
    var end = new Date(availability[0].End_Date);
    var date = new Date(availability[0].Date);

    var start_date = availability[0].Start_Date;
    var dateno = start_date.split('-')[2];
    //if (dateno < 10) {
    //   start.setDate(start.getDate());
    // end.setDate(end.getDate());
    //  date.setDate(date.getDate());
    // } else {
    //  start.setDate(start.getDate() + 1);
    // end.setDate(end.getDate() + 1);
    //  date.setDate(date.getDate() + 1);
    //}

    start.setDate(start.getDate());
    end.setDate(end.getDate());
   date.setDate(date.getDate());

    var query =
      "SELECT COUNT(1) as count FROM `avaiablity` where `Date` BETWEEN '" +
      moment(start, "DD-MM-YYYY").format("YYYY-MM-DD") +
      "' and '" +
      moment(end, "DD-MM-YYYY").format("YYYY-MM-DD") +
      "' and `CourseId`is NOT null and `CoachId`=" +
      availability[0].Coach_Id +
      "";
    // console.log('countquery',query);
    await db_library.execute(query).then(async data => {
      if (data[0].count == 0) {
        /**
         * Getting number of days between start and end date
         */
        var dateDifference =
          moment.duration(moment(end).diff(start)).asDays() + 1;
        /**
         * Saving data for each date from start to end
         */



        //  for (let i = 0; i < dateDifference; i++) {
        // for (var j = 0; j <= 6; j++) {
        /**
         * Finding days of the week in number for the current date
         */
        
        var daysInNumber = moment(date).day() - 1;
        daysInNumber = daysInNumber == -1 ? 6 : daysInNumber;

        //  if (parseInt(daysInNumber) == parseInt(j)) {
        availability.forEach(async (data) => {
          const dates = data.Date
          const dataArray = [{
            CoachId: data.Coach_Id,
            hour: "h8-h9",
            status: data.h8,
            date: dates,
            FromDate: data.Start_Date,
            ToDate: data.End_Date

          },
          {
            CoachId: data.Coach_Id,
            hour: "h9-h10",
            status: data.h9,
            date: dates,
            FromDate: data.Start_Date,
            ToDate: data.End_Date

          }
            ,
          {
            CoachId: data.Coach_Id,
            hour: "h10-h11",
            status: data.h10,
            date: dates,
            FromDate: data.Start_Date,
            ToDate: data.End_Date

          },
          {
            CoachId: data.Coach_Id,
            hour: "h11-h12",
            status: data.h11,
            date: dates,
            FromDate: data.Start_Date,
            ToDate: data.End_Date

          },
          {
            CoachId: data.Coach_Id,
            hour: "h12-h13",
            status: data.h12,
            date: dates,
            FromDate: data.Start_Date,
            ToDate: data.End_Date

          },
          {
            CoachId: data.Coach_Id,
            hour: "h13-h14",
            status: data.h13,
            date: dates,
            FromDate: data.Start_Date,
            ToDate: data.End_Date

          },
          {
            CoachId: data.Coach_Id,
            hour: "h14-h15",
            status: data.h14,
            date: dates,
            FromDate: data.Start_Date,
            ToDate: data.End_Date

          },
          {
            CoachId: data.Coach_Id,
            hour: "h15-h16",
            status: data.h15,
            date: dates,
            FromDate: data.Start_Date,
            ToDate: data.End_Date

          },
          {
            CoachId: data.Coach_Id,
            hour: "h16-h17",
            status: data.h16,
            date: dates,
            FromDate: data.Start_Date,
            ToDate: data.End_Date

          },
          {
            CoachId: data.Coach_Id,
            hour: "h17-h18",
            status: data.h17,
            date: dates,
            FromDate: data.Start_Date,
            ToDate: data.End_Date

          },
          {
            CoachId: data.Coach_Id,
            hour: "h18-h19",
            status: data.h18,
            date: dates,
            FromDate: data.Start_Date,
            ToDate: data.End_Date

          },
          {
            CoachId: data.Coach_Id,
            hour: "h19-h20",
            status: data.h19,
            date: dates,
            FromDate: data.Start_Date,
            ToDate: data.End_Date

          },
          {
            CoachId: data.Coach_Id,
            hour: "h20-h21",
            status: data.h20,
            date: dates,
            FromDate: data.Start_Date,
            ToDate: data.End_Date

          },
          {
            CoachId: data.Coach_Id,
            hour: "h21-h22",
            status: data.h21,
            date: dates,
            FromDate: data.Start_Date,
            ToDate: data.End_Date

          }
          ]


          dataArray.forEach(async (dataSend) => {
            //const values = [data.CoachId, data.hour,data.status,data.date];
            // console.log(dataSend)
            //Get Avaiablity count if already exists -  suresh
            var checkQuery = 'SELECT count(1) as count,Id as avaiablityId FROM avaiablity where CoachId='+dataSend.CoachId+' and Date="'+dataSend.date+'" and FromDate="'+dataSend.FromDate+'" and ToDate="'+dataSend.ToDate+'" and Hour="'+dataSend.hour+'"';
            // console.log('queryCh',checkQuery);
            await db_library
              .execute(checkQuery).then(async data => {
                // console.log('countData',data[0]);
                if (data[0].count> 0) {
                    var update_query = 'UPDATE `avaiablity`';
                      update_query+=' SET';
                      update_query+=' `Hour` = ?,';
                      update_query+=' `Status` = ?,';
                      update_query+=' `Date` = ?,';
                      update_query+=' `FromDate` = ?,';
                      update_query+=' `ToDate` = ?';
                      update_query+=' WHERE';
                      update_query+=' `CoachId` = ? AND `Id`=?';
                      // console.log('update_query',update_query);
                    await db_library
                    .parameterexecute(update_query, [dataSend.hour, dataSend.status, dataSend.date,dataSend.FromDate,dataSend.ToDate,dataSend.CoachId,data[0].avaiablityId]).then(async (value) => {
                      console.log(value)
                      _output.data = {  };
                      _output.isSuccess = true;
                      _output.message = "insert data ";
                    }).catch(err => {
                      console.log('err',err);
                      _output.data = { err };
                      _output.isSuccess = false;
                      _output.message = "La mise   jour du cours individuel a  chou ";
                    });
                }else{
                  //For Insert new
                    var insert_query = "INSERT INTO `avaiablity`(`CoachId`, `Hour`, `Status`, `Date`,`FromDate`,`ToDate`) VALUES (?,?,?,?,?,?);";
                    console.log(insert_query)
                    await db_library
                      .parameterexecute(insert_query, [dataSend.CoachId, dataSend.hour, dataSend.status, dataSend.date,dataSend.FromDate,dataSend.ToDate]).then(async (value) => {
                      console.log(value)
                        _output.data = {  };
                        _output.isSuccess = true;
                        _output.message = "insert data ";
                      }).catch(err => {
                        _output.data = { err };
                        _output.isSuccess = false;
                        _output.message = "La mise   jour du cours individuel a  chou ";
                      });
                }
              }).catch(err => {
                _output.data = { err };
                _output.isSuccess = false;
                _output.message = "La mise   jour du cours individuel a  chou ";
              })


           
          })
        })


        /**
         * Getting next date for saving
         */
        date = moment(date).add(1, "days");
        console.log(date)
        // }
        // }
        // }
      } else {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Emplacement actuellement non disponible";
      }
    }).catch(err => {
      _output.data = { err };
      _output.isSuccess = false;
      _output.message =
        "�chec de l'insertion de la disponibilit� du coach";
    });
  } else {
    _output.data = {};
    _output.isSuccess = false;
    _output.message = "Data Missing";
  }
  res.send({data:{},isSuccess:"true",message:"insert data Succesfully"});
 
};
function dbDateFormat(date) {
  // return formate_date;
  const formate_date = new Date(date);
  return moment(formate_date).format('YYYY-MM-DD');
}

exports.insertAvailabilitymobile = async function (req, res, next) {
  var _output = new output();
  const { availability } = req.body;
  if (availability.length > 0) {
    var start = new Date(availability[0].Start_Date);
    var end = new Date(availability[0].End_Date);
    console.log(start, end);
    var date = new Date(availability[0].Start_Date);
    var start_date = availability[0].Start_Date;
    var startArray = start_date.split('-')[2];
    var end_date = availability[0].End_Date;
    var endArray = end_date.split('-')[2];

    var dateno = start_date.split('-')[2];
    start.setDate(start.getDate() + 1);
    end.setDate(end.getDate() + 1);
    date.setDate(date.getDate() + 1);

    var query =
      "SELECT COUNT(1) as count FROM `avaiablity` where `Date` BETWEEN '" +
      dbDateFormat(start) +
      "' and '" +
      dbDateFormat(end) +
      "' and `CourseId`is NOT null and `CoachId`=" +
      availability[0].Coach_Id +
      "";
    console.log(query);
    await db_library.execute(query).then(async data => {

      if (data[0].count == 0) {
        /**
         * Getting number of days between start and end date
         */
        var dateDifference =
          moment.duration(moment(end).diff(start)).asDays() + 1;
        if (dateDifference > 30) {
          let originalText = "D�sol�, impossible de r�server plus de 30 jours"
          originalText.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
          _output.data = [];
          _output.isSuccess = false;
          _output.message = originalText;
          return false;
        }
        /**
         * Saving data for each date from start to end
         */
        for (let i = 0; i < dateDifference; i++) {


          const {
            h8,
            h9,
            h10,
            h11,
            h12,
            h13,
            h14,
            h15,
            h16,
            h17,
            h18,
            h19,
            h20,
            h21,
            Coach_Id
          } = availability[i];

          var query =
            "call ins_upd_avaiablity('" +
            h8 +
            "','" +
            h9 +
            "','" +
            h10 +
            "','" +
            h11 +
            "','" +
            h12 +
            "','" +
            h13 +
            "','" +
            h14 +
            "','" +
            h15 +
            "','" +
            h16 +
            "'," +
            "'" +
            h17 +
            "','" +
            h18 +
            "','" +
            h19 +
            "','" +
            h20 +
            "','" +
            h21 +
            "','" +
            Coach_Id +
            "','" +
            moment(date, "DD-MM-YYYY").format("YYYY-MM-DD") +
            "','" +
            moment(start, "DD-MM-YYYY").format("YYYY-MM-DD") +
            "','" +
            moment(end, "DD-MM-YYYY").format("YYYY-MM-DD") +
            "')";
          console.log(query);
          await db_library
            .execute(query)
            .then(async data => {
              _output.data = {};
              _output.isSuccess = true;
              _output.message = "Inséré avec succès";
            })
            .catch(err => {
              _output.data = err;
              _output.isSuccess = false;
              _output.message =
                "Échec de l'insertion de la disponibilité du coach";
            });
          //break;
          // }
          //}
          /**
           * Getting next date for saving
           */
          date = moment(date).add(1, "days");
        }
      } else {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Emplacement actuellement non disponible";
      }
    });
  } else {
    _output.data = {};
    _output.isSuccess = false;
    _output.message = "Data Missing";
  }
  res.send(_output);
};

exports.getDemandPrice = async function (req, res, next) {
  var _output = new output();
  const CoachId = req.query.CoachId;
  const TotalPeople = req.query.TotalPeople;
  const P_Date = req.query.P_Date;

  if (CoachId != "" && TotalPeople != "" && P_Date != "") {
    var query =
      "call get_demand_course_price(" +
      CoachId +
      "," +
      TotalPeople +
      ",'" +
      P_Date +
      "')";

    await db_library
      .execute(query)
      .then(async value => {
        if (value.length > 0) {
          var obj = {
            price: value
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "CourseCollectiveDemand Prix Obtenez avec succès";
        } else {
          var obj = {
            availabilty: []
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Aucun enregistrement trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Échec du cours CourseCollectiveDemand";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec du cours CourseCollectiveDemand";
  }
  res.send(_output);
};
exports.getDemandPriceformobile = async function (req, res, next) {
  var _output = new output();
  const CoachId = req.query.CoachId;
  const TotalPeople = req.query.TotalPeople;
  const P_Date = req.query.P_Date;

  if (CoachId != "" && TotalPeople != "" && P_Date != "") {
    var query =
      "call get_demand_course_price(" +
      CoachId +
      "," +
      TotalPeople +
      ",'" +
      P_Date +
      "')";

    await db_library
      .execute(query)
      .then(async value => {
        if (value.length > 0) {
          _output.data = value[0];
          _output.isSuccess = true;
          _output.message = "CourseCollectiveDemand Prix Obtenez avec succès";
        } else {
          var obj = {
            availabilty: []
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Aucun enregistrement trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Échec du cours CourseCollectiveDemand";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec du cours CourseCollectiveDemand";
  }
  res.send(_output);
};

exports.geolocationByPostalCode = async function (req, res, next) {
  var _output = new output();
  const postalCode = req.params.id;
  if (postalCode != "") {
    var query = "SELECT * FROM cities WHERE Code_postal=" + postalCode;
    await db_library
      .execute(query)
      .then(async value => {
        if (value.length > 0) {
          var obj = {
            coordonnees_gps: value[0].coordonnees_gps
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Coordonnées GPS trouvées";
        } // End of value.length > 0
        else {
          var obj = {
            coordonnees_gps: []
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Coordonnées GPS introuvables";
        } // End of value.length < 0
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Coordonnées GPS introuvables";
      });
  } else {
    _output.data = {};
    _output.isSuccess = false;
    _output.message = "Postal Code is not present";
  }
  res.send(_output);
};

exports.getparticularcoursedetails = async function (req, res, next) {
  var _output = new output();
  const courseId = req.body.courseId;
  const coursName = req.body.coursName;
  if (courseId != "") {

    if (coursName == 'CoursIndividuel') {
      var query = "select a.Postalcode,a.Coach_Ville,a.address,ci.Libelle_acheminement as cityname from individualcourses a INNER JOIN `cities` ci on ci.Code_postal = a.Postalcode AND ci.Code_commune_INSEE= a.Coach_Ville where a.id =" + courseId;
    }
    else if (coursName == 'CoursCollectifOndemand') {
      var query = "select a.Postalcode,a.Coach_Ville,a.address,ci.Libelle_acheminement as cityname from course_collective_if_demand a INNER JOIN `cities` ci on ci.Code_postal = a.Postalcode AND ci.Code_commune_INSEE= a.Coach_Ville where a.Group_Id =" + courseId;
    }
    else if (coursName == 'CoursCollectifClub') {
      var query = "select a.Postalcode,a.Coach_Ville,a.address,ci.Libelle_acheminement as cityname from couse_collective_if_club a INNER JOIN `cities` ci on ci.Code_postal = a.Postalcode AND ci.Code_commune_INSEE= a.Coach_Ville where  a.Course_Id=" + courseId;
    }
    else if (coursName == 'Tournoi') {
      var query = "select DATE_FORMAT(a.from_date,'%d-%m-%Y') as from_date, DATE_FORMAT(a.to_date,'%d-%m-%Y') as to_date,a.Postalcode,a.Coach_Ville,a.address,ci.Libelle_acheminement as cityname from tournament a INNER JOIN `cities` ci on ci.Code_postal = a.Postalcode AND ci.Code_commune_INSEE= a.Coach_Ville where a.id=" + courseId;
    }
    else if (coursName == 'Stage') {
      var query = "SELECT DATE_FORMAT(a.from_date,'%d-%m-%Y') as from_date, DATE_FORMAT(a.to_date,'%d-%m-%Y') as to_date,a.Postalcode,a.Coach_Ville,a.address,ci.Libelle_acheminement as cityname from course_stage a INNER JOIN `cities` ci on ci.Code_postal = a.Postalcode AND ci.Code_commune_INSEE= a.Coach_Ville where a.id=" + courseId;
    }
    else if (coursName == 'TeamBuilding') {
      var query = "select a.Postalcode,a.Coach_Ville,a.address,ci.Libelle_acheminement as cityname from team_building a INNER JOIN `cities` ci on ci.Code_postal = a.Postalcode AND ci.Code_commune_INSEE= a.Coach_Ville where a.id=" + courseId;
    }
    else {
      var query = "select a.Postalcode,a.Coach_Ville,a.address,ci.Libelle_acheminement as cityname from animations a INNER JOIN `cities` ci on ci.Code_postal = a.Postalcode AND ci.Code_commune_INSEE= a.Coach_Ville  where a.id=" + courseId;
    }
    await db_library
      .execute(query)
      .then(async value => {
        var result = value;
        if (value.length > 0) {
          var obj = {
            course: result
          }
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "success";

        } else {
          var obj = {
            course: []
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "invaild data";
        } // End of value.length < 0
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = err.message;
      });
  } else {
    _output.data = {};
    _output.isSuccess = false;
    _output.message = "Course Id is not present";
  }
  res.send(_output);
};