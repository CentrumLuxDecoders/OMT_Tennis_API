const output = require("../../_models/output");
const db_library = require("../../_helpers/db_library");
const moment = require('moment');


exports.insertIndividualCourse = async function (req, res, next) {
    var _output = new output();
    const {
        id,
        Coach_Ville,
        Postalcode,
        Photo,
        Coach_Id,
        Description,
        Price_min,
        Price_max,
        specialty,
        Technical_provided,
        Video,
        Mode_of_Transport,
        Plan,
        mode_of_payment,
        Eventname,
        filename,
        address
    } = req.body;

    if (id != "" && Coach_Id != "" && Coach_Ville != "" && Postalcode != "" && Description != "" && Price_min != "" && Price_max != "" && Mode_of_Transport != "" && Plan != "" && Photo != "") {


        var update_query = "Update `individualcourses` set `Eventname`=?, `Mode_of_Transport`=?, `Description`=?, `Price_min`=?," +
            "`Price_max`=?, `specialty`=?, `Technical_provided`=?, `Video` =?, `Plan` =?, `mode_of_payment` =?, `Coach_Ville` =?, `Postalcode` =?, `Photo` =?, `filename` =?, `address` =?, `updatedAt` = NOW() where `Coach_Id` = ? AND `id`=?";

        await db_library
            .execute("SELECT * FROM `individualcourses` WHERE Coach_Id=" + Coach_Id + " AND id=" + id + "").then(async (value) => {
                if (value.length > 0) {
                    await db_library
                        .parameterexecute(update_query, [Eventname, Mode_of_Transport, Description, Price_min, Price_max, specialty, Technical_provided, Video, Plan, mode_of_payment, Coach_Ville, Postalcode, Photo, filename, address, Coach_Id, id]).then((value) => {
                            var result = value;
                            _output.data = value;
                            _output.isSuccess = true;
                            _output.message = "Cours individuel mis   jour avec succ s";

                        }).catch(err => {
                            _output.data = {};
                            _output.isSuccess = false;
                            _output.message = "La mise   jour du cours individuel a  chou ";
                        });
                }
            }).catch(err => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "Erreur lors de l'insertion ou de la mise   jour d'un cours individuel";
            });
        res.send(_output);
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "La mise   jour du cours individuel a  chou ";
    }
}

exports.setIndividualCourseInsert = async function (req, res, next) {
    var _output = new output();
    const {
        Coach_Ville,
        Postalcode,
        Photo,
        Coach_Id,
        Description,
        Price_min,
        Price_max,
        specialty,
        Technical_provided,
        Video,
        Mode_of_Transport,
        Plan,
        mode_of_payment,
        Eventname,
        filename,
        address
    } = req.body;

    if (Coach_Id != "" && Coach_Ville != "" && Postalcode != "" && Description != "" && Price_min != "" && Price_max != "" && Mode_of_Transport != "" && Plan != "" && Photo != "") {

        var insert_query = "INSERT INTO `individualcourses` (`Eventname`, `Coach_Id`, `Mode_of_Transport`, `Description`, `Price_min`, `Price_max`," +
            " `specialty`,`Technical_provided`, `Video`, `Plan`, `mode_of_payment`, `createdAt`, `updatedAt`,`Postalcode`,`Coach_Ville`, `Photo`, `filename`,`address`) VALUES " +
            "(?,?,?,?,?,?,?,?,?,?,?,Now(),Now(),?,?,?,?,?);";


        await db_library
            .parameterexecute(insert_query, [Eventname, Coach_Id, Mode_of_Transport, Description, Price_min, Price_max, specialty, Technical_provided, Video, Plan, mode_of_payment, Postalcode, Coach_Ville, Photo, filename,address]).then((value) => {
                var result = value;
                _output.data = {};
                _output.isSuccess = true;
                _output.message = "Cours individuel ajout� avec succ�s";
            }).catch(err => {
                _output.data = err;
                _output.isSuccess = false;
                _output.message = "Cours individuel ajout� avec succ�s";
            });

        res.send(_output);
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Cours individuel ajout� avec succ�s";
    }
}


