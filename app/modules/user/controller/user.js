const output = require("../../_models/output");
const db_library = require("../../_helpers/db_library");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const appConfig = require("../../../../config/appConfig");
const mail_template = require("../../MailTemplate/mailTemplate");
const moment = require("moment");
const lang = require("../../../lang/language").franchContent;
const calculateLocation = require("../../_helpers/calculateRadiusDistance");

exports.welcome = async function (req, res, next) {
  var _output = new output();
  _output.data = "API Running at 4004 Port";
  _output.isSuccess = true;
  _output.message = "Welcome to OhMyTennis API";
  res.send(_output);
};

exports.index = async function (req, res, next) {
  var _output = new output();
  await db_library
    .execute("SELECT * FROM `users`")
    .then(value => {
      var result = value[0];
      _output.data = result;
      _output.isSuccess = true;
      _output.message = "User Get Successfully";
    })
    .catch(err => {
      _output.data = {};
      _output.isSuccess = false;
      _output.message = "User Get Failed";
    });

  res.send(_output);
};


exports.getallBookings = async function (req, res, next) {
  var _output = new output();

  const userId = req.query.user_Id;
  const coachId = req.query.Coach_ID;

  //console.log('userId ' + userId);
  var where = "";
  if (userId) {
    //console.log('userId ' + userId);
    where = " booking_dbs.user_Id = '" + userId + "'";
    where += " AND booking_dbs.markreadUser = '0'";
    //where += " OR booking_dbs.status = 'A'";
    //where += " OR booking_dbs.status = 'C'";
    var select_query = "SELECT * FROM `booking_dbs` where" + where;
    console.log('query '+ select_query);
    await db_library
      .execute(select_query)
      .then(value => {
        var result = value;
        _output.data = result;
        _output.isSuccess = true;
        _output.message = "Booking Get Successfully";
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Booking Get Failed";
      });
  }

  else if (coachId) {
    //var where1 = "";
    where1 = " booking_dbs.Coach_ID ='" + coachId + "'";
    where1 += " AND booking_dbs.status = 'R' ";
    where1 += " AND booking_dbs.markreadCoach = 0 ";

    var select_query = "SELECT * FROM `booking_dbs` where" + where1;
    console.log('query '+ select_query);
    await db_library
      .execute(select_query)
      .then(value => {
        var result = value;
        _output.data = result;
        _output.isSuccess = true;
        _output.message = "Coach details Get Successfully";
      })
      .catch(err => {
        _output.data = {err};
        _output.isSuccess = false;
        _output.message = "Coach details Get Failed";
      });

  }

  res.send(_output);
};



exports.updateAllBookings = async function (req, res, next) {
  var _output = new output();

  const {
    markread,
    markreadCoach,
    user_Id,
    Coach_ID

  } = req.body;
  //console.log('data ' + JSON.stringify(req.body));

  if (user_Id && markread) {
    //console.log('first');
    var coach_query =
      "UPDATE `booking_dbs` SET `markreadUser`=? WHERE `user_Id`=?;";

    await db_library
      .parameterexecute(coach_query, [
        markread,
        user_Id

      ])
      .then(value => {
        //console.log("value", value);
        _output.data = {};
        _output.isSuccess = true;
        _output.message = "Mise à jour du profil réussie";
      })
      .catch(err => {
        //console.log("err", err.message);
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Échec de la mise à jour du profil";
      });
  }
  else if (Coach_ID && markreadCoach) {
    //console.log('second');
    var coach_update_query =
      "UPDATE `booking_dbs` SET `markreadCoach`=? WHERE `Coach_ID`=?;";
    await db_library
      .parameterexecute(coach_update_query, [
        markreadCoach,
        Coach_ID

      ])
      .then(value => {
        //console.log("value", value);
        _output.data = {};
        _output.isSuccess = true;
        _output.message = "Mise à jour du profil réussie";
      })
      .catch(err => {
        //console.log("err", err.message);
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Échec de la mise à jour du profil";
      });
  }
  res.send(_output);
};


exports.updateAllBookings1 = async function (req, res, next) {
  var _output = new output();

  // const {
  //   userId

  // } = req.body;

  //var user_id = JSON.parse(userId);
  //console.log('user id' + user_id);
  const userId = req.user_Id;
  //console.log('user id' + userId);
  //console.log('userid '+ JSON.parse(req.body));
  //const markread = req.query.markread;

  //console.log('ttt' + JSON.stringify(req.body.userId));

  if (userId != "") {

    await db_library
      .execute("UPDATE `booking_dbs` SET `markread` = '1' WHERE `user_Id`='" + userId + "'")
      .then(value => {
        var result = value;
        _output.data = result;
        _output.isSuccess = true;
        _output.message = "Booking Get Successfully";
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Booking Get Failed";
      });


  } else {
    console.log("err");
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec de la mise à jour du profil";
  }
  res.send(_output);
};


exports.getallReviews = async function (req, res, next) {
  var _output = new output();

  const coachId = req.query.Coach_Id;
  var course = req.query.course;
  //var userid = req.query.User_Id;
  //console.log('coachid '+ coachId);
  //console.log('course '+ course);
  var where = "";
  if (coachId) {
    const query = "SELECT cr.id as commentsId,cr.course,cr.rating,cr.comments,cr.created_at,users.id, users.firstName, users.lastName FROM `customer_reviews` as cr JOIN users ON  cr.User_Id = users.id WHERE cr.Coach_Id='" + coachId + "' ORDER BY cr.id DESC"
console.log("query=====",query)
    await db_library
      .execute(query)
      .then(value => {
        var result = value;
        _output.data = result;
        _output.isSuccess = true;
        _output.message = "Review Get Successfully";
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Review Get Failed";
      });
  }
  else {
    where += " AND customer_reviews.course LIKE '%" + course + "%' ORDER BY customer_reviews.id DESC";
    await db_library
      .execute("SELECT * FROM `customer_reviews` JOIN users ON  customer_reviews.User_Id = users.id " + where)
      .then(value => {
        var result = value;
        _output.data = result;
        _output.isSuccess = true;
        _output.message = "Review Get Successfully";
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Review Get Failed";
      });
  }

  res.send(_output);
};

exports.getallReviewsByUser = async function (req, res, next) {
  var _output = new output();

  const user_id = req.query.User_Id;
  if (user_id) {
    await db_library
      .execute("SELECT cr.id as commentsId,cr.course,cr.rating,cr.comments,cr.created_at,users.id, users.firstName, users.lastName,users.User_Image,coaches_dbs.Coach_Image FROM `customer_reviews` as cr JOIN users ON  cr.Coach_Id = users.id JOIN coaches_dbs ON coaches_dbs.Coach_Email = users.email WHERE cr.User_Id='" + user_id + "' ORDER BY cr.id DESC")
      .then(value => {
        var result = value;
        _output.data = result;
        _output.isSuccess = true;
        _output.message = "Review Get Successfully";
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Review Get Failed";
      });
  }
  else {
    _output.data = {};
    _output.isSuccess = false;
    _output.message = "No datat found";
  }

  res.send(_output);
};
exports.getallCoachReviews = async function (req, res, next) {
  var _output = new output();

  const coachId = req.query.Coach_Id;
  var course = req.query.course;
  var where = "";
  if (coachId) {
    //SELECT * FROM `customer_reviews` WHERE customer_reviews.Coach_Id='" + coachId + "' ORDER BY customer_reviews.id DESC
    await db_library
      .execute("SELECT cr.id as commentsId,cr.course,cr.rating,cr.comments,cr.created_at,users.id, users.firstName, users.lastName,users.User_Image FROM `customer_reviews` as cr JOIN users ON  cr.User_Id = users.id WHERE cr.Coach_Id='" + coachId + "' ORDER BY cr.id DESC")
      .then(value => {
        var result = value;
        _output.data = result;
        _output.isSuccess = true;
        _output.message = "Review Get Successfully";
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Review Get Failed";
      });
  }

  res.send(_output);
};

