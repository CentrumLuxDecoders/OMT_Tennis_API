const db_library = require("../_helpers/db_library");

exports.calculateLocationRadius = async function(longitude, latitude, code_postal, rayon) {
  return new Promise(async (resolve, reject) => {
    var query =
      "SELECT DISTINCT(c.Code_postal),(6371 * acos (cos ( radians(" +
      latitude +
      ") )* cos( radians( SUBSTRING_INDEX(c.coordonnees_gps, ',', -1) ) )* cos( radians( SUBSTRING_INDEX(c.coordonnees_gps, ',',1) ) - radians(" +
      longitude +
      ") )+ sin ( radians(" +
      latitude +
      ") )* sin( radians( SUBSTRING_INDEX(c.coordonnees_gps, ',', -1) ) ))) AS distance, c.coordonnees_gps FROM cities c HAVING (distance > 0 AND distance <= 20) ORDER BY distance ASC";
    db_library.execute(query).then(value => {
      if (value.length > 0) {
        var postal_code = [];
        for (let index = 0; index < value.length; index++) {
          postal_code.push(value[index].Code_postal);
        }
      } else {
        postal_code = [];
      } // End of value.length=0
      resolve(postal_code);
    });
  }); // End of Promise Function
}


exports.calculateLocationbyrayon = async function(longitude, latitude, code_postal, rayon) {
  return new Promise(async (resolve, reject) => {

    var query ="SELECT *, (6371 * ACOS(COS(RADIANS("+latitude+")) * COS(RADIANS(SUBSTRING_INDEX(c.coordonnees_gps, ',', -1))) * COS(RADIANS(SUBSTRING_INDEX(c.coordonnees_gps, ',', 1) - RADIANS("+longitude+"))) + SIN(RADIANS("+latitude+")) * SIN(RADIANS(SUBSTRING_INDEX(c.coordonnees_gps, ',', -1))))) AS distance FROM cities c WHERE (6371 * ACOS(COS(RADIANS("+latitude+")) * COS(RADIANS(SUBSTRING_INDEX(c.coordonnees_gps, ',', -1))) * COS(RADIANS(SUBSTRING_INDEX(c.coordonnees_gps, ',', 1) - RADIANS("+longitude+"))) + SIN(RADIANS("+latitude+")) * SIN(RADIANS(SUBSTRING_INDEX(c.coordonnees_gps, ',', -1))))) BETWEEN 0 AND "+ rayon +" ORDER BY distance ASC";
    // var query =
    //   "SELECT c.Code_postal,(6371 * acos (cos ( radians(" +
    //   latitude +
    //   ") )* cos( radians( SUBSTRING_INDEX(c.coordonnees_gps, ',', -1) ) )* cos( radians( SUBSTRING_INDEX(c.coordonnees_gps, ',',1) ) - radians(" +
    //   longitude +
    //   ") )+ sin ( radians(" +
    //   latitude +
    //   ") )* sin( radians( SUBSTRING_INDEX(c.coordonnees_gps, ',', -1) ) ))) AS distance, c.coordonnees_gps FROM cities c GROUP BY c.Code_postal HAVING (distance > 0 AND distance <= "+ rayon +") ORDER BY distance ASC";
    console.log('queryquery',query);
      db_library.execute(query).then(value => {
      if (value.length > 0) {
        var postal_code = [];
        for (let index = 0; index < value.length; index++) {
          postal_code.push(Number(value[index].Code_postal));
        }
      } else {
        postal_code = [];
      } // End of value.length=0
      resolve(postal_code);
    });
  }); // End of Promise Function
}

exports.calculateCitiesbyrayon = async function(longitude, latitude, code_postal, rayon) {
  return new Promise(async (resolve, reject) => {
    var query =
      "SELECT DISTINCT(c.Nom_commune),c.Code_postal,(6371 * acos (cos ( radians(" +
      latitude +
      ") )* cos( radians( SUBSTRING_INDEX(c.coordonnees_gps, ',', -1) ) )* cos( radians( SUBSTRING_INDEX(c.coordonnees_gps, ',',1) ) - radians(" +
      longitude +
      ") )+ sin ( radians(" +
      latitude +
      ") )* sin( radians( SUBSTRING_INDEX(c.coordonnees_gps, ',', -1) ) ))) AS distance, c.coordonnees_gps FROM cities c HAVING (distance > 0 AND distance <= "+ rayon +") ORDER BY distance ASC";
   await  db_library.execute(query).then(value => {
      if (value.length > 0) {
        var cities = [];
        for (let index = 0; index < value.length; index++) {
          cities = value;
        }
        console.log(cities);
      } else {
        cities = [];
      } // End of value.length=0
      resolve(cities);
    });
  }); // End of Promise Function
}