exports.getIndividualCourse = async function (req, res, next) {
    var _output = new output();
    const CoachId = req.query.coachId;
    const Indvid = req.query.indv_id;
    const UserId = req.query.user_id;
    let makereview = false;
    if(UserId != undefined && UserId != '' && UserId != null){
     var query1 = "SELECT * from booking_dbs where Coach_ID = " + CoachId + "  AND user_id = " + UserId + " limit 1"
     var review = await db_library
            .execute(query1)
      console.log(review)
      if(review.length > 0){
        makereview = true
      }else{
         makereview = false
      }
    }
      console.log(makereview)
    if (CoachId != undefined && Indvid != undefined) {
        var query = "select ind.*,ci.coordonnees_gps,ci.Libelle_acheminement as Location from `individualcourses` ind INNER JOIN `cities` ci on ci.Code_postal = ind.Postalcode AND ci.Code_commune_INSEE = ind.Coach_Ville where ind.Coach_Id = " + CoachId + " AND ind.id = " + Indvid + " GROUP BY ind.id";

        await db_library
            .execute(query).then(async (value) => {
                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result,
                        review : makereview
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Le cours individuel r�ussit";
                } else {
                    var obj = {
                        course: [],
                        review : makereview
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Cours individuel introuvable";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "La le�on individuelle a �chou�";
            })
    }
    else {

        var query = "select ind.*,ci.coordonnees_gps,ci.Libelle_acheminement as Location from `individualcourses` ind INNER JOIN `cities` ci on ci.Code_postal = ind.Postalcode AND ci.Code_commune_INSEE = ind.Coach_Ville where ind.Coach_Id = " + CoachId + " GROUP BY ind.id";

        await db_library
            .execute(query).then(async (value) => {
                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result,
                        review : makereview
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Le cours individuel r�ussit";
                } else {
                    var obj = {
                        course: [],
                        review : makereview
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Cours individuel introuvable";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "La le�on individuelle a �chou�";
            })
    }
    res.send(_output);
}

exports.getCoachById = async function (req, res, next) {
    var _output = new output();
    const CoachId = req.query.coachId;
    const UserId = req.query.user_id;
    let makereview = false;
    if(UserId != undefined && UserId != '' && UserId != null){
     var query1 = "SELECT * from booking_dbs where Coach_ID = " + CoachId + "  AND user_id = " + UserId + " limit 1"
     var review = await db_library
            .execute(query1)
      console.log(review)
      if(review.length > 0){
        makereview = true
      }else{
         makereview = false
      }
    }
      console.log(makereview)
    if (CoachId != "") {
        var query = "select ind.*,ci.coordonnees_gps,ci.Libelle_acheminement as Location  from `coaches_dbs` ind INNER JOIN `cities` ci on ci.Code_postal = ind.Coach_City where Coach_ID = " + CoachId + "";
        await db_library
            .execute(query).then(async (value) => {
                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result,
                        review : makereview
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Le cours individuel r�ussit";
                } else {
                    var obj = {
                        course: [],
                        review : makereview
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Cours individuel introuvable";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "La le�on individuelle a �chou�";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "La le�on individuelle a �chou�";
    }
    res.send(_output);
}

exports.getIndividualCourseByCoachId = async function (req, res, next) {
    var _output = new output();
    const CoachId = req.query.coachId;
    if (CoachId != "") {
        var query = "select DISTINCT ind.*,ci.coordonnees_gps,ci.Libelle_acheminement as cityname from `individualcourses` ind INNER JOIN `cities` ci on ci.Code_postal = ind.Postalcode AND ci.Code_commune_INSEE = ind.Coach_Ville where Coach_Id = " + CoachId + "";
        await db_library
            .execute(query).then(async (value) => {
                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Le cours individuel r�ussit";
                } else {
                    var obj = {
                        course: []
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Cours individuel introuvable";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "La le�on individuelle a �chou�";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "La le�on individuelle a �chou�";
    }
    res.send(_output);
}


exports.getIndividualCourseById = async function (req, res, next) {
    var _output = new output();
    const CoachId = req.query.coachId;
    const Id = req.query.id;
    if (CoachId != "" && Id != "") {
        var query = "select DISTINCT ind.*,ci.coordonnees_gps from `individualcourses` ind INNER JOIN `cities` ci on ci.Code_postal = ind.Postalcode where Coach_Id = " + CoachId + " AND ind.id = " + Id + " GROUP BY ind.id";
        await db_library
            .execute(query).then(async (value) => {
                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Le cours individuel r�ussit";
                } else {
                    var obj = {
                        course: []
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Cours individuel introuvable";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "La le�on individuelle a �chou�";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "La le�on individuelle a �chou�";
    }
    res.send(_output);
}

 
exports.getIndividualCourses = async function (req, res, next) {
    var _output = new output();
    const id = req.params.coachId;
    if (id != "") {
        var query = "select ind.*,ci.coordonnees_gps from `individualcourses` ind INNER JOIN `cities` ci on ci.Code_postal = ind.Postalcode where Coach_Id = " + id;
        await db_library
            .execute(query).then(async (value) => {
                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Le cours individuel r�ussit";
                } else {
                    var obj = {
                        course: []
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Cours individuel introuvable";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "La le�on individuelle a �chou�";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "La le�on individuelle a �chou�";
    }
    res.send(_output);
}


exports.setcouseCollectiveDemanadInsert = async function (req, res, next) {
    var _output = new output();
    const {

        Coach_Id,
        Min_People,
        Max_People,
        Eventname,
        Description,
        Coach_Ville,
        Postalcode,
        Photo,
        Video,
        Mode_of_transport,
        mode_of_payment,
        specialty,
        Price_2pl_1hr,
        Price_3pl_1hr,
        Price_4pl_1hr,
        Price_5pl_1hr,
        Price_6pl_1hr,
        Price_2pl_10hr,
        Price_3pl_10hr,
        Price_4pl_10hr,
        Price_5pl_10hr,
        Price_6pl_10hr,
        Plan,
        filename,
        address

    } = req.body;
    var insert_query = "INSERT INTO `course_collective_if_demand`(`Coach_Id`,`Min_People`, `Max_People`, `Eventname`, `Description`, `Coach_Ville`, `Postalcode`, `Photo`, `Video`, `Mode_of_transport`, `mode_of_payment`, `specialty`, `Price_2pl_1hr`, `Price_3pl_1hr`, `Price_4pl_1hr`, `Price_5pl_1hr`,`Price_6pl_1hr`,`Price_2pl_10hr`,`Price_3pl_10hr`,`Price_4pl_10hr`,`Price_5pl_10hr`, `Price_6pl_10hr`, `Plan`, `filename`,`address`) VALUES" +
        "(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";

    await db_library
        .parameterexecute(insert_query, [Coach_Id, Min_People, Max_People, Eventname, Description, Coach_Ville, Postalcode, Photo, Video, Mode_of_transport, mode_of_payment, specialty, Price_2pl_1hr, Price_3pl_1hr, Price_4pl_1hr, Price_5pl_1hr, Price_6pl_1hr, Price_2pl_10hr, Price_3pl_10hr, Price_4pl_10hr, Price_5pl_10hr, Price_6pl_10hr, Plan, filename,address]).then((value) => {
            _output.data = {};
            _output.isSuccess = true;
            _output.message = "La demande collective de cours a �t� ajout�e avec succ�s";
        }).catch(err => {
            _output.data = err.message;
            _output.isSuccess = false;
            _output.message = "�chec de la demande collective de cours";
        });

    res.send(_output);
}
exports.setcouseCollectiveDemanad = async function (req, res, next) {
    var _output = new output();
    const {
        Coach_Id,
        Group_Id,
        Min_People,
        Max_People,
        Eventname,
        Description,
        Coach_Ville,
        Postalcode,
        Photo,
        Video,
        Mode_of_transport,
        mode_of_payment,
        specialty,
        Price_2pl_1hr,
        Price_3pl_1hr,
        Price_4pl_1hr,
        Price_5pl_1hr,
        Price_6pl_1hr,
        Price_2pl_10hr,
        Price_3pl_10hr,
        Price_4pl_10hr,
        Price_5pl_10hr,
        Price_6pl_10hr,
        Plan,
        filename,
        address
    } = req.body;


    var update_query = "Update `course_collective_if_demand` set `Min_People`=?, `Max_People`=?, `Eventname`=?, `Description`=?," +
        "`Coach_Ville`=?, `Postalcode`=?, `Photo`=?, `Video`=?, `Mode_of_transport` =?, `mode_of_payment` =?, `specialty` =?, `Price_2pl_1hr` =?, `Price_3pl_1hr` =?, `Price_4pl_1hr` =?,`Price_5pl_1hr` =?, `Price_6pl_1hr` =?, `Price_2pl_10hr` =?, `Price_3pl_10hr` =?, `Price_4pl_10hr` =?, `Price_5pl_10hr` =?, `Price_6pl_10hr` =?, `Plan` =?, `filename` =?, `address` =?, `created_at` = NOW() where `Coach_Id` = ? AND `Group_Id`=?";

    await db_library
        .execute("SELECT * FROM `course_collective_if_demand` WHERE Coach_Id=" + Coach_Id + " AND Group_Id=" + Group_Id + "").then(async (value) => {
            if (value.length > 0) {
                await db_library
                    .parameterexecute(update_query, [Min_People, Max_People, Eventname, Description, Coach_Ville, Postalcode, Photo, Video, Mode_of_transport, mode_of_payment, specialty, Price_2pl_1hr, Price_3pl_1hr, Price_4pl_1hr, Price_5pl_1hr, Price_6pl_1hr, Price_2pl_10hr, Price_3pl_10hr, Price_4pl_10hr, Price_5pl_10hr, Price_6pl_10hr, Plan, filename,address, Coach_Id, Group_Id]).then((value) => {
                        var result = {};
                        _output.data = result;
                        _output.isSuccess = true;
                        _output.message = "La demande collective de cours a �t� mise � jour avec succ�s";

                    }).catch(err => {
                        _output.data = err.message;
                        _output.isSuccess = false;
                        _output.message = "�chec de la demande de cours collectif mise � jour";
                    });
            }
        }).catch(err => {
            _output.data = err.message;
            _output.isSuccess = false;
            _output.message = "La demande collective de cours n'existe pas";
        });
    res.send(_output);
}

exports.getcouseCollectiveDemanadById = async function (req, res, next) {
    var _output = new output();
    const Coach_Id = req.query.coachId;
    const Id = req.query.id;
    if (Coach_Id != "" && Id != "") {
        await db_library
            .execute("SELECT cd.*,ci.coordonnees_gps FROM `course_collective_if_demand` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE = cd.Coach_Ville WHERE Coach_Id=" + Coach_Id + " AND cd.Group_Id = " + Id + "").then(async (value) => {
                if (value.length > 0) {
                    var result = value;
                    var obj = {
                        course: result
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Cours demande collective Obtenez avec succ�s";
                } else {
                    var obj = {
                        course: []
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Aucun Enregistrement Trouv�";
                }

            }).catch((err) => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "�chec de la demande collective de cours";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "�chec de la demande collective de cours";
    }
    res.send(_output);
}

exports.getcouseCollectiveDemanad = async function (req, res, next) {
    var _output = new output();
    const Coach_Id = req.query.Coach_ID;
    const indvid = req.query.indv_id;
    const UserId = req.query.user_id;
    let makereview = false;
    if(UserId != undefined && UserId != '' && UserId != null){
     var query1 = "SELECT * from booking_dbs where Coach_ID = " + Coach_Id + "  AND user_id = " + UserId + " limit 1"
     var review = await db_library
            .execute(query1)
      console.log(review)
      if(review.length > 0){
        makereview = true
      }else{
         makereview = false
      }
    }
      console.log(makereview)
    if ((typeof Coach_Id != undefined) && (typeof indvid !== 'undefined' && indvid != 'undefined' && indvid != undefined)) {
        await db_library
            .execute("SELECT cd.*,cd.Price_2pl_1hr as Price_min,cd.Price_2pl_10hr as Price_max, ci.coordonnees_gps,ci.Libelle_acheminement as Location FROM `course_collective_if_demand` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE= cd.Coach_Ville WHERE cd.Coach_Id=" + Coach_Id + " AND cd.Group_Id=" + indvid + " GROUP BY cd.Group_Id").then(async (value) => {
                if (value.length > 0) {
                    var result = value;
                    var obj = {
                        course: result,
                        review : makereview
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Cours demande collective Obtenez avec succ�s";
                } else {
                    var obj = {
                        course: [],
                        review : makereview
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Aucun Enregistrement Trouv�";
                }

            }).catch((err) => {
                _output.data = err;
                _output.isSuccess = false;
                _output.message = "�chec de la demande collective de cours";
            })
    } else {

        query = "SELECT cd.*,cd.Price_2pl_1hr as Price_min,cd.Price_2pl_10hr as Price_max,ci.coordonnees_gps,ci.Libelle_acheminement as Location FROM `course_collective_if_demand` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE = cd.Coach_Ville WHERE cd.Coach_Id=" + Coach_Id + " GROUP BY cd.Group_Id";
        await db_library
            .execute(query).then(async (value) => {
                if (value.length > 0) {
                    var result = value;
                    var obj = {
                        course: result,
                        review : makereview
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Cours demande collective Obtenez avec succ�s";
                } else {
                    var obj = {
                        course: [],
                        review : makereview
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Aucun Enregistrement Trouv�";
                }

            }).catch((err) => {
                _output.data = err;
                _output.isSuccess = false;
                _output.message = "�chec de la demande collective de cours";
            })
    }
    res.send(_output);
}

exports.getcouseCollectiveDemanadByCoachId = async function (req, res, next) {
    var _output = new output();
    const Coach_Id = req.query.Coach_ID;
    var query = "SELECT DISTINCT cd.*,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `course_collective_if_demand` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE= cd.Coach_Ville WHERE cd.Coach_Id=" + Coach_Id + "";

    if (Coach_Id != "") {
        await db_library
            .execute(query).then(async (value) => {
                if (value.length > 0) {
                    var result = value;
                    var obj = {
                        course: result
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Cours demande collective Obtenez avec succ�s";
                } else {
                    var obj = {
                        course: []
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Aucun Enregistrement Trouv�";
                }

            }).catch((err) => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "�chec de la demande collective de cours";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "�chec de la demande collective de cours";
    }
    res.send(_output);
}

exports.insertCourseCollectiveClub = async function (req, res, next) {
    var _output = new output();

    const {
        Coach_Id,
        Description,
        Photo,
        filename,
        Mode_of_Transport,
        specialty,
        Technical_Provided,
        Video,
        Plan,
        Club_Name,
        Coach_Ville,
        Postalcode,
        availablity,
        address
    } = req.body;

    if (Coach_Id != "" && Description != "" && Photo != "" && Postalcode != "" && Mode_of_Transport != "" && Plan != "" && Club_Name != "" && Coach_Ville != "") {

        var insert_query = "INSERT INTO `couse_collective_if_club` (`Coach_Id`, `Description`, `Photo`, `filename`, `Mode_of_Transport`, `specialty`, " +
            " `Technical_Provided`, `Video`, `Plan`, `createdAt`, `Club_Name`, `Coach_Ville`, `Postalcode`,`address`) VALUES " +
            "(?,?,?,?,?,?,?,?,?, NOW(),?,?,?,?);";

        await db_library
            .parameterexecute(insert_query, [Coach_Id, Description, Photo, filename, Mode_of_Transport, specialty, Technical_Provided, Video, Plan, Club_Name, Coach_Ville, Postalcode,address]).then(async (value) => {
                var course_id = value.insertId;
                if (value.affectedRows > 0) {
                    for (var i = 0; i < availablity.length; i++) {
                        const {
                            CoachId,
                            Weekday,
                            StartTime,
                            EndTime,
                            MaxCount,
                            Price,
                            Course,
                            Id,
                        } = availablity[i];
                        if (Id == "") {
                            var insert_availablity =
                            "INSERT INTO `courseclub_availablity`(`couch_id`, `Weekday`, `StartTime`, `EndTime`, `Price`,`MaxCount`,`Course`,`Id`)" +
                            " VALUES ('" +
                            Coach_Id +
                            "','" +
                            Weekday +
                            "','" +
                            StartTime +
                            "','" +
                            EndTime +
                            "','" +
                            Price +
                            "','" +
                            MaxCount +
                            "','" +
                            Course +
                            "','" +
                            0 +
                            "')";
                        
                        } else {
                           
                        var insert_availablity =
                            "INSERT INTO `courseclub_availablity`(`couch_id`, `Weekday`, `StartTime`, `EndTime`, `Price`,`MaxCount`,`Course`,`Id`)" +
                            " VALUES ('" +
                            Coach_Id +
                            "','" +
                            Weekday +
                            "','" +
                            StartTime +
                            "','" +
                            EndTime +
                            "','" +
                            Price +
                            "','" +
                            MaxCount +
                            "','" +
                            Course +
                            "','" +
                            Id +
                            "')";
                        }
	                     console.log(insert_availablity)
                        await db_library
                            .execute(insert_availablity).then(async (res) => {

                                _output.data = {};
                                _output.isSuccess = true;
                                _output.message = "Le club collectif de cours a �t� ajout� avec succ�s";
                            }).catch(err => {

                                _output.data = err.message;
                                _output.isSuccess = false;
                                _output.message = "�chec du club collectif de cours";
                            })
                    }
                }
            }).catch(err => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "�chec du club collectif de cours";
            });
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Bien s�r, la demande collective a �chou�";
    }
    res.send(_output);
}


exports.updateCourseCollectiveClub = async function (req, res, next) {
    var _output = new output();
    const {
        Course_Id,
        Coach_Id,
        Description,
        Photo,
        filename,
        Mode_of_Transport,
        specialty,
        Technical_Provided,
        Video,
        Plan,
        Club_Name,
        Coach_Ville,
        Postalcode,
        availablity,
        address
    } = req.body;
    if (Coach_Id != "" && Description != "" && Photo != "" && Postalcode != "" && Mode_of_Transport != "" && Plan != "" && Club_Name != "" && Coach_Ville != "") {
        var update_query = "Update `couse_collective_if_club` set  `Description`=?, `Photo`=?, `filename`=?, `Mode_of_Transport`=?, `specialty`=?," +
            "`Technical_Provided`=?, `Video` = ?, `Plan` =?,  `createdAt` = NOW(), `Club_Name` = ?, `Coach_Ville` =?, `Postalcode` =?, `address` =? where `Coach_Id` = ? AND `Course_Id` = ?";
        await db_library
            .execute("SELECT * FROM `couse_collective_if_club` WHERE Coach_Id=" + Coach_Id + " AND Course_Id = " + Course_Id + "").then(async (value) => {
                if (value.length > 0) {
                    await db_library
                        .parameterexecute(update_query, [Description, Photo, filename, Mode_of_Transport, specialty, Technical_Provided, Video, Plan, Club_Name, Coach_Ville, Postalcode, address, Coach_Id, Course_Id]).then(async (value) => {
                            if (value.affectedRows > 0) {
                                for (var i = 0; i < availablity.length; i++) {
                                    const {
                                        CoachId,
                                        Weekday,
                                        StartTime,
                                        EndTime,
                                        MaxCount,
                                        Price,
                                        Course,
                                        Id,
                                    } = availablity[i];
                                    console.log(Id)
                                    if (Id == "") {
                                        var insert_availablity = "call inst_upd_clubavailablity(" + Coach_Id + ",'" + Weekday + "','" + StartTime + "','" + EndTime + "'," + MaxCount + "," + Price + ",'" + Course + "','" + Course_Id + "',0 )"
                                    } else {
                                        var insert_availablity = "call inst_upd_clubavailablity(" + Coach_Id + ",'" + Weekday + "','" + StartTime + "','" + EndTime + "'," + MaxCount + "," + Price + ",'" + Course + "','" + Course_Id + "'," + Id + ")"
                                    }
                                
                                    await db_library
                                        .execute(insert_availablity).then(async (res) => {
                                            _output.data = {};
                                            _output.isSuccess = true;
                                            _output.message = "Le club collectif de cours a  t  mis   jour avec succ s";
                                        }).catch(err => {
                                            _output.data = err.message;
                                            _output.isSuccess = false;
                                            _output.message = " chec de la mise   jour du club collectif de cours";
                                        })
                                }
                            }
                        }).catch(err => {
                            _output.data = err.message;
                            _output.isSuccess = false;
                            _output.message = " chec de la mise   jour du club collectif de cours";
                        });
                }
            }).catch(err => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "Le club collectif de cours n'existe pas";
            });
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Bien s r, la demande collective a  chou ";
    }
    res.send(_output);
}


exports.setCourseCollectiveClub = async function (req, res, next) {
    var _output = new output();
    const {
        Coach_Id,
        Description,
        Photo,
        filename,
        Mode_of_Transport,
        specialty,
        Technical_Provided,
        Video,
        Plan,
        Club_Name,
        Place,
        Postalcode,
        availablity
    } = req.body;
    if (Coach_Id != "" && Description != "" && Photo != "" && Postalcode != "" && Mode_of_Transport != "" && Plan != "" && Club_Name != "" && Place != "") {

        var insert_query = "INSERT INTO `couse_collective_if_club` (`Coach_Id`, `Description`, `Photo`, `filename`, `Mode_of_Transport`, `specialty`, " +
            " `Technical_Provided`, `Video`, `Plan`, `createdAt`, `Club_Name`, `Place`, `Postalcode`) VALUES " +
            "(?,?,?,?,?,?,?,?,?, NOW(),?,?,?);";

        var update_query = "Update `couse_collective_if_club` set  `Description`=?, `Photo`=?, `filename`=?, `Mode_of_Transport`=?, `specialty`=?," +
            "`Technical_Provided`=?, `Video` = ?, `Plan` =?,  `createdAt` = NOW(), `Club_Name` = ?, `Place` =?, `Postalcode` =? where `Coach_Id` = ?";

        await db_library
            .execute("SELECT * FROM `couse_collective_if_club` WHERE Coach_Id=" + Coach_Id + "").then(async (value) => {
                if (value.length > 0) {
                    await db_library
                        .parameterexecute(update_query, [Description, Photo, filename, Mode_of_Transport, specialty, Technical_Provided, Video, Plan, Club_Name, Place, Postalcode, Coach_Id]).then(async (value) => {
                            if (value.affectedRows > 0) {
                                for (var i = 0; i < availablity.length; i++) {
                                    const {
                                        CoachId,
                                        Weekday,
                                        StartTime,
                                        EndTime,
                                        MaxCount,
                                        Price,
                                        Course,
                                        Id,
                                    } = availablity[i];
                                    if (Id == "") {
                                        var insert_availablity = "call inst_upd_clubavailablity(" + Coach_Id + ",'" + Weekday + "','" + StartTime + "','" + EndTime + "'," + MaxCount + "," + Price + ",'" + Course + "',0 )"
                                    } else {
                                        var insert_availablity = "call inst_upd_clubavailablity(" + Coach_Id + ",'" + Weekday + "','" + StartTime + "','" + EndTime + "'," + MaxCount + "," + Price + ",'" + Course + "'," + Id + ")"
                                    }
                                    await db_library
                                        .execute(insert_availablity).then(async (res) => {
                                            _output.data = {};
                                            _output.isSuccess = true;
                                            _output.message = "Le club collectif de cours a �t� mis � jour avec succ�s";
                                        }).catch(err => {
                                            _output.data = err.message;
                                            _output.isSuccess = false;
                                            _output.message = "�chec de la mise � jour du club collectif de cours";
                                        })
                                }
                            }
                        }).catch(err => {
                            _output.data = err.message;
                            _output.isSuccess = false;
                            _output.message = "�chec de la mise � jour du club collectif de cours";
                        });
                } else {
                    await db_library
                        .parameterexecute(insert_query, [Coach_Id, Description, Photo, filename, Mode_of_Transport, specialty, Technical_Provided, Video, Plan, Club_Name, Place, Postalcode]).then(async (value) => {
                            if (value.affectedRows > 0) {
                                for (var i = 0; i < availablity.length; i++) {
                                    const {
                                        CoachId,
                                        Weekday,
                                        StartTime,
                                        EndTime,
                                        MaxCount,
                                        Price,
                                        Course,
                                        Id,
                                    } = availablity[i];
                                    if (Id == "") {
                                        var insert_availablity = "call inst_upd_clubavailablity(" + Coach_Id + ",'" + Weekday + "','" + StartTime + "','" + EndTime + "'," + MaxCount + "," + Price + ",'" + Course + "',0 )"
                                    } else {
                                        var insert_availablity = "call inst_upd_clubavailablity(" + Coach_Id + ",'" + Weekday + "','" + StartTime + "','" + EndTime + "'," + MaxCount + "," + Price + ",'" + Course + "'," + Id + ")"
                                    }
                                    await db_library
                                        .execute(insert_availablity).then(async (res) => {

                                            _output.data = {};
                                            _output.isSuccess = true;
                                            _output.message = "Le club collectif de cours a �t� ajout� avec succ�s";
                                        }).catch(err => {

                                            _output.data = err.message;
                                            _output.isSuccess = false;
                                            _output.message = "�chec du club collectif de cours";
                                        })
                                }
                            }
                        }).catch(err => {
                            _output.data = err.message;
                            _output.isSuccess = false;
                            _output.message = "�chec du club collectif de cours";
                        });
                }
            }).catch(err => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "Le club collectif de cours n'existe pas";
            });
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Bien s�r, la demande collective a �chou�";
    }
    res.send(_output);
}
exports.deleteCommentaires = async function (req, res, next) {
    var _output = new output();
    const CoachId = req.body.CoachId;
    const Id = req.body.Id;

    if (CoachId != "" && Id != "") {
        await db_library
            .execute("DELETE FROM `customer_reviews` WHERE Coach_Id=" + CoachId + " AND id = " + Id + "").then(async (value) => {
                if (value.affectedRows > 0) {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Suppression de la disponibilit� du commentaires";
                } else {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Aucun Enregistrement commentaires";
                }

            }).catch((err) => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "�chec de la suppression de la disponibilit� du commentaires";
            })
    }

    else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "�chec de la suppression de la disponibilit� du club";
    }
    res.send(_output);
}

exports.deleteCommentairesbyuser = async function (req, res, next) {
    var _output = new output();
    const UserId = req.body.UserId;
    const Id = req.body.Id;

    if (UserId != "" && Id != "") {
        await db_library
            .execute("DELETE FROM `customer_reviews` WHERE User_Id=" + UserId + " AND id = " + Id + "").then(async (value) => {
                if (value.affectedRows > 0) {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Suppression de la disponibilit� du commentaires";
                } else {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Aucun Enregistrement commentaires";
                }

            }).catch((err) => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "�chec de la suppression de la disponibilit� du commentaires";
            })
    }

    else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "�chec de la suppression de la disponibilit� du club";
    }
    res.send(_output);
}



exports.deleteCourse = async function (req, res, next) {
    var _output = new output();
    const CoachId = req.body.CoachId;
    const Id = req.body.Id;
    const course = req.body.course;

    if (CoachId != "" && Id != "" && course == "Stage") {
        await db_library
            .execute("DELETE FROM `course_stage` WHERE Coach_Id=" + CoachId + " AND id = " + Id + "").then(async (value) => {
                if (value.affectedRows > 0) {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Suppression de la disponibilit� du stage";
                } else {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Aucun Enregistrement Trouv�";
                }

            }).catch((err) => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "�chec de la suppression de la disponibilit� du stage";
            })
    }
    else if (CoachId != "" && Id != "" && course == "teambuilding") {
        await db_library
            .execute("DELETE FROM `team_building` WHERE Coach_Id=" + CoachId + " AND id = " + Id + "").then(async (value) => {
                if (value.affectedRows > 0) {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Suppression de la disponibilit� du teambuilding";
                } else {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Aucun Enregistrement Trouv�";
                }

            }).catch((err) => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "�chec de la suppression de la disponibilit� du teambuilding";
            })
    }
    else if (CoachId != "" && Id != "" && course == "animation") {
        await db_library
            .execute("DELETE FROM `animations` WHERE Coach_Id=" + CoachId + " AND id = " + Id + "").then(async (value) => {
                if (value.affectedRows > 0) {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Suppression de la disponibilit� du animation";
                } else {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Aucun Enregistrement Trouv�";
                }

            }).catch((err) => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "�chec de la suppression de la disponibilit� du animation";
            })
    }
    else if (CoachId != "" && Id != "" && course == "tournoi") {
        await db_library
            .execute("DELETE FROM `tournament` WHERE Coach_Id=" + CoachId + " AND id = " + Id + "").then(async (value) => {
                if (value.affectedRows > 0) {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Suppression de la disponibilit� du tournoi";
                } else {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Aucun Enregistrement Trouv�";
                }

            }).catch((err) => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "�chec de la suppression de la disponibilit� du Cours particuliers";
            })
    }
    else if (CoachId != "" && Id != "" && course == "individual") {
        await db_library
            .execute("DELETE FROM `individualcourses` WHERE Coach_Id=" + CoachId + " AND id = " + Id + "").then(async (value) => {
                if (value.affectedRows > 0) {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Suppression de la disponibilit� du Cours particuliers";
                } else {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Aucun Enregistrement Trouv�";
                }

            }).catch((err) => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "�chec de la suppression de la disponibilit� du Cours particuliers";
            })
    }
    else if (CoachId != "" && Id != "" && course == "CoursCollectifOndemand") {
        await db_library
            .execute("DELETE FROM `course_collective_if_demand` WHERE Coach_Id=" + CoachId + " AND Group_Id = " + Id + "").then(async (value) => {
                if (value.affectedRows > 0) {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Suppression de la disponibilit� CoursCollectifOndemand";
                } else {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Aucun Enregistrement CoursCollectifOndemand";
                }

            }).catch((err) => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "�chec de la suppression de la disponibilit� du CoursCollectifOndemand";
            })
    }

    else if (CoachId != "" && Id != "" && course == "coursecollectifclub") {
        await db_library
            .execute("DELETE FROM `couse_collective_if_club` WHERE Coach_Id=" + CoachId + " AND Course_Id = " + Id + "").then(async (value) => {
                if (value.affectedRows > 0) {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Suppression de la disponibilit� coursecollectifclub";
                } else {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Aucun Enregistrement coursecollectifclub";
                }

            }).catch((err) => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "�chec de la suppression de la disponibilit� du coursecollectifclub";
            })

        await db_library
            .execute("DELETE FROM `courseclub_availablity` WHERE CoachId=" + CoachId + " AND Course_Id = " + Id + "").then(async (value) => {
                if (value.affectedRows > 0) {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Suppression de la disponibilit� coursecollectifclub";
                } else {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Aucun Enregistrement coursecollectifclub";
                }

            }).catch((err) => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "�chec de la suppression de la disponibilit� du coursecollectifclub";
            })
    }

    else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "�chec de la suppression de la disponibilit� du coursecollectifclub";
    }
    res.send(_output);
}

exports.deleteClubAvailablity = async function (req, res, next) {
    var _output = new output();
    const CoachId = req.body.CoachId;
    const Id = req.body.Id;

    if (CoachId != "" && Id != "") {
        await db_library
            .execute("DELETE FROM `courseclub_availablity` WHERE CoachId=" + CoachId + " AND Id = " + Id + "").then(async (value) => {
                if (value.affectedRows > 0) {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Suppression de la disponibilit� du club r�ussie";
                } else {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Aucun Enregistrement Trouv�";
                }

            }).catch((err) => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "�chec de la suppression de la disponibilit� du club";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "�chec de la suppression de la disponibilit� du club";
    }
    res.send(_output);
}


exports.getCourseCollectiveClubById = async function (req, res, next) {
    var _output = new output();
    const ids = req.query.coachId;
    const Id = req.query.id;

    if (ids != "" && Id != "") {
        await db_library
            .execute("SELECT c.*,ci.coordonnees_gps FROM `couse_collective_if_club` c INNER JOIN `cities` ci on ci.Code_postal = c.Postalcode WHERE Coach_Id=" + ids + " AND c.Course_Id = " + Id + "").then(async (value) => {
                await db_library.execute("SELECT * FROM `courseclub_availablity` WHERE CoachId = " + ids + " AND Course_Id = " + Id + "").then((res) => {
                    if (value.length > 0 && res.length > 0) {
                        var obj = {
                            course: value,
                            availablity: res
                        }
                        _output.data = obj;
                        _output.isSuccess = true;
                        _output.message = "Cours collectif club obtenir avec succ�s";
                    } else if (value.length > 0 && res.length == 0) {
                        var obj = {
                            course: value,
                            availablity: [{
                                Id: "",
                                CoachId: "",
                                Weekday: "",
                                MaxCount: "",
                                StartTime: "",
                                EndTime: "",
                                Price: "",
                                Course: ""
                            }]
                        }
                        _output.data = obj;
                        _output.isSuccess = true;
                        _output.message = "Cours collectif club obtenir avec succ�s";
                    } else {
                        var obj = {
                            course: [],
                            availablity: []
                        }
                        _output.data = obj;
                        _output.isSuccess = true;
                        _output.message = "Aucun Enregistrement Trouv�";
                    }
                })
            }).catch((err) => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "Cours collectif club �chou�";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Cours collectif club �chou�";
    }
    res.send(_output);
}

exports.getCourseCollectiveClub = async function (req, res, next) {
    var _output = new output();
    const ids = req.query.coachId;
    const UserId = req.query.user_id;
    let makereview = false;
    if(UserId != undefined && UserId != '' && UserId != null){
     var query1 = "SELECT * from booking_dbs where Coach_ID = " + ids + "  AND user_id = " + UserId + " limit 1"
     var review = await db_library
            .execute(query1)
      console.log(review)
      if(review.length > 0){
        makereview = true
      }else{
         makereview = false
      }
    }
      console.log(makereview)

    if (ids != "") {
        await db_library
            .execute("SELECT c.*,c.Club_Name as Eventname,Description as Coach_Description,ci.coordonnees_gps,ci.Libelle_acheminement as Place,ci.Libelle_acheminement as Location  FROM `couse_collective_if_club` c INNER JOIN `cities` ci on ci.Code_postal = c.Postalcode AND  ci.Code_commune_INSEE = c.Coach_Ville WHERE Coach_Id=" + ids + " GROUP BY c.Course_Id").then(async (value) => {
                await db_library.execute("SELECT * FROM `courseclub_availablity` WHERE CoachId = " + ids + "").then((res) => {
                    if (value.length > 0 && res.length > 0) {
                        var obj = {
                            course: value,
                            availablity: res
                        }
                        _output.data = obj;
                        _output.isSuccess = true;
                        _output.message = "Cours collectif club obtenir avec succ�s";
                    } else if (value.length > 0 && res.length == 0) {
                        var obj = {
                            course: value,
                            review : makereview,
                            availablity: [{
                                Id: "",
                                CoachId: "",
                                Weekday: "",
                                MaxCount: "",
                                StartTime: "",
                                EndTime: "",
                                Price: "",
                                Course: ""
                            }]
                        }
                        _output.data = obj;
                        _output.isSuccess = true;
                        _output.message = "Cours collectif club obtenir avec succ�s";
                    } else {
                        var obj = {
                            course: [],
                            review : makereview,
                            availablity: []
                        }
                        _output.data = obj;
                        _output.isSuccess = true;
                        _output.message = "Aucun Enregistrement Trouv�";
                    }
                })
            }).catch((err) => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "Cours collectif club �chou�";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Cours collectif club �chou�";
    }
    res.send(_output);
}


exports.getCourseCollectiveClubByCoachId = async function (req, res, next) {
    var _output = new output();
    const ids = req.query.coachId;

    if (ids != "") {
        var query = "SELECT DISTINCT cd.*,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `couse_collective_if_club` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE = cd.Coach_Ville WHERE cd.Coach_Id=" + ids + "";

        await db_library
            .execute(query).then(async (value) => {
                await db_library.execute("SELECT * FROM `courseclub_availablity` WHERE CoachId = " + ids + "").then((res) => {
                    if (value.length > 0 && res.length > 0) {
                        var obj = {
                            course: value,
                            availablity: res
                        }
                        _output.data = obj;
                        _output.isSuccess = true;
                        _output.message = "Cours collectif club obtenir avec succ�s";
                    } else if (value.length > 0 && res.length == 0) {
                        var obj = {
                            course: value,
                            availablity: [{
                                Id: "",
                                CoachId: "",
                                Weekday: "",
                                MaxCount: "",
                                StartTime: "",
                                EndTime: "",
                                Price: "",
                                Course: ""
                            }]
                        }
                        _output.data = obj;
                        _output.isSuccess = true;
                        _output.message = "Cours collectif club obtenir avec succ�s";
                    } else {
                        var obj = {
                            course: [],
                            availablity: []
                        }
                        _output.data = obj;
                        _output.isSuccess = true;
                        _output.message = "Aucun Enregistrement Trouv�";
                    }
                })
            }).catch((err) => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "Cours collectif club �chou�";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Cours collectif club �chou�";
    }
    res.send(_output);
}

exports.getYear = async function (req, res, next) {
    var _output = new output();

    await db_library
        .execute("SELECT * FROM `courseclub_year`").then(async (value) => {
            if (value.length > 0) {
                var result = value;
                var obj = {
                    year: result
                }
                _output.data = obj;
                _output.isSuccess = true;
                _output.message = "L'ann�e r�ussit";
            } else {
                var obj = {
                    course: []
                }
                _output.data = obj;
                _output.isSuccess = true;
                _output.message = "Aucun Enregistrement Trouv�";
            }
        }).catch((err) => {
            _output.data = err.message;
            _output.isSuccess = false;
            _output.message = "Year get Failed";
        })
    res.send(_output);
}

exports.setStageCourse = async function (req, res, next) {
    var _output = new output();
    const {
        Location,
        Postalcode,
        Coach_Id,
        Description,
        Price,
        Photo,
        from_date,
        to_date,
        Eventname,
        Eventdetails,
        Mode_of_transport,
        Plan,
        filename,
        specialty
    } = req.body;

    if (Coach_Id != "" && Location != "" && Postalcode != "" && Description != "" && Photo != "" && from_date != "" && Mode_of_transport != "" && Plan != "" && to_date != "" && Eventdetails != "" && Eventname != "") {
        var insert_query = "INSERT INTO `course_stage` (`Coach_Id`, `Mode_of_transport`, `Description`, `Price`, `Photo`," +
            " `from_date`, `Plan`,`filename`,`Postalcode`,`Location`,`to_date`,`Eventname`,`Eventdetails`,`specialty`) VALUES " +
            "(?,?,?,?,?,?,?,?,?,?,?,?,?,?);";

        var update_query = "Update `course_stage` set `Mode_of_transport`=?, `Description`=?, `filename`=?, `Price`=?," +
            "`Photo`=?, `from_date`=?, `Plan` =?, `Location` =?, `to_date` =?, `Eventname` =?, `Eventdetails` =?, `specialty` =?, `Postalcode` =? where `Coach_Id` = ?";

        await db_library
            .execute("SELECT * FROM `course_stage` WHERE Coach_Id=" + Coach_Id + "").then(async (value) => {
                if (value.length > 0) {
                    await db_library
                        .parameterexecute(update_query, [Mode_of_transport, Description, filename, Price, Photo, from_date, Plan, Location, to_date, Eventname, Eventdetails, Postalcode, Coach_Id,specialty]).then((value) => {
                            var result = value;
                            _output.data = {};
                            _output.isSuccess = true;
                            _output.message = "Stage mis � jour avec succ�s";

                        }).catch(err => {
                            _output.data = {};
                            _output.isSuccess = false;
                            _output.message = "�chec de la mise � jour du cours par �tapes";
                        });
                } else {
                    await db_library
                        .parameterexecute(insert_query, [Coach_Id, Mode_of_transport, Description, Price, Photo, from_date, Plan, filename, Postalcode, Location, to_date, Eventname, Eventdetails,specialty]).then((value) => {
                            var result = value;
                            _output.data = {};
                            _output.isSuccess = true;
                            _output.message = "Stage course added successfully";
                        }).catch(err => {
                            _output.data = {};
                            _output.isSuccess = false;
                            _output.message = "Stage course added Failed";
                        });
                }
            }).catch(err => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "Erreur lors de l'insertion ou de la mise � jour du cours par �tapes";
            });

    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Stage course added Failed";
    }
    res.send(_output);
    //console.log(output)
}

exports.getStageCourse = async function (req, res, next) {
    var _output = new output();
    const id = req.query.coachId;

    if (id != "") {
        var query = "SELECT DISTINCT cd.*,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `course_stage` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE = cd.Coach_Ville WHERE cd.Coach_Id=" + id + "";
        await db_library
            .execute(query).then(async (value) => {
                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Stage r�ussi";
                } else {
                    var obj = {
                        course: []
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Stage pas trouv�";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "Le stage est �chou�";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Le stage est �chou�";
    }
    res.send(_output);
}

exports.setTournamentCourse = async function (req, res, next) {
    var _output = new output();
    const {
        Location,
        Postalcode,
        Coach_Id,
        Description,
        Price,
        Photo,
        from_date,
        to_date,
        Tournamentname,
        Eventdetails,
        Plan,
        filename
    } = req.body;
    if (Coach_Id != "" && Location != "" && Postalcode != "" && Description != "" && Photo != "" && from_date != ""
        && Plan != "" && to_date != "" && Eventdetails != "" && Tournamentname != "") {
        var insert_query = "INSERT INTO `tournament` (`Coach_Id`, `Description`, `Price`, `Photo`," +
            " `from_date`, `Plan`,`Postalcode`,`Location`,`to_date`,`Tournamentname`,`Eventdetails`,`filename`) VALUES " +
            "(?,?,?,?,?,?,?,?,?,?,?,?);";

        var update_query = "Update `tournament` set `filename`=?, `Description`=?, `Price`=?," +
            "`Photo`=?, `from_date`=?, `Plan` =?, `Location` =?, `to_date` =?, `Tournamentname` =?, `Eventdetails` =?, `Postalcode` =? where `Coach_Id` = ?";
        await db_library
            .execute("SELECT * FROM `tournament` WHERE Coach_Id=" + Coach_Id + "").then(async (value) => {
                if (value.length > 0) {
                    await db_library
                        .parameterexecute(update_query, [filename, Description, "0", Photo, from_date, Plan, Location, to_date, Tournamentname, Eventdetails, Postalcode, Coach_Id]).then((value) => {
                            var result = value;
                            _output.data = {};
                            _output.isSuccess = true;
                            _output.message = "Le parcours du tournoi a �t� mis � jour avec succ�s";
                        }).catch(err => {
                            _output.data = {};
                            _output.isSuccess = false;
                            _output.message = "�chec de la mise � jour du parcours du tournoi";
                        });
                } else {
                    await db_library
                        .parameterexecute(insert_query, [Coach_Id, Description, "0", Photo, from_date, Plan, Postalcode, Location, to_date, Tournamentname, Eventdetails, filename]).then((value) => {
                            var result = value;
                            _output.data = {};
                            _output.isSuccess = true;
                            _output.message = "Le tournoi a �t� ajout� avec succ�s";
                        }).catch(err => {
                            _output.data = {};
                            _output.isSuccess = false;
                            _output.message = "Le parcours du tournoi ajout� a �chou�";
                        });
                }
            }).catch(err => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "Erreur lors de l'insertion ou de la mise � jour du parcours du tournoi";
            });
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Le parcours du tournoi ajout� a �chou�";
    }
    res.send(_output);
}


exports.getTeambuildingLeftMenu = async function (req, res, next) {
    var _output = new output();
    const id = req.query.coachId;

    if (id != "") {
        var query = "SELECT DISTINCT cd.*,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `team_building` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE = cd.Coach_Ville WHERE cd.Coach_Id=" + id + " GROUP BY cd.id";
        await db_library
            .execute(query).then(async (value) => {
                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Le parcours du team building r�ussit";
                } else {
                    var obj = {
                        course: []
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Parcours du team building introuvable";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "Le parcours du team building a �chou�";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Le parcours du team building a �chou�";
    }
    res.send(_output);
}

exports.getCourseCollectionLeftMenu = async function (req, res, next) {
    var _output = new output();
    const id = req.query.coachId;

    if (id != "") {
        var query = "SELECT cd.*,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `course_collective_if_demand` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE = cd.Coach_Ville WHERE cd.Coach_Id=" + id + " GROUP BY cd.Group_Id";
        await db_library
            .execute(query).then(async (value) => {
                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Le parcours du course collective demand r�ussit";
                } else {
                    var obj = {
                        course: []
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Parcours du course collective demand introuvable";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "Le parcours du course collective demand a �chou�";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Le parcours du course collective demand a �chou�";
    }
    res.send(_output);
}

exports.getCourseOnClubLeftMenu = async function (req, res, next) {
    var _output = new output();
    const id = req.query.coachId;

    if (id != "") {
        var query = "SELECT cd.*,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `couse_collective_if_club` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE = cd.Coach_Ville WHERE cd.Coach_Id=" + id + " GROUP BY cd.Course_Id";
        await db_library
            .execute(query).then(async (value) => {
                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Le parcours du course collective if club r�ussit";
                } else {
                    var obj = {
                        course: []
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Parcours du course collectiveif club introuvable";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "Le parcours du course collectiveif club a �chou�";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Le parcours du course collectiveif club a �chou�";
    }
    res.send(_output);
}

exports.getIndividualCourseLeftMenu = async function (req, res, next) {
    var _output = new output();
    const id = req.query.coachId;

    if (id != "") {
        var query = "SELECT cd.*,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `individualcourses` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE = cd.Coach_Ville WHERE cd.Coach_Id=" + id + " GROUP BY cd.id ";
        await db_library
            .execute(query).then(async (value) => {
                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Le parcours du tournoi r�ussit";
                } else {
                    var obj = {
                        course: []
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Parcours du tournoi introuvable";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "Le parcours du tournoi a �chou�";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Le parcours du tournoi a �chou�";
    }
    res.send(_output);
}

exports.getTournamentCourse = async function (req, res, next) {
    var _output = new output();
    const id = req.query.coachId;
    if (id != "") {
        var query = "SELECT DISTINCT  cd.*,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `tournament` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE = cd.Coach_Ville WHERE cd.Coach_Id=" + id + "";
        await db_library
            .execute(query).then(async (value) => {
                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Le parcours du tournoi r�ussit";
                } else {
                    var obj = {
                        course: []
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Parcours du tournoi introuvable";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "Le parcours du tournoi a �chou�";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Le parcours du tournoi a �chou�";
    }
    res.send(_output);
}

// New Code Start
exports.getStage = async function (req, res, next) {
    var _output = new output();
    const Coach_id = req.query.coachId;
    const id = req.query.id;

    if (id != "" && Coach_id != "") {
        var query = "select users.*,course_stage.*,cities.Libelle_acheminement as Location from course_stage JOIN users ON  course_stage.Coach_Id = users.id JOIN cities ON  users.cityId = cities.Code_commune_INSEE  where course_stage.Coach_Id = " + Coach_id + " AND course_stage.id = " + id + "";
        await db_library
            .execute(query).then(async (value) => {

                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Stage r�ussi";
                } else {
                    var obj = {
                        course: []
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Stage pas trouv�";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "Le stage est �chou�";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Le stage est �chou�";
    }
    res.send(_output);
}

exports.setStageCourseUpdate = async function (req, res, next) {
    var _output = new output();
    const {
        id,
        Coach_Ville,
        Postalcode,
        Coach_Id,
        Description,
        Price,
        Photo,
        from_date,
        to_date,
        Eventname,
        Eventdetails,
        Mode_of_transport,
        Plan,
        filename,
        address,
        specialty
    } = req.body;

    if (id != "" && Coach_Id != "" && Coach_Ville != "" && Postalcode != "" && Description != "" && Price != "" && Photo != "" && from_date != "" && Mode_of_transport != "" && Plan != "" && to_date != "" && Eventdetails != "" && Eventname != "") {


        var update_query = "Update `course_stage` set `Mode_of_transport`=?, `Description`=?, `filename`=?, `Price`=?, `Photo`=?, `from_date`=?, `Plan` =?, `Coach_Ville` =?, `to_date` =?, `Eventname` =?, `Eventdetails` =?, `Postalcode` =?, `specialty` =?, `address` =?  where `id`=?";

        await db_library
            .parameterexecute(update_query, [Mode_of_transport, Description, filename, Price, Photo, formatDate(from_date), Plan, Coach_Ville, formatDate(to_date), Eventname, Eventdetails, Postalcode,specialty,address,id]).then((value) => {
                var result = value;
                _output.data = {};
                _output.isSuccess = true;
                _output.message = "Stage mis � jour avec succ�s";

            }).catch(err => {
                _output.data = {};
                _output.isSuccess = false;
                _output.message = "�chec de la mise � jour du cours par �tapes";
            });

        res.send(_output);
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "�chec de la mise � jour du cours par �tapes";
    }
}

exports.setStageCourseInsert = async function (req, res, next) {
    var _output = new output();
    const {
        Coach_Ville,
        Postalcode,
        Coach_Id,
        Description,
        Price,
        Photo,
        from_date,
        to_date,
        Eventname,
        Eventdetails,
        Mode_of_transport,
        Plan,
        filename,
        address,
        specialty
    } = req.body;

    if (Coach_Id != "" && Coach_Ville != "" && Postalcode != "" && Description != "" && Price != "" && Photo != "" && from_date != "" && Mode_of_transport != "" && Plan != "" && to_date != "" && Eventdetails != "" && Eventname != "") {

        var insert_query = "INSERT INTO `course_stage` (`Coach_Id`, `Mode_of_transport`, `Description`, `Price`, `Photo`,`from_date`, `Plan`,`filename`,`Postalcode`,`Coach_Ville`,`to_date`,`Eventname`,`Eventdetails`,`address`,`specialty`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
        
        await db_library
            .parameterexecute(insert_query, [Coach_Id, Mode_of_transport, Description, Price, Photo, formatDate(from_date), Plan, filename, Postalcode, Coach_Ville, formatDate(to_date), Eventname, Eventdetails,address,specialty]).then((value) => {
                var result = value;
                _output.data = {result};
                _output.isSuccess = true;
                _output.message = "Le stage a �t� ajout� avec succ�s";
            }).catch(err => {
                _output.data = {err};
                _output.isSuccess = false;
                _output.message = "Le stage ajout� a �chou�";
            });

        res.send(_output);
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Le stage ajout� a �chou�";
        res.send(_output);
    }
}

exports.setTournamentCourseUpdate = async function (req, res, next) {
    var _output = new output();
    const {
        id,
        Coach_Ville,
        Postalcode,
        Mode_of_transport,
        Coach_Id,
        Description,
        Price,
        Photo,
        from_date,
        to_date,
        Tournamentname,
        Eventdetails,
        Plan,
        filename,
        address
    } = req.body;
    if (id != "" && Coach_Id != "" && Coach_Ville != "" && Postalcode != "" && Description != "" && Photo != "" && from_date != "" && Plan != "" && to_date != "" && Eventdetails != "" && Tournamentname != "") {


        var update_query = "Update `tournament` set `filename`=?, `Description`=?, `Price`=?," +
            "`Photo`=?, `from_date`=?, `Plan` =?, `Coach_Ville` =?, `to_date` =?, `Tournamentname` =?, `Eventdetails` =?, `Postalcode` =?, `Mode_of_transport` =?, `address` =? where `Coach_Id` = ? AND `id`=?";

        await db_library
            .execute("SELECT * FROM `tournament` WHERE Coach_Id=" + Coach_Id + " AND id=" + id + "").then(async (value) => {
                if (value.length > 0) {
                    await db_library
                        .parameterexecute(update_query, [filename, Description, Price, Photo, from_date, Plan, Coach_Ville, to_date, Tournamentname, Eventdetails, Postalcode, Mode_of_transport,address,Coach_Id, id]).then((value) => {
                            var result = value;
                            _output.data = {};
                            _output.isSuccess = true;
                            _output.message = "Le parcours du tournoi a �t� mis � jour avec succ�s";
                        }).catch(err => {
                            //console.log(err);
                            _output.data = {};
                            _output.isSuccess = false;
                            _output.message = "�chec de la mise � jour du parcours du tournoi";
                        });
                }

            }).catch(err => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "Erreur lors de l'insertion ou de la mise � jour du parcours du tournoi";
            });
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "�chec de la mise � jour du parcours du tournoi";
    }
    res.send(_output);
}


exports.setTournamentCourseInsert = async function (req, res, next) {
    var _output = new output();
    const {
        Coach_Ville,
        Postalcode,
        Mode_of_transport,
        Coach_Id,
        Description,
        Price,
        Photo,
        from_date,
        to_date,
        Tournamentname,
        Eventdetails,
        Plan,
        filename,
        address
    } = req.body;

    if (Coach_Id != "" && Coach_Ville != "" && Postalcode != "" && Description != "" && Photo != "" && from_date != ""
        && Plan != "" && to_date != "" && Eventdetails != "" && Tournamentname != "") {
        var insert_query = "INSERT INTO `tournament` (`Coach_Id`, `Description`, `Price`, `Photo`,`from_date`, `Plan`,`Postalcode`, `Mode_of_transport`, `Coach_Ville`,`to_date`,`Tournamentname`,`Eventdetails`,`filename`,`address`) VALUES " +
            "(?,?,?,?,?,?,?,?,?,?,?,?,?,?);";

        await db_library
            .parameterexecute(insert_query, [Coach_Id, Description, Price, Photo, from_date, Plan, Postalcode, Mode_of_transport, Coach_Ville, to_date, Tournamentname, Eventdetails, filename,address]).then((value) => {
                var result = value;
                _output.data = {};
                _output.isSuccess = true;
                _output.message = "Le tournoi a �t� ajout� avec succ�s";
            }).catch(err => {
                _output.data = {err};
                _output.isSuccess = false;
                _output.message = "Tournament course added failed";
            });

    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Tournament course added failed";
    }
    res.send(_output);
}


exports.getTournament = async function (req, res, next) {
    var _output = new output();
    const Coach_id = req.query.coachId;
    const id = req.query.id;
    if (id != "" && Coach_id != "") {
        var query = "select users.*,tournament.* from tournament JOIN users ON  tournament.Coach_Id = users.id where tournament.Coach_Id = " + Coach_id + " AND tournament.id = " + id + "";
        await db_library
            .execute(query).then(async (value) => {
                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Le parcours du tournoi r�ussit";
                } else {
                    var obj = {
                        course: []
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Parcours du tournoi introuvable";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "Le parcours du tournoi a �chou�";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Le parcours du tournoi a �chou�";
    }
    res.send(_output);
}

exports.setAnimationInsert = async function (req, res, next) {
    var _output = new output();
    const {
        Mode_of_transport,
        animations_name,
        Coach_Ville,
        Postalcode,
        Coach_Id,
        Description,
        Photo,
        Eventdetails,
        Plan,
        filename,
        address
    } = req.body;


    if (Coach_Id != "" && Coach_Ville != "" && Postalcode != "" && Description != "" && Photo != "" && Plan != "" && Eventdetails != "") {
        var insert_query = "INSERT INTO `animations` (`Mode_of_transport`, `animations_name`, `Coach_Id`, `Description`, `Photo`," +
            "`Plan`,`Postalcode`,`Coach_Ville`,`Eventdetails`,`filename`,`address`) VALUES " +
            "(?,?,?,?,?,?,?,?,?,?,?);";
        await db_library
            .parameterexecute(insert_query, [Mode_of_transport, animations_name, Coach_Id, Description, Photo, Plan, Postalcode, Coach_Ville, Eventdetails, filename,address]).then((value) => {
                var result = value;
                _output.data = {};
                _output.isSuccess = true;
                _output.message = "Cours d'animation ajout� avec succ�s";
            }).catch(err => {
                _output.data = {err};
                _output.isSuccess = false;
                _output.message = "�chec du cours d'animation ajout�";
            });

        res.send(_output);
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "�chec du cours d'animation ajout�";
    }
}

exports.setAnimationUpdate = async function (req, res, next) {
    var _output = new output();
    const {
        Mode_of_transport,
        animations_name,
        Coach_Ville,
        Postalcode,
        Coach_Id,
        Description,
        Photo,
        Eventdetails,
        Plan,
        filename,
        id,
        address
    } = req.body;

    if (Coach_Id != "" && Coach_Ville != "" && Postalcode != "" && Description != "" && Photo != "" && Plan != "" && Eventdetails != "") {

        var update_query = "Update `animations` set `Mode_of_transport`=?, `animations_name`=?, `Description`=?, `filename`=?," +
            "`Photo`=?, `Plan` =?, `Coach_Ville` =?, `Eventdetails` =?, `Postalcode` =?, `address` =? where `Coach_Id` =? AND `id`=?";
        await db_library
            .parameterexecute(update_query, [Mode_of_transport, animations_name, Description, filename, Photo, Plan, Coach_Ville, Eventdetails, Postalcode, address, Coach_Id, id]).then((value) => {
                var result = value;
                _output.data = {};
                _output.isSuccess = true;
                _output.message = "Cours d'animation mis � jour avec succ�s";

            }).catch(err => {
                _output.data = {};
                _output.isSuccess = false;
                _output.message = "�chec de la mise � jour du cours d'animation";
            });

        res.send(_output);
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "�chec du cours d'animation ajout�";
    }
}

/**
 * New Code End
 */

exports.setAnimationCourse = async function (req, res, next) {
    var _output = new output();
    const {
        Location,
        Postalcode,
        Coach_Id,
        Description,
        Photo,
        Eventdetails,
        Plan,
        Price,
        filename
    } = req.body;

    if (Coach_Id != "" && Location != "" && Postalcode != "" && Description != "" && Photo != "" && Plan != "" && Eventdetails != "") {
        var insert_query = "INSERT INTO `animations` (`Coach_Id`, `Description`, `Photo`," +
            "`Plan`,`Postalcode`,`Location`,`Eventdetails`,`filename`,`Price`) VALUES " +
            "(?,?,?,?,?,?,?,?,?);";

        var update_query = "Update `animations` set `Description`=?, `filename`=?," +
            "`Photo`=?, `Plan` =?, `Location` =?, `Eventdetails` =?, `Postalcode` =?, `Price` =? where `Coach_Id` =?";

        await db_library
            .execute("SELECT * FROM `animations` WHERE Coach_Id=" + Coach_Id + "").then(async (value) => {
                if (value.length > 0) {
                    await db_library
                        .parameterexecute(update_query, [Description, filename, Photo, Plan, Location, Eventdetails, Postalcode, "0", Coach_Id]).then((value) => {
                            var result = value;
                            _output.data = {};
                            _output.isSuccess = true;
                            _output.message = "Cours d'animation mis � jour avec succ�s";

                        }).catch(err => {
                            _output.data = {};
                            _output.isSuccess = false;
                            _output.message = "�chec de la mise � jour du cours d'animation";
                        });
                } else {
                    await db_library
                        .parameterexecute(insert_query, [Coach_Id, Description, Photo, Plan, Postalcode, Location, Eventdetails, filename, "0"]).then((value) => {
                            var result = value;
                            _output.data = {};
                            _output.isSuccess = true;
                            _output.message = "Cours d'animation ajout� avec succ�s";
                        }).catch(err => {
                            _output.data = {};
                            _output.isSuccess = false;
                            _output.message = "�chec du cours d'animation ajout�";
                        });
                }
            }).catch(err => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "Erreur lors de l'insertion ou de la mise � jour du cours d'animation";
            });

    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "�chec du cours d'animation ajout�";
    }
    res.send(_output);
}

exports.getAnimationCourseLeft = async function (req, res, next) {
    var _output = new output();
    const coachId = req.query.coachId;
    var query = "SELECT DISTINCT cd.*,ci.coordonnees_gps,ci.Libelle_acheminement as cityname FROM `animations` cd INNER JOIN `cities` ci on ci.Code_postal = cd.Postalcode AND ci.Code_commune_INSEE = cd.Coach_Ville WHERE cd.Coach_Id=" + coachId + " GROUP BY cd.id";
    await db_library
        .execute(query).then(async (value) => {
            var result = value;
            if (value.length > 0) {
                var obj = {
                    course: result
                }
                _output.data = obj;
                _output.isSuccess = true;
                _output.message = "Le cours d'animation r�ussit";
            } else {
                var obj = {
                    course: []
                }
                _output.data = obj;
                _output.isSuccess = true;
                _output.message = "Cours d'animation introuvable";
            }
        }).catch((err) => {
            _output.data = "";
            _output.isSuccess = false;
            _output.message = "Cours d'animation introuvable";
        })
    res.send(_output);
}

exports.getAnimationCourse = async function (req, res, next) {
    var _output = new output();
    const coachId = req.query.coachId;
    const id = req.query.id;

    if (id != "") {
        var query = "select * from animations where `Coach_Id` = " + coachId + " AND `id` = " + id;
        await db_library
            .execute(query).then(async (value) => {
                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Cours d'animation r�ussi";
                } else {
                    var obj = {
                        course: []
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Cours d'animation introuvable";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "Cours d'animation introuvable";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Cours d'animation introuvable";
    }
    res.send(_output);
}

exports.getAnimation = async function (req, res, next) {
    var _output = new output();
    const Coach_id = req.query.coachId;
    const id = req.query.animation_id;
    if (id != "" && Coach_id != "") {
        var query = "select animations.*,users.* from animations JOIN users ON  animations.Coach_Id = users.id where animations.Coach_Id = " + Coach_id + " AND animations.id = " + id + "";
        await db_library
            .execute(query).then(async (value) => {
                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Le cours d'animation r�ussit";
                } else {
                    var obj = {
                        course: []
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Cours d'animation introuvable";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "Cours d'animation introuvable";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "Cours d'animation introuvable";
    }
    res.send(_output);
}


exports.TeambuildingCourseInsert = async function (req, res, next) {
    var _output = new output();
    const {
        Coach_Id,
        Eventname,
        Description,
        Photo,
        Eventdetails,
        Mode_of_transport,
        Plan,
        Coach_Ville,
        Postalcode,
        filename,
        address
    } = req.body;

    if (Coach_Id != "" && Description != "" && Mode_of_transport != "" && Plan != "" && Eventdetails != "" && Eventname != "") {
        var insert_query = "INSERT INTO `team_building` (`Eventname`, `Description`, `Mode_of_transport`, `Eventdetails`, `Photo`, `filename`,`Plan`, `Coach_Ville`, `Postalcode`,`Coach_Id`,`address`) VALUES (?,?,?,?,?,?,?,?,?,?,?);";

        await db_library
            .parameterexecute(insert_query, [Eventname, Description, Mode_of_transport, Eventdetails, Photo, filename, Plan, Coach_Ville, Postalcode, Coach_Id,address]).then((value) => {
                var result = value;
                _output.data = {};
                _output.isSuccess = true;
                _output.message = "Le cours Team Building a �t� ajout� avec succ�s";
            }).catch(err => {
                _output.data = {err};
                _output.isSuccess = false;
                _output.message = "�chec du cours de Team Building ajout�";
            });

    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "�chec du cours de Team Building ajout�";
    }
    res.send(_output);

}

exports.setTeambuildingCourse = async function (req, res, next) {
    var _output = new output();
    const {
        id,
        Coach_Id,
        Eventname,
        Description,
        Photo,
        Eventdetails,
        Mode_of_transport,
        Plan,
        Coach_Ville,
        Postalcode,
        filename,
        address
    } = req.body;

    if (Coach_Id != "" && Description != "" && Mode_of_transport != "" && Plan != "" && Eventdetails != "" && Eventname != "") {


        var update_query = "Update `team_building` set `Eventname`=?, `Description`=?, `Mode_of_transport`=?, `Eventdetails`=?, `Photo` =?, `filename` =?, `Plan` =?, `Coach_Ville` =?, `Postalcode` =?, `address` =? where `Coach_Id` = ? AND `id`=?";

        await db_library
            .execute("SELECT * FROM `team_building` WHERE Coach_Id=" + Coach_Id + " AND id=" + id + "").then(async (value) => {
                if (value.length > 0) {
                    await db_library
                        .parameterexecute(update_query, [Eventname, Description, Mode_of_transport, Eventdetails, Photo, filename, Plan, Coach_Ville, Postalcode,address, Coach_Id, id]).then((value) => {
                            var result = value;
                            _output.data = {};
                            _output.isSuccess = true;
                            _output.message = "Le cours de consolidation d'�quipe mis � jour avec succ�s";

                        }).catch(err => {
                            //console.log(err.message)
                            _output.data = {};
                            _output.isSuccess = false;
                            _output.message = "�chec de la mise � jour du cours Team Building";
                        });
                } else {
                    await db_library
                        .parameterexecute(insert_query, [team_building_name, Description, Mode_of_transport, Eventdetails, "0", Photo, filename, Plan, Coach_Ville, Postalcode, Coach_Id]).then((value) => {
                            var result = value;
                            _output.data = {};
                            _output.isSuccess = true;
                            _output.message = "Le cours Team Building a �t� ajout� avec succ�s";
                        }).catch(err => {
                            _output.data = {};
                            _output.isSuccess = false;
                            _output.message = "�chec du cours de Team Building ajout�";
                        });
                }
            }).catch(err => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "Erreur lors de l'insertion ou de la mise � jour du cours Team Building";
            });
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "�chec du cours de Team Building ajout�";
    }
    res.send(_output);

}

exports.getTeambuildingCourse = async function (req, res, next) {
    var _output = new output();
    const id = req.query.coachId;

    if (id != "") {
        var query = "select * from team_building where Coach_Id = " + id;
        await db_library
            .execute(query).then(async (value) => {
                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Le cours Team Building r�ussit";
                } else {
                    var obj = {
                        course: []
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Team Building introuvable";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "�chec du cours de Team Building ajout�";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "�chec du cours de Team Building ajout�";
    }
    res.send(_output);
}

exports.getteambuilding = async function (req, res, next) {
    var _output = new output();
    const Coach_id = req.query.coachId;
    const id = req.query.id;

    if (id != "" && Coach_id != "") {
        var query = "select users.*,team_building.*,team_building.id as team_building_id,team_building.Coach_Ville eventCoach_Ville from team_building JOIN users ON  team_building.Coach_Id = users.id where team_building.Coach_Id = " + Coach_id + " AND team_building.id = " + id + "";
     
        await db_library
            .execute(query).then(async (value) => {
                var result = value;
                if (value.length > 0) {
                    var obj = {
                        course: result
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Le cours Team Building r�ussit";
                } else {
                    var obj = {
                        course: []
                    }
                    _output.data = obj;
                    _output.isSuccess = true;
                    _output.message = "Team Building introuvable";
                }
            }).catch((err) => {
                _output.data = "";
                _output.isSuccess = false;
                _output.message = "�chec du cours de Team Building ajout�";
            })
    } else {
        _output.data = "Le champ obligatoire est manquant";
        _output.isSuccess = false;
        _output.message = "�chec du cours de Team Building ajout�";
    }
    res.send(_output);
}

exports.getcourse = async function (req, res, next) {
    var _output = new output();

    var query = "select * from course_dbs";

    await db_library
        .execute(query).then(async (value) => {
            var result = value;
            if (value.length > 0) {
                var obj = {
                    course: result
                }
                _output.data = obj;
                _output.isSuccess = true;
                _output.message = "Le cours r�ussit";
            } else {
                var obj = {
                    course: []
                }
                _output.data = obj;
                _output.isSuccess = true;
                _output.message = "Le cours est introuvable";
            }
        }).catch((err) => {
            _output.data = "";
            _output.isSuccess = false;
            _output.message = "Le cours n'a pas �chou�";
        })
    res.send(_output);
}

async function getIsIndividual(coach_id) {
    try {
        const Query =
            "select id from `individualcourses` where Coach_Id = " + coach_id;
        return await db_library.execute(Query).then(async data => {
            return data.length;
        });
    } catch (error) {
        return error;
    }
}

async function getIsOnDemand(coach_id) {
    try {
        const Query =
            "select `Group_Id` from `course_collective_if_demand` where Coach_Id = " + coach_id;
        return await db_library.execute(Query).then(async data => {
            return data.length;
        });
    } catch (error) {
        return error;
    }
}

async function getIsClub(coach_id) {
    try {
        const Query =
            "select `Course_Id` from `couse_collective_if_club` where Coach_Id = " + coach_id;
        return await db_library.execute(Query).then(async data => {
            return data.length;
        });
    } catch (error) {
        return error;
    }
}

exports.courseIsIndivIsOnDemandIsClub = async function (req, res, next) {
    var _output = new output();
    var obj = {}
    const id = req.query.coachId;
    var indivCount = await getIsIndividual(id);
    var onDemandCount = await getIsOnDemand(id);
    var clubCount = await getIsClub(id);
    obj = {
        indivCount: indivCount,
        onDemandCount: onDemandCount,
        clubCount: clubCount
    }
    _output.data = obj;
    _output.isSuccess = true;
    _output.message = "Le cours est introuvable";
    res.send(_output);
}

function formatDate(date) {
    var formate_date = moment(date).format('YYYY-MM-DD');
    return formate_date;
}