exports.createReviews = async function (req, res, next) {
  var _output = new output();
  const {

    Coach_Id,
    User_Id,
    course,
    comments,
    rating

  } = req.body;
  query1 = "SELECT * FROM payment_stripe where couch_id = '" + Coach_Id + "' and stripe_customer_id = '" + User_Id + "'"
  const payment = await db_library.execute(query1)
  console.log("payment====>", payment)

  if (payment.length) {

    if (comments) {
      var insert_query = "INSERT INTO `customer_reviews` (`Coach_Id`, `User_Id`, `course`, `comments`,`rating`) VALUES " +
        "(?,?,?,?,?);";

      await db_library
        .parameterexecute(insert_query, [Coach_Id, User_Id, course, comments, rating]).then((value) => {
          var result = value;
          _output.data = {};
          _output.isSuccess = true;
          _output.message = "Comments added successfully";
        }).catch(err => {
          _output.data = {};
          _output.isSuccess = false;
          _output.message = "Comments added Failed";
        });

    } else {
      _output.data = "Le champ obligatoire est manquant";
      _output.isSuccess = false;
      _output.message = "Comments added Failed";
    }
  } else {
    _output.data = {};
    _output.isSuccess = false;
    _output.message = "user must attend atleast one course ";

  }
  res.send(_output);
  //console.log(output)
}



