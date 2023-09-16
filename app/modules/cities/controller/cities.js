const output = require("../../_models/output");
const db_library = require("../../_helpers/db_library");
const calculateLocation = require("../../_helpers/calculateRadiusDistance");

//const bcrypt = require("bcrypt");


exports.getcityName = async function(req, res, next) {
  var _output = new output();
  const postalcode = req.params.postalcode;

    var query1 = "SELECT cities.Nom_commune, cities.Code_postal FROM `cities` GROUP BY Code_commune_INSEE ORDER BY cities.Nom_commune ASC";

    await db_library
      .execute(query1)
      .then(value => {
        if (value.length > 0) {
          var result = value;
          var obj = {
            city_list: result
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Cities Get Successfull";
        } else {
          _output.data = {};
          _output.isSuccess = false;
          _output.message = "No Cities";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Cities Get Failed";
      });
 
  res.send(_output);
};

exports.citiesbyrayon = async function (req, res, next) {
  const ville = req.query.ville;
  const rayon = req.query.rayon;
  var _output = new output();

  // Checking for the Rayon is Empty
  if (rayon == "0") {
    var query =
    "SELECT cities.Nom_commune, cities.Code_postal FROM `cities` GROUP BY cities.Nom_commune, cities.Code_postal  -- Include both columns in GROUP BY  ORDER BY cities.Nom_commune ASC";
    // "SELECT cities.Nom_commune, cities.Code_postal FROM `cities` GROUP BY Code_commune_INSEE ORDER BY cities.Nom_commune ASC";
    await db_library
      .execute(query)
      .then(value => {
        if (value.length > 0) {
          var result = value;
          var obj = {
            city_list: result
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Cities Get Successfull";
        } else {
          _output.data = {};
          _output.isSuccess = false;
          _output.message = "No Cities Found";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Cities Get Failed";
      });
  }
  else {
    let rayon = req.query.rayon;
    var query_internal =
    "SELECT  Code_postal,coordonnees_gps FROM cities WHERE `Code_postal`='" + ville + "'" ;
    //console.log(query_internal)
    
    await db_library.execute(query_internal).then(async results => {
      if (results.length > 0) {
        // If Results Greater than 0 Process the Code postal along with latitude and Longitude
        let Code_postal = results[0].Code_postal;
        let coordonnees_gps = results[0].coordonnees_gps;
        let lat_long = coordonnees_gps.split(",");
        let longitude = lat_long[0];
        let latitude = lat_long[1];
       await calculateLocation.calculateCitiesbyrayon(
          longitude,
          latitude,
          Code_postal,
          rayon
        )
        .then(value => {
          uniqueArray = value.filter(function(elem, pos) {
            return value.indexOf(elem) == pos;
        })
        //console.log(uniqueArray)
          if (uniqueArray.length > 0) {
            var result = uniqueArray;
            var obj = {
              city_list: result
            };
            _output.data = obj;
            _output.isSuccess = true;
            _output.message = "cities Get Successfull";
          } else {
            _output.data = {};
            _output.isSuccess = false;
            _output.message = "No cities Found";
          }
        })
        .catch(err => {
          _output.data = error.message;
          _output.isSuccess = false;
          _output.message = "Cities Get Failed";
        });
        
      } 

      
    }); 
  } 
  

      
    
    
  res.send(_output);
};

exports.getCitynameForPostalCode = async function(req, res, next) {
  var _output = new output();
  const postalcode = req.params.postalcode;
  console.log(postalcode)

  if (postalcode != "") {
    var query =
      "SELECT * FROM `cities` WHERE `Code_postal`='" + postalcode + "'";
	console.log(query)
    await db_library
      .execute(query)
      .then(value => {
        if (value.length > 0) {
          var result = value;
	 console.log(result )
          var obj = {
            city_list: result
          };
	console.log(obj)

          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Cities Get Successfull";
        } else {
          _output.data = {};
          _output.isSuccess = false;
          _output.message = "No Cities Found";
        }
      })
      .catch(err => {
        _output.data = {err};
        _output.isSuccess = false;
        _output.message = "Cities Get Failed";
      });
  } else {
    _output.data = "Required Field are missing";
    _output.isSuccess = false;
    _output.message = "Cities Get Failed";
  }
  res.send(_output);
};

exports.getCityID = async function(req, res, next) {
  var _output = new output();
  const Code_commune_INSEE= req.params.id;
  
  if (Code_commune_INSEE!= "") {
    var query =
      "SELECT * FROM `cities` WHERE `Code_commune_INSEE`='" + Code_commune_INSEE+ "' GROUP BY Code_commune_INSEE";
    await db_library
      .execute(query)
      .then(value => {
        if (value.length > 0) {
          var result = value;
          var obj = {
            city_list: result
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Cities Get Successfull";
        } else {
          _output.data = {};
          _output.isSuccess = false;
          _output.message = "No Cities Found";
        }
      })
      .catch(err => {
        _output.data = error.message;
        _output.isSuccess = false;
        _output.message = "Cities Get Failed";
      });
  } else {
    _output.data = "Required Field are missing";
    _output.isSuccess = false;
    _output.message = "Cities Get Failed";
  }
  res.send(_output);
};


exports.getCityPostal = async function(req, res, next) {
  var _output = new output();
  const nom_commune= req.params.name;
  console.log("testcity");
  if (nom_commune!= "") {  
    var query =
      "SELECT * FROM `cities` WHERE `Nom_commune`='" + nom_commune + "' GROUP BY Code_commune_INSEE";
     console.log(query );
    await db_library
      .execute(query)
      .then(value => {
        if (value.length > 0) {
          var result = value;
          var obj = {
            city_list: result
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Cities Get Successfull";
        } else {
          _output.data = {};
          _output.isSuccess = false;
          _output.message = "No Cities Found";
        }
      })
      .catch(err => {
        _output.data = error.message;
        _output.isSuccess = false;
        _output.message = "Cities Get Failed";
      });
  } else {
    _output.data = "Required Field are missing";
    _output.isSuccess = false;
    _output.message = "Cities Get Failed";
  }
  res.send(_output);
};




exports.cityTable = async function(req, res, next) {
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
    await db_library.execute("DROP TABLE IF EXISTS " + arr[i], function(
      err,
      rows
    ) {});
  }
  _output.data = {};
  _output.isSuccess = true;
  _output.message = "Le cours réussit";
  res.send(_output);
};


exports.postalcodesbyrayon = async function (req, res, next) {
  const ville = req.query.ville;
  const rayon = req.query.rayon;
  var _output = new output();

  // Checking for the Rayon is Empty
  if (rayon == "0") {
    var query =
    "SELECT *  FROM `cities` WHERE `Code_postal`='" + ville + "' GROUP BY Code_postal";
    await db_library
      .execute(query)
      .then(value => {
        if (value.length > 0) {
          var result = value;
          var obj = {
            city_list: result
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Cities Get Successfull";
        } else {
          _output.data = {};
          _output.isSuccess = false;
          _output.message = "No Cities Found";
        }
      })
      .catch(err => {
        _output.data = error.message;
        _output.isSuccess = false;
        _output.message = "Cities Get Failed";
      });
  }
  else {
    let rayon = req.query.rayon;
    var query_internal =
    "SELECT  Code_postal,coordonnees_gps FROM cities WHERE `Code_postal`='" + ville + "'" ;
    
    
    await db_library.execute(query_internal).then(async results => {
      if (results.length > 0) {
        // If Results Greater than 0 Process the Code postal along with latitude and Longitude
        let Code_postal = results[0].Code_postal;
        let coordonnees_gps = results[0].coordonnees_gps;
        let lat_long = coordonnees_gps.split(",");
        let longitude = lat_long[0];
        let latitude = lat_long[1];
       await calculateLocation.calculateLocationbyrayon(
          longitude,
          latitude,
          Code_postal,
          rayon
        )
        .then(value => {
          uniqueArray = value.filter(function(elem, pos) {
            return value.indexOf(elem) == pos;
        })
          if (uniqueArray.length > 0) {
            var result = uniqueArray;
            var obj = {
              city_list: result
            };
            _output.data = obj;
            _output.isSuccess = true;
            _output.message = "postalcode Get Successfull";
          } else {
            _output.data = {};
            _output.isSuccess = false;
            _output.message = "No postalcode Found";
          }
        })
        .catch(err => {
          _output.data = error.message;
          _output.isSuccess = false;
          _output.message = "Cities Get Failed";
        });
        
      } 

      
    }); 
  } 
  

      
    
    
  res.send(_output);
};