exports.checkSocialUser = async function (req, res, next) {
  var _output = new output();

  const {
    email,
    provider


  } = req.body;

  //console.log('reqbody ' + JSON.stringify(req.body));
  if (

    email != "" &&
    provider != ""

  ) {

    await db_library
      .execute("SELECT * FROM `users` WHERE email='" + email + "' AND provider='" + provider + "'")
      .then(async value => {
        _output.data = value;
        _output.isSuccess = true;
        _output.message = "S'inscrire avec succès";

      })
      .catch(err => {

        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "L'enregistrement a échoué";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "L'enregistrement a échoué";
  }

  res.send(_output);
};

exports.socialUser = async function (req, res, next) {
  var _output = new output();
  const {
    firstName,
    lastName,
    email,
    // gender,
    // mobile,
    postalCode,
    cityId,
    password,
    roleId,
    provider
  } = req.body;
  if (
    firstName != "" &&
    lastName != "" &&
    email != "" &&
    // gender != "" &&
    // mobile != "" &&
    postalCode != "" &&
    cityId != "" &&
    password != "" &&
    roleId != ""
  ) {
    var encry_pass = await bcrypt.hash(password, 10);

    var query =
      "INSERT INTO `users`(`firstName`, `lastName`, `email`,`password`, `postalCode`, `cityId`, `roleId`, `isActive`, `provider`)" +
      " VALUES (?,?,?,?,?,?,?,?,?);";
    var coach_query =
      "INSERT INTO `coaches_dbs`(`Coach_Fname`, `Coach_Lname`, `Coach_Email`,  `Coach_Password`, `User_type`, `Coach_Ville`, `Coach_City`, `provider`)" +
      " VALUES (?,?,?,?,?,?,?,?);";
    where = " email = '" + email + "'";
    // where += " AND provider = '" + provider + "'";
    await db_library
      .execute("SELECT * FROM `users` WHERE" + where)
      .then(async value => {

        var result = value;
        if (result.length == 0) {
          console.log(firstName, lastName, email, encry_pass, postalCode, cityId, roleId, provider);

          try {
            await db_library
              .parameterexecute(query, [
                firstName,
                lastName,
                email,
                encry_pass,
                postalCode,
                cityId,
                roleId,
                1,
                provider
              ])
              .then(async val => {
                console.log(val);
                await db_library
                  .execute("SELECT * FROM `users` WHERE" + where)
                  .then(async value => {
                    var result = value;
                    _output.data = result[0];
                    _output.isSuccess = true;
                    _output.message = "S'inscrire avec succ s";
                  }).catch(err => {
                    _output.data = err;
                    _output.isSuccess = false;
                    _output.message = "L'enregistrement a  chou ";
                  });
              })
              .catch(err => {
                _output.data = err;
                _output.isSuccess = false;
                _output.message = "L'enregistrement a  chou ";
              });
            if (roleId == 2) {
              await db_library
                .parameterexecute(coach_query, [
                  firstName,
                  lastName,
                  email,
                  encry_pass,
                  "coach",
                  postalCode,
                  cityId,
                  provider
                ])
                .then(async value => {


                  await db_library
                    .execute("SELECT * FROM `users` WHERE" + where)
                    .then(async value => {
                      var result = value;
                      _output.data = result[0];
                      _output.isSuccess = true;
                      _output.message = lang.coach_register;
                    }).catch(err => {
                      _output.data = err;
                      _output.isSuccess = false;
                      _output.message = "L'enregistrement a  chou ";
                    });
                })
                .catch(err => {
                  _output.data = err;
                  _output.isSuccess = false;
                  _output.message = "L'enregistrement de l'entra neur a  chou ";
                });
            }
            var mailTemplate = await mail_template.getMailTemplate(
              appConfig.MailTemplate.Register
            );
            const mailOption = require("../../_mailer/mailOptions");
            let _mailOption = new mailOption();
            _mailOption.to = email;
            _mailOption.subject = lang.registration_successful;
            var em = Buffer.from(email).toString("base64");
            var temp = mailTemplate[0].template;
            var temp1 = temp.replace("{{email}}", em);
            var temp2 = temp1.replace(
              "{{username}}",
              firstName + " " + lastName
            );
            _mailOption.html = temp2;
            var _mailer = require("../../_mailer/mailer");
            _mailer.sendMail(_mailOption);
          } catch (error) {
            _output.data = error;
            _output.isSuccess = false;
            _output.message = "L'enregistrement a  chou ";
          }
        } else {
          _output.data = result[0];
          _output.isSuccess = true;
          _output.message = "L'email existe d j ";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "L'enregistrement a  chou ";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "L'enregistrement a  chou ";
  }
  res.send(_output);
};
exports.registerUser = async function (req, res, next) {
  var _output = new output();

  const {
    firstName,
    lastName,
    email,
    gender,
    mobile,
    postalCode,
    cityId,
    password,
    roleId,
    provider
  } = req.body;

  if (
    firstName != "" &&
    lastName != "" &&
    email != "" &&
    gender != "" &&
    mobile != "" &&
    postalCode != "" &&
    cityId != "" &&
    password != "" &&
    roleId != ""
  ) {
    var encry_pass = await bcrypt.hash(password, 10);

    var query =
      "INSERT INTO `users`(`firstName`, `lastName`, `email`, `gender`, `password`, `mobile`, `postalCode`, `cityId`, `roleId`, `isActive`, `provider`)" +
      " VALUES (?,?,?,?,?,?,?,?,?,?,?);";
    var coach_query =
      "INSERT INTO `coaches_dbs`(`Coach_Fname`, `Coach_Lname`, `Coach_Email`, `Coach_Phone`, `Coach_Password`, `User_type`, `Coach_Ville`, `Coach_City`, `provider`)" +
      " VALUES (?,?,?,?,?,?,?,?,?);";
    where = " email = '" + email + "'";
    where += " AND provider = '" + provider + "'";

    await db_library
      .execute("SELECT * FROM `users` WHERE" + where)
      .then(async value => {
        var result = value;
        if (result.length == 0) {
          try {
            // let res = exports.insertUser(query);
            await db_library
              .parameterexecute(query, [
                firstName,
                lastName,
                email,
                gender,
                encry_pass,
                mobile,
                postalCode,
                cityId,
                roleId,
                1,
                provider
              ])
              .then(val => {
                _output.data = val;
                _output.isSuccess = true;
                _output.message = "S'inscrire avec succès";
              })
              .catch(err => {
                _output.data = err;
                _output.isSuccess = false;
                _output.message = "L'enregistrement a échoué";
              });
            if (roleId == 2) {
              await db_library
                .parameterexecute(coach_query, [
                  firstName,
                  lastName,
                  email,
                  mobile,
                  encry_pass,
                  "coach",
                  postalCode,
                  cityId,
                  provider
                ])
                .then(value => {
                  _output.data = value;
                  _output.isSuccess = true;
                  _output.message = lang.coach_register;
                })
                .catch(err => {
                  _output.data = err;
                  _output.isSuccess = false;
                  _output.message = "L'enregistrement de l'entraîneur a échoué";
                });
            }
            var mailTemplate = await mail_template.getMailTemplate(
              appConfig.MailTemplate.Register
            );
            const mailOption = require("../../_mailer/mailOptions");
            let _mailOption = new mailOption();
            _mailOption.to = email;
            _mailOption.subject = lang.registration_successful;
            var em = Buffer.from(email).toString("base64");
            var temp = mailTemplate[0].template;
            var temp1 = temp.replace("{{email}}", em);
            var temp2 = temp1.replace(
              "{{username}}",
              firstName + " " + lastName
            );
            _mailOption.html = temp2;
            var _mailer = require("../../_mailer/mailer");
            _mailer.sendMail(_mailOption);
          } catch (error) {
            console.log(error);
            _output.data = error;
            _output.isSuccess = false;
            _output.message = "L'enregistrement a échoué";
          }
        } else {
          _output.data = {};
          _output.isSuccess = false;
          _output.message = "L'email existe déjà";
        }
      })
      .catch(err => {
        console.log(err);
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "L'enregistrement a échoué";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "L'enregistrement a échoué";
  }

  res.send(_output);
};

exports.user_set_table = async function (req, res, next) {
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

exports.updateProfile = async function (req, res, next) {
  var _output = new output();

  const {
    Coach_Fname,
    Coach_Lname,
    Coach_Email,
    Coach_Phone,
    InstagramURL,
    FacebookURL,
    TwitterURL,
    Coach_Description,
    Coach_City,
    Coach_Ville,
    Coach_Image
  } = req.body;
  if (
    Coach_Fname != "" &&
    Coach_Lname != "" &&
    Coach_Email != "" &&
    Coach_Phone != "" &&
    Coach_Description != "" &&
    Coach_City != "" &&
    Coach_Ville != "" &&
    Coach_Image != ""
  ) {
    // var query = "INSERT INTO `users`(`firstName`, `lastName`, `email`, `gender`, `password`, `mobile`, `postalCode`, `cityId`, `roleId`, `isActive`)" +
    //     " VALUES ('" + firstName + "','" + lastName + "','" + email + "','" + gender + "','" + encry_pass + "','" + mobile + "','" + postalCode + "'," + cityId + "," + roleId + ",1);";

    var coach_query =
      "UPDATE `coaches_dbs` SET `Coach_Fname` =?, `Coach_Lname`=?,`Coach_Phone`=?, `InstagramURL`=?,  `FacebookURL`=?,`TwitterURL`=?,`Coach_Description`=?,`Coach_City`=?,`Coach_Ville`=?, `Coach_Image`=? WHERE `Coach_Email`=?;";
    await db_library
      .parameterexecute(coach_query, [
        Coach_Fname,
        Coach_Lname,
        Coach_Phone,
        InstagramURL,
        FacebookURL,
        TwitterURL,
        Coach_Description,
        Coach_City,
        Coach_Ville,
        Coach_Image,
        Coach_Email
      ])
      .then(value => {
        console.log("value", value);
        _output.data = value;
        _output.isSuccess = true;
        _output.message = "Mise à jour du profil réussie";
      })
      .catch(err => {
        //console.log("err", err);
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Échec de la mise à jour du profil";
      });
  } else {
    //console.log("err");
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec de la mise à jour du profil";
  }
  res.send(_output);
};

// exports.updateProfileTab2 = async function(req, res, next) {
//   var _output = new output();

//   const {
//     ResumeName,
//     Coach_Resume,
//     Coach_Services,
//     Coach_Rayon,
//     Coach_transport,
//     Coach_Email
//   } = req.body;

//   console.log(ResumeName);
//  console.log(Coach_Resume);

//   if (Coach_transport != "" && Coach_Email != "") {
//     var coach_query =
//       "UPDATE `coaches_dbs` SET `ResumeName`=?,`Coach_Resume`=?,`Coach_Services`=?,`Coach_Rayon`=?,`Coach_transport`=? WHERE `Coach_Email`=?;";

//     await db_library
//       .parameterexecute(coach_query, [
//         ResumeName,
//         Coach_Resume,
//         Coach_Services,
//         Coach_Rayon,
//         Coach_transport,
//         Coach_Email
//       ])
//       .then(value => {
//         //console.log("value", value);
//         _output.data = {};
//         _output.isSuccess = true;
//         _output.message = "Mise à jour du profil réussie";
//       })
//       .catch(err => {
//         //console.log("err", err.message);
//         _output.data = {};
//         _output.isSuccess = false;
//         _output.message = "Échec de la mise à jour du profil";
//       });
//   } else {
//     console.log("err");
//     _output.data = lang.required_field;
//     _output.isSuccess = false;
//     _output.message = "Échec de la mise à jour du profil";
//   }
//   res.send(_output);
// };


exports.updateProfileTab2 = async function (req, res, next) {
  var _output = new output();

  const {
    ResumeName,
    Coach_Resume,
    Coach_Services,
    Coach_Rayon,
    Coach_transport,
    Coach_Email,
    Coach_Ville
  } = req.body;
  let service_codes = [];
  service_codes.push(Number(Coach_Ville));

  if (Coach_Rayon == "0") {

  } else {
    var query_internal =
      "SELECT Code_postal,coordonnees_gps FROM cities WHERE `Code_postal`=" +
      Coach_Ville;
      console.log('query_internal',query_internal);
    await db_library.execute(query_internal).then(async results => {
      if (results.length > 0) {
        // If Results Greater than 0 Process the Code postal along with latitude and Longitude
        let Code_postal = results[0].Code_postal;
        let coordonnees_gps = results[0].coordonnees_gps;
        let lat_long = coordonnees_gps.split(",");
        let longitude = lat_long[0];
        let latitude = lat_long[1];
        let pcodes = await calculateLocation.calculateLocationbyrayon(
          longitude,
          latitude,
          Code_postal,
          Coach_Rayon
        );

        service_codes = service_codes.concat(pcodes);



      }
    })
  }


  console.log(JSON.stringify(service_codes), "service_codes")

  //console.log(data1);
  //console.log(Coach_Resume);

  if (Coach_transport != "" && Coach_Email != "") {
    var coach_query =
      "UPDATE `coaches_dbs` SET `ResumeName`=?,`Coach_Resume`=?,`Coach_Services`=?,`Coach_Rayon`=?,`Coach_transport`=?,`Service_codes`= ? WHERE `Coach_Email`=?;";

    await db_library
      .parameterexecute(coach_query, [
        ResumeName,
        Coach_Resume,
        Coach_Services,
        Coach_Rayon,
        Coach_transport,
        JSON.stringify(service_codes),
        Coach_Email,

      ])
      .then(value => {
        //console.log("value", value);
        _output.data = {};
        _output.isSuccess = true;
        _output.message = "Mise à jour du profil réussie";
      })
      .catch(err => {
        console.log("err", err.message);
        _output.data = {err};
        _output.isSuccess = false;
        _output.message = "Échec de la mise à jour du profil";
      });
  } else {
    console.log("err");
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec de la mise à jour du profil";
  }
  res.send(_output);
};

exports.updateProfileTab3 = async function (req, res, next) {
  var _output = new output();

  const {
    Coach_payment_type,
    Coach_Bank_Name,
    Coach_Bank_ACCNum,
    Branch_Code,
    Coach_Bank_City,
    Coach_Email
  } = req.body;

  if (
    Coach_payment_type != "" &&
    Coach_Bank_Name != "" &&
    Coach_Bank_ACCNum != "" &&
    Branch_Code != "" &&
    Coach_Email != ""
  ) {
    var coach_query =
      "UPDATE `coaches_dbs` SET `Coach_payment_type`=?,`Coach_Bank_Name`=?,`Coach_Bank_ACCNum`=?,`Branch_Code`=?,`Coach_Bank_City`=? WHERE `Coach_Email`=?;";

    await db_library
      .parameterexecute(coach_query, [
        Coach_payment_type,
        Coach_Bank_Name,
        Coach_Bank_ACCNum,
        Branch_Code,
        Coach_Bank_City,
        Coach_Email
      ])
      .then(value => {
        //console.log("value", value);
        _output.data = {};
        _output.isSuccess = true;
        _output.message = "Mise à jour du profil réussie";
      })
      .catch(err => {
        //console.log("err", err.message);
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Échec de la mise à jour du profil";
      });
  } else {
    console.log("err");
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec de la mise à jour du profil";
  }
  res.send(_output);
};

exports.login = async function (req, res, next) {
  var _output = new output();
  const { email, password } = req.body;
  if (email != "" && password != "") {
console.log(req.body)
    const query =
      "SELECT `id`, `firstName`, `lastName`, `email`, `gender`, `password`, `mobile`, `address`, `postalCode`, `cityId`," +
      "`roleId`, `isOtpVerified`, `isActive`, `provider`, `hashKey`" +
      " FROM `users` WHERE `email`= '" +
      email +
      "' AND `isOtpVerified`= 1 AND `isActive`= 1 AND `provider`= 'web';";
      console.log(query)
    await db_library
      .execute(query)
      .then(async value => {
        var result = value;
        console.log(result)
        if (result.length > 0) {
          const match = await bcrypt.compare(password, result[0].password);
          if (match) {
            _output.data = result[0];
            _output.isSuccess = true;
            _output.message = lang.login_success;
          } else {
            _output.data = {};
            _output.isSuccess = false;
            _output.message = lang.invalid_login;
          }
        }
        console.log(result)
        if (result.length == 0) {
          _output.data = {};
          _output.isSuccess = false;
          _output.message = lang.email_verify;
        }
      })
      .catch(err => {
        _output.data = {err};
        _output.isSuccess = false;
        _output.message = "Echec de la connexion";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Echec de la connexion";
  }
  res.send(_output);
};

exports.forgotPassword = async function (req, res, next) {
  var _output = new output();
  const email = req.body.email;

  if (email != "") {
    try {
      if (email) {
        var random = Math.random().toString();
        var encry_hash = await bcrypt.hash(random, 10);

        //Query
        var query =
          "UPDATE `users` SET `hashKey`='" +
          encry_hash +
          "' WHERE `email` = '" +
          email +
          "'";
        var sel_query =
          "SELECT `firstname`,`lastname` from `users` WHERE `email` = '" +
          email +
          "'";

        await db_library
          .execute(sel_query)
          .then(async val => {
            if (val.length > 0) {
              await db_library
                .execute(query)
                .then(async value => {
                  var mailTemplate = await mail_template.getMailTemplate(
                    appConfig.MailTemplate.ForgotPassword
                  );
                  const mailOption = require("../../_mailer/mailOptions");
                  let _mailOption = new mailOption();
                  _mailOption.to = email;
                  _mailOption.subject = lang.forgotten_password;
                  _mailOption.html = mailTemplate[0].template
                    .replace(
                      "{{username}}",
                      val[0].firstname + " " + val[0].lastname
                    )
                    .replace("{{hashkey}}", encry_hash);
                  var _mailer = require("../../_mailer/mailer");
                  _mailer.sendMail(_mailOption);
                  _output.data = value;
                  _output.isSuccess = true;
                  _output.message = "Hash Key Generated Successfully";
                })
                .catch(err => {
                  _output.data = {};
                  _output.isSuccess = false;
                  _output.message = "Hash Key Generated Failed";
                });
            } else {
              _output.data = {};
              _output.isSuccess = false;
              _output.message = "No User Found";
            }
          })
          .catch(err => {
            _output.data = {};
            _output.isSuccess = false;
            _output.message = "No User Found";
          });
      }
    } catch (err) {
      _output.data = {};
      _output.isSuccess = false;
      _output.message = "err";
    }
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Hash Key Generated Failed";
  }
  res.send(_output);
};

// exports.resetPassword = async function (req, res, next) {
//   var _output = new output();

//   const email = req.body.email;
//   const hashKey = req.body.hash;
//   const password = req.body.password;
//   var sel_query = "UPDATE `users` SET `hashKey`= '" + "" + "' WHERE `email` = '" + email + "'";

//   if (email != "" && password != "") {
//     var encry_pass = await bcrypt.hash(password, 10);
//     if (hashKey == "") {
//       var query =
//         "UPDATE `users` SET `password`= '" +
//         encry_pass +
//         "' WHERE `email` = '" +
//         email +
//         "'";
//     } else {
//       var query =
//         "UPDATE `users` SET `password`= '" +
//         encry_pass +
//         "' WHERE `hashKey`='" +
//         hashKey +
//         "' AND `email` = '" +
//         email +
//         "'";
//     }
//     await db_library
//       .execute(query)
//       .then(async value => {
//         //console.log(value);
//         await db_library
//           .execute(sel_query)
//         if (value.affectedRows > 0) {
//           //var result = {};

//           _output.data = {};
//           _output.isSuccess = true;
//           _output.message = "Réinitialisation du mot de passe réussie";
//         } else {
//           _output.data = {};
//           _output.isSuccess = false;
//           _output.message = "La réinitialisation du mot de passe a échou";
//         }
//       })
//       .catch(err => {
//         _output.data = {};
//         _output.isSuccess = false;
//         _output.message = "La réinitialisation du mot de passe a échou";
//       });
//   } else {
//     _output.data = lang.required_field;
//     _output.isSuccess = false;
//     _output.message = "La réinitialisation du mot de passe a échou";
//   }
//   res.send(_output);
// };



exports.resetPassword = async function (req, res, next) {
  var _output = new output();

  const email = req.body.email;
  const hashKey = req.body.hash;
  const password = req.body.password;
  var sel_query = "UPDATE `users` SET `hashKey`= '" + "" + "' WHERE `email` = '" + email + "'";
  //const hashquery = "SELECT `hashKey` FROM users where `email` = '" + email + "'";
  //const dbkey = await db_library.execute(hashquery)
  //console.log(dbkey)

  if (email != "" && password != "") {
    var encry_pass = await bcrypt.hash(password, 10);
    if (hashKey != "") {
      var query =
        "UPDATE `users` SET `password`= '" +
        encry_pass +
        "' WHERE `hashKey`='" +
        hashKey +
        "' AND `email` = '" +
        email +
        "'";
    } 
    await db_library
      .execute(query)
      .then(async value => {
        //console.log(value);
        await db_library
          .execute(sel_query)
        if (value.affectedRows > 0) {
          //var result = {};

          _output.data = {};
          _output.isSuccess = true;
          _output.message = "Réinitialisation du mot de passe réussie";
        } else {
          _output.data = {};
          _output.isSuccess = false;
          _output.message = "La réinitialisation du mot de passe a échou";
        }
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "La réinitialisation du mot de passe a échou";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "La réinitialisation du mot de passe a échou";
  }
  res.send(_output);
};



exports.userVerification = async function (req, res, next) {
  const email = req.body.email;
  var _output = new output();

  if (email != "") {
    var query =
      "UPDATE `users` SET isOtpVerified = 1 WHERE email = '" + email + "';";

    await db_library
      .execute(query)
      .then(value => {
        var result = value;
        _output.data = {};
        _output.isSuccess = true;
        _output.message = "Votre compte a été vérifié avec succès";
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "La vérification de l'utilisateur a échoué";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "La vérification de l'utilisateur a échoué";
  }
  res.send(_output);
};

async function setChangePassword(email, encry_pass) {
  try {
    var query =
      "UPDATE `coaches_dbs` SET Coach_Password = '" +
      encry_pass +
      "' WHERE Coach_Email = '" +
      email +
      "'; ";
    return await db_library.execute(query).then(async data => {
      return data;
    });
  } catch (error) {
    return error;
  }
}

exports.setNewPassword = async function (req, res, next) {
  var _output = new output();
  const email = req.body.email;
  const password = req.body.password;
  const role_id = req.body.role;
  console.log(role_id);
  if (email != "" && password != "") {
    var encry_pass = await bcrypt.hash(password, 10);

    var query =
      "UPDATE `users` SET password = '" +
      encry_pass +
      "' WHERE email = '" +
      email +
      "'; ";

    await db_library
      .execute(query)
      .then(async value => {
        var result = value;
        if (role_id == 2) {
          await setChangePassword(email, encry_pass);
        }
        _output.data = result;
        _output.isSuccess = true;
        _output.message = "Mot de passe mis à jour avec succès";
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Échec de la mise à jour du mot de passe";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec de la mise à jour du mot de passe";
  }
  res.send(_output);
};

exports.getCoachDetails = async function (req, res, next) {
  var _output = new output();

  await db_library
    .execute("SELECT * FROM `coaches_dbs`")
    .then(value => {
      var obj = {
        coaches: value
      };
      _output.data = obj;
      _output.isSuccess = true;
      _output.message = "Coach réussit";
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "L'entraîneur a échoué";
    });
  res.send(_output);
};

exports.getUserDetails = async function (req, res, next) {
  var _output = new output();

  await db_library
    .execute("SELECT * FROM `users`")
    .then(value => {
      var obj = {
        coaches: value
      };
      _output.data = obj;
      _output.isSuccess = true;
      _output.message = "L'utilisateur obtient avec succès";
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "L'utilisateur a échoué";
    });
  res.send(_output);
};

exports.blockCoach = async function (req, res, next) {
  const Coach_ID = req.body.Coach_ID;
  var _output = new output();

  await db_library
    .execute("INSERT")
    .then(value => {
      var result = value;
      _output.data = result;
      _output.isSuccess = true;
      _output.message = "Entraîneur bloqué avec succès";
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "Échec de l'entraîneur bloqué";
    });
  res.send(_output);
};

exports.blockUser = async function (req, res, next) {
  const User_ID = req.body.id;
  var _output = new output();

  await db_library
    .execute("Update")
    .then(value => {
      var result = value;
      _output.data = result;
      _output.isSuccess = true;
      _output.message = "Utilisateur bloqué avec succès";
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "Échec de l'utilisateur bloqué";
    });
  res.send(_output);
};

exports.unBlockUser = async function (req, res, next) {
  const User_ID = req.body.id;
  var _output = new output();

  await db_library
    .execute("Update")
    .then(value => {
      var result = value;
      _output.data = result;
      _output.isSuccess = true;
      _output.message = "Utilisateur débloqué avec succès";
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "Échec du déverrouillage de l'utilisateur";
    });
  res.send(_output);
};

exports.deleteUser = async function (req, res, next) {
  const User_ID = req.body.id;
  var _output = new output();

  await db_library
    .execute("Update")
    .then(value => {
      var result = value;
      _output.data = result;
      _output.isSuccess = true;
      _output.message = "Suppression réussie de l'utilisateur";
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "Échec de la suppression de l'utilisateur";
    });
  res.send(_output);
};

exports.updateUserProfile = async function (req, res, next) {
  var _output = new output();
  const {
    firstName,
    lastName,
    email,
    mobile,
    postalCode,
    cityId,
    User_Location,
    User_Level,
    // User_Team,
    address,
    User_Image
  } = req.body;
  console.log(req.body);
  if (
    firstName != "" &&
    lastName != "" &&
    email != "" &&
    mobile != "" &&
    postalCode != "" &&
    cityId != "" &&
    User_Location != "" &&
    User_Level != "" &&
    address != "" &&
    User_Image != ""
  ) {
    var user_query =
      "UPDATE `users` SET `firstName` = ?, `lastName`=?, `email`=?, `mobile`=?," +
      " `User_Location`=?, `User_Level`=?, `postalCode`=?, `cityId`=?, `address`=?,`User_Image`=? WHERE `email`=?;";
    console.log(user_query);
    await db_library
      .parameterexecute(user_query, [
        firstName,
        lastName,
        email,
        mobile,
        User_Location,
        User_Level,
        postalCode,
        cityId,
        address,
        User_Image,
        email
      ])
      .then(value => {
        _output.data = {};
        _output.isSuccess = true;
        _output.message = "mise à jour de profil réussie";
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Échec de la mise à jour du profil";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec de la mise à jour du profil";
  }
  res.send(_output);
};

exports.getuserbyid = async function (req, res, next) {
  const User_Email = req.body.User_Email;
  var _output = new output();

  if (User_Email != "") {
    await db_library
      .execute("SELECT * FROM `users` WHERE email='" + User_Email + "'")
      .then(value => {
        if (value.length > 0) {
          var obj = {
            User_list: value
          };
          var result = obj;
          _output.data = result;
          _output.isSuccess = true;
          _output.message = "L'utilisateur obtient le succès";
        } else {
          var obj = {
            User_list: {}
          };
          var result = obj;
          _output.isSuccess = true;
          _output.message = "Aucun entraîneur trouvé";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "L'utilisateur obtient le succès";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "L'utilisateur obtient le succès";
  }
  res.send(_output);
};

exports.getUserReservationDetails = async function (req, res, next) {
  var _output = new output();
  const user_id = req.query.user_Id;
  //const id = req.query.id;

  if (user_id != "") {
    // var query = "select * from course_stage where Coach_Id = " + Coach_id + " AND id = " + id + "";
    var query = "select users.*,booking_dbs.*,DATE_FORMAT(booking_dbs.bookingDate,'%d-%m-%Y') as bookdatefillter from booking_dbs JOIN users ON  booking_dbs.Coach_ID = users.id where booking_dbs.user_Id = " + user_id + " GROUP BY `booking_dbs`.`booking_Id` ORDER BY created_at DESC";
    console.log("query=== ", query)
    await db_library
      .execute(query).then(async (value) => {
        var result = value;
        if (value.length > 0) {
          //                    result[0].from_date = formatDate(new Date(result[0].from_date))
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

exports.getUserReservation = async function (req, res, next) {
  var _output = new output();
  const User_ID = req.query.User_ID;
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

          var query = "SELECT cd.Postalcode,cd.Coach_Ville,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `individualcourses` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE= cd.Coach_Ville WHERE cd.id=" + data.bookingCourseID + " GROUP BY cd.id";

        } else if (data.bookingCourse == 'CoursCollectifOndemand') {

          var query = "SELECT cd.Postalcode,cd.Coach_Ville,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `course_collective_if_demand` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE= cd.Coach_Ville WHERE cd.Group_Id=" + data.bookingCourseID + " GROUP BY cd.Group_Id";

        } else if (data.bookingCourse == 'CoursCollectifClub') {

          var query = "SELECT cd.Postalcode,cd.Coach_Ville,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `couse_collective_if_club` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE= cd.Coach_Ville WHERE cd.Course_Id=" + data.bookingCourseID + " GROUP BY cd.Course_Id";

        } else if (data.bookingCourse == 'Stage') {

          var query = "SELECT cd.Postalcode,cd.Coach_Ville,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `course_stage` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE= cd.Coach_Ville WHERE cd.id=" + data.bookingCourseID + " GROUP BY cd.id";

        } else if (data.bookingCourse == 'Tournoi') {

          var query = "SELECT cd.Postalcode,cd.Coach_Ville,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `tournament` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE= cd.Coach_Ville WHERE cd.id=" + data.bookingCourseID + " GROUP BY cd.id";

        } else if (data.bookingCourse == 'TeamBuilding') {

          var query = "SELECT cd.Postalcode,cd.Coach_Ville,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `team_building` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE= cd.Coach_Ville WHERE cd.id=" + data.bookingCourseID + " GROUP BY cd.id";

        } else if (data.bookingCourse == 'Animation') {

          var query = "SELECT cd.Postalcode,cd.Coach_Ville,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `animations` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE= cd.Coach_Ville WHERE cd.id=" + data.bookingCourseID + " GROUP BY cd.id";

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


  if (User_ID != "") {
    var Qry =
      `select booking_Id,bookingCourseID,BookingTime,Coach_ID,amount,bookingCourse, d.CourseName,(select DATE_FORMAT(bookingDate, '%Y-%m-%d')) as bookingDate,discount_club,paymentStatus,payment_Id,status,user_Id, u.firstName, u.lastName, u.email,s.Remarks, s.remaingSlotStatus from booking_dbs s
        inner join course_dbs d on s.bookingCourse = d.Course_Shotname
        inner join users u on s.Coach_ID = u.id where user_Id = ` + User_ID + ` ORDER BY s.booking_Id DESC`;
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
          _output.message = "Obtenez le succès";
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
        _output.message = "Get Failed";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Get Failed";
  }
  res.send(_output);
};

async function updateSlotDetailsByBookingIds(
  Coach_id,
  user_Id,
  booking_date,
  course,
  booking_time
) {
  try {
    //console.log(Coach_id, user_Id, booking_date, course, booking_time);
    const Query =
      "UPDATE `avaiablity` SET `Status`= 'Y' WHERE `CoachId`= '" +
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

async function getSlotDetailsByBookingIds(booking_id) {
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

// async function setCancelStatusAvaiablitys(
//   Coach_id,
//   user_Id,
//   booking_date,
//   course,
//   booking_id
// ) {
//   try {
//     const getSlotBookingId = await getSlotDetailsByBookingIds(booking_id);
//     console.log(getSlotBookingId);
//     for (let i = 0; i < getSlotBookingId.length; i++) {
//       //const element = array[i];
//       await updateSlotDetailsByBookingIds(
//         Coach_id,
//         user_Id,
//         getSlotBookingId[i].booking_date,
//         course,
//         getSlotBookingId[i].booking_time
//       );
//     }
//     return true;
//   } catch (error) {
//     return error;
//   }
// }

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

exports.cancelReservations = async function (req, res, next) {
  var _output = new output();
  const Coach_id = req.body.Coach_ID;
  const status = req.body.status;
  const booking_id = req.body.booking_id;
  const amount = req.body.amount;
  const booking_date = req.body.booking_date;
  const course = req.body.course;
  const email = req.body.email;
  const booking_time = req.body.booking_time;
  //const user_Id = req.body.user_Id;

  if (
    Coach_id != "" &&
    status != "" &&
    booking_id != "" &&
    amount != "" &&
    booking_date != "" &&
    course != ""
  ) {
    if (course == "CoursCollectifOndemand") {
      var update_qry =
        "UPDATE `booking_dbs` SET `status`= '" +
        status +
        "' ,`amount`= '" +
        amount +
        "' WHERE `booking_Id`=" +
        booking_id +
        " AND `bookingDate`='" +
        booking_date +
        "' AND `bookingCourse`='" +
        course +
        "'";
      var sel_qry =
        "SELECT * FROM `users` u INNER JOIN `booking_dbs` b on u.id = b.user_Id INNER JOIN `coaches_dbs` cb where cb.Coach_Email = '" +
        email +
        "' AND b.bookingCourse='" +
        course +
        "' AND b.bookingDate ='" +
        booking_date +
        "' AND b.Coach_ID = " +
        Coach_id +
        " AND b.BookingTime = '" +
        booking_time +
        "'";
    } else {
      // var where = "";
      // if (ville !== "") {
      //   const postalCode = ville.trim();
      //   where += " AND u.postalCode = '" + postalCode + "'";
      // }

      var update_qry =
        "UPDATE `booking_dbs` SET `status`= '" +
        status +
        "' ,`amount`= '" +
        amount +
        "' WHERE `booking_Id`= '" +
        booking_id +
        "'";

      //const bookingSlotData = await setCancelStatusAvaiablity(req.body)
      // var update_qry = "UPDATE `booking_dbs` SET `status`= '" + status + "' ,`amount`= '" + amount + "' WHERE `Coach_id`=" + Coach_id + " AND `booking_id`=" + booking_id + "";
      // var update_qry =
      //   "call proc_set_booking_status(" +
      //   booking_id +
      //   "," +
      //   amount +
      //   ",'" +
      //   status +
      //   "')";

      var sel_qry =
        "SELECT * FROM `users` u INNER JOIN `booking_dbs` b on u.id = b.user_Id INNER JOIN `coaches_dbs` cb where cb.Coach_Email = '" +
        email +
        "' AND b.booking_id = " +
        booking_id +
        "";
    }

    //console.log(sel_qry);

    await db_library
      .execute(update_qry)
      .then(async value => {
        if (value.affectedRows > 0) {
          await db_library
            .execute(sel_qry)
            .then(async val => {
              //console.log("select query"); 
              if (val.length > 0) {

                console.log("[coach.js - line 1086]", Coach_id, user_Id, status, booking_date, course, booking_id)
                // await setCancelStatusAvaiablitys(
                //   Coach_id,
                //   val[0].id,
                //   booking_date,
                //   course,
                //   booking_id
                // );

                const getSlotBookingId = await getSlotDetailsByBookingIds(
                  booking_id
                );
                var dateArr = [];
                //console.log("[user.js - line 951]", getSlotBookingId);
                //if (getSlotBookingId.length > 0) {
                for (var j = 0; j < getSlotBookingId.length; j++) {
                  //const element = array[i];
                  await updateSlotDetailsByBookingIds(
                    getSlotBookingId[j].coach_id,
                    val[0].id,
                    formatDate(getSlotBookingId[j].booking_date),
                    course,
                    getSlotBookingId[j].booking_time
                  );
                  dateArr.push(formatDate(getSlotBookingId[j].booking_date));
                }
                //}

                var dateString = dateArr.join();

                for (var i = 0; i < val.length; i++) {
                  if (status == "UC") {
                    var mailTemplate = await mail_template.getMailTemplate(
                      appConfig.MailTemplate.UserCancel
                    );
                    const mailOption = require("../../_mailer/mailOptions");
                    let _mailOption = new mailOption();
                    _mailOption.to = val[i].Coach_Email;
                    _mailOption.subject =
                      "Réservation annulée par " +
                      val[i].firstName +
                      " " +
                      val[i].lastName;
                    _mailOption.html = mailTemplate[0].template
                      .replace(
                        "{{username}}",
                        val[i].Coach_Fname + " " + val[i].Coach_Lname
                      )
                      .replace(
                        "{{user}}",
                        val[i].firstName + " " + val[i].lastName
                      )
                      .replace("{{course}}", val[i].bookingCourse)
                      .replace("{{book_date}}", dateString);
                    var _mailer = require("../../_mailer/mailer");
                    _mailer.sendMail(_mailOption);
                  }
                }
                _output.data = {};
                _output.isSuccess = true;
                _output.message = "Réservation annulée avec succès";
              }
            })
            .catch(err => {
              _output.data = {};
              _output.isSuccess = false;
              _output.message = "Courrier non envoyé";
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

exports.cancelReservation = async function (req, res, next) {
  var _output = new output();
  const Coach_id = req.body.Coach_ID;
  const status = req.body.status;
  const booking_id = req.body.booking_id;
  const amount = req.body.amount;
  const booking_date = req.body.booking_date;
  const course = req.body.course;
  const email = req.body.email;
  const booking_time = req.body.booking_time;
  //const user_Id = req.body.user_Id;

  if (
    Coach_id != "" &&
    status != "" &&
    booking_id != "" &&
    amount != "" &&
    booking_date != "" &&
    course != ""
  ) {
    if (course == "CoursCollectifOndemand") {
      var update_qry =
        "UPDATE `booking_dbs` SET `status`= '" +
        status +
        "' ,`amount`= '" +
        amount +
        "' WHERE `booking_Id`=" +
        booking_id +
        " AND `bookingDate`='" +
        booking_date +
        "' AND `bookingCourse`='" +
        course +
        "'";
      var sel_qry =
        "SELECT * FROM `users` u INNER JOIN `booking_dbs` b on u.id = b.user_Id INNER JOIN `coaches_dbs` cb where cb.Coach_Email = '" +
        email +
        "' AND b.bookingCourse='" +
        course +
        "' AND b.bookingDate ='" +
        booking_date +
        "' AND b.Coach_ID = " +
        Coach_id +
        " AND b.BookingTime = '" +
        booking_time +
        "'";
    } else {
      var where = "";
      if (ville !== "") {
        const postalCode = ville.trim();
        where += " AND u.postalCode = '" + postalCode + "'";
      }

      var update_qry =
        "UPDATE `booking_dbs` SET `status`= '" +
        status +
        "' ,`amount`= '" +
        amount +
        "' WHERE `booking_Id`= '" +
        booking_id +
        "'";

      //const bookingSlotData = await setCancelStatusAvaiablity(req.body)
      // var update_qry = "UPDATE `booking_dbs` SET `status`= '" + status + "' ,`amount`= '" + amount + "' WHERE `Coach_id`=" + Coach_id + " AND `booking_id`=" + booking_id + "";
      // var update_qry =
      //   "call proc_set_booking_status(" +
      //   booking_id +
      //   "," +
      //   amount +
      //   ",'" +
      //   status +
      //   "')";

      var sel_qry =
        "SELECT * FROM `users` u INNER JOIN `booking_dbs` b on u.id = b.user_Id INNER JOIN `coaches_dbs` cb where cb.Coach_Email = '" +
        email +
        "' AND b.booking_id = " +
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
                // console.log("[coach.js - line 1086]", Coach_id, user_Id, status, booking_date, course, booking_id)
                // await setCancelStatusAvaiablity(Coach_id, user_Id, booking_date, course, booking_id);
                for (var i = 0; i < val.length; i++) {
                  if (status == "UC") {
                    var mailTemplate = await mail_template.getMailTemplate(
                      appConfig.MailTemplate.UserCancel
                    );
                    const mailOption = require("../../_mailer/mailOptions");
                    let _mailOption = new mailOption();
                    _mailOption.to = val[i].Coach_Email;
                    _mailOption.subject =
                      "Réservation annulée par " +
                      val[i].firstName +
                      " " +
                      val[i].lastName;
                    _mailOption.html = mailTemplate[0].template
                      .replace(
                        "{{username}}",
                        val[i].Coach_Fname + " " + val[i].Coach_Lname
                      )
                      .replace(
                        "{{user}}",
                        val[i].firstName + " " + val[i].lastName
                      )
                      .replace("{{course}}", val[i].bookingCourse)
                      .replace(
                        "{{book_date}}",
                        moment(val[i].bookingDate).format("DD-MM-YYYY")
                      );
                    var _mailer = require("../../_mailer/mailer");
                    _mailer.sendMail(_mailOption);
                  }
                }
                _output.data = {};
                _output.isSuccess = true;
                _output.message = "Réservation annulée avec succès";
              }
            })
            .catch(err => {
              _output.data = {};
              _output.isSuccess = false;
              _output.message = "Courrier non envoyé";
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

exports.getallusercoursecount = async function (req, res, next) {
  var _output = new output();
  const User_ID = req.body.User_ID;
  var CoursIndividuel;
  var CoursCollectifOndemand;
  var CoursCollectifClub;
  var Stage;
  var Tournament;

  await db_library
    .execute(
      `select count(*) from booking_dbs s INNER join users u on s.user_Id = u.id INNER join individualcourses inv on s.bookingCourseID = inv.id where s.bookingCourse = "CoursIndividuel" AND s.status="B" AND s.user_Id = ` +
      User_ID
    )
    .then(value => {
      CoursIndividuel = value[0]["count(*)"];
    });
  await db_library
    .execute(
      `select count(*) from booking_dbs s INNER join users u on s.user_Id = u.id INNER join course_collective_if_demand ccd on s.bookingCourseID = ccd.Group_Id where s.bookingCourse = "CoursCollectifOndemand" AND s.status="B" AND s.user_Id = ` +
      User_ID
    )
    .then(value => {
      CoursCollectifOndemand = value[0]["count(*)"];
    });

  await db_library
    .execute(
      `select count(*) from booking_dbs s INNER join users u on s.user_Id = u.id INNER join couse_collective_if_club ccc on s.bookingCourseID = ccc.Course_Id where s.bookingCourse = "CoursCollectifClub" AND s.status="B" AND s.user_Id = ` +
      User_ID
    )
    .then(value => {
      CoursCollectifClub = value[0]["count(*)"];
    });

  await db_library
    .execute(
      `select count(*) from booking_dbs s INNER join users u on s.user_Id = u.id INNER join course_stage stage on s.bookingCourseID = stage.id where s.bookingCourse = "Stage" AND s.status="B" AND s.user_Id = ` +
      User_ID
    )
    .then(value => {
      Stage = value[0]["count(*)"];
    });
  await db_library
    .execute(
      `select count(*) from booking_dbs s INNER join users u on s.user_Id = u.id INNER join tournament t on s.bookingCourseID = t.id where s.bookingCourse = "Tournoi" AND s.status="B" AND s.user_Id = ` +
      User_ID
    )
    .then(value => {
      Tournament = value[0]["count(*)"];
    });
  await db_library
    .execute(
      `select count(*) from booking_dbs s INNER join users u on s.user_Id = u.id INNER join team_building tb on s.bookingCourseID = tb.id where s.bookingCourse = "TeamBuilding" AND s.status="B" AND s.user_Id = ` +
      User_ID
    )
    .then(value => {
      TeamBuilding = value[0]["count(*)"];
    });

  await db_library
    .execute(
      `select count(*) from booking_dbs s INNER join users u on s.user_Id = u.id INNER join animations a on s.bookingCourseID = a.id where s.bookingCourse = "Animation" AND s.status="B" AND s.user_Id = ` +
      User_ID
    )
    .then(value => {
      Animation = value[0]["count(*)"];
    });

  var obj = {
    CoursIndividuel: CoursIndividuel,
    CoursCollectifOndemand: CoursCollectifOndemand,
    CoursCollectifClub: CoursCollectifClub,
    Stage: Stage,
    Tournament: Tournament,
    TeamBuilding: TeamBuilding,
    Animation: Animation
  };
  _output.data = obj;
  _output.isSuccess = true;
  _output.message = "Get Successfull";
  res.send(_output);
};
exports.accountdeletebyemail = async function (req, res, next) {
  var _output = new output();
  let email = decodeURIComponent(req.body.emailId);
  if (email != "") {
    var user_query =
      "UPDATE `users` SET `isActive` = 0, `updatedAt` =? WHERE `email`=?;";
    await db_library
      .parameterexecute(user_query, [new Date(), email])
      .then(value => {
        _output.data = {};
        _output.isSuccess = true;
        _output.message = decodeURIComponent("Votre compte a �t� supprim�.");
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Échec de la mise à jour du profil";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Échec de la mise à jour du profil";
  }
  res.send(_output);
};

exports.subscribenewsletter = async function (req, res, next) {
  var _output = new output();
  const {
    email,
    postalCode,
  } = req.body;

  console.log('emailId' + req.body.email);

  if (email != "") {
    var mailTemplate = await mail_template.getMailTemplate(
      appConfig.MailTemplate.Newsletter
    );
    const mailOption = require("../../_mailer/mailOptions");
    let _mailOption = new mailOption();
    _mailOption.to = email;
    _mailOption.subject = "Abonnez-vous avec succ�s";
    var temp = mailTemplate[0].template;
    _mailOption.html = temp;

    var _mailer = require("../../_mailer/mailer");
    _mailer.sendMail(_mailOption);
    _output.data = {};
    _output.isSuccess = true;
    _output.message = "Abonnez-vous avec succ�s";
    console.log("sibscribed");

  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "L'enregistrement a échoué";
  }

  res.send(_output);
};

exports.addContact = async function (req, res, next) {
  var _output = new output();
  const {
    court_name,
    incharge_name,
    court_email,
    court_phone,
    court_postal_code,
    court_address
  } = req.body;

  if (court_name != "" && incharge_name != "" && court_email != "" && court_phone != "" && court_postal_code != "" && court_address
    != "") {

    var insert_query = "INSERT INTO `contact_details` (`court_name`, `incharge_name`, `court_email`, `court_phone`, `court_postal_code`, `court_address`) VALUES " +
      "(?,?,?,?,?,?);";


    await db_library
      .parameterexecute(insert_query, [court_name, incharge_name, court_email, court_phone, court_postal_code, court_address]).then((value) => {
        var result = value;
        _output.data = {};
        _output.isSuccess = true;
        _output.message = "coordonn�es soumises avec succ�s";
      }).catch(err => {
        _output.data = err;
        _output.isSuccess = false;
        _output.message = "Veuillez r�essayer";
      });

  } else {
    _output.data = "Le champ obligatoire est manquant";
    _output.isSuccess = false;
    _output.message = "Veuillez remplir tous les d�tails";
  }
  res.send(_output);
};


exports.getapiVersion = async function (req, res, next) {
  var _output = new output();
  const Id = req.query.Id; console.log(Id);
  await db_library
    .execute("SELECT * FROM `app_version` WHERE `id`='" + Id + "'")
    .then(value => {
      var obj = {
        api: value
      };
      _output.data = obj;
      _output.isSuccess = true;
      _output.message = "api version";
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "L'entraîneur a échoué";
    });
  res.send(_output);
};



