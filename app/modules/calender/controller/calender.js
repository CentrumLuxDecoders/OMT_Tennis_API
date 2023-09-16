const output = require("../../_models/output");
const db_library = require("../../_helpers/db_library");
const moment = require("moment");

exports.getCalendar = async function(req, res, next) {
  var _output = new output();
  const Coach_ID = req.query.Coach_ID;
// console.log(Coach_ID)
  if (Coach_ID != "") {
    //var query = "select * from availability_dbs where Coach_id = (SELECT u.id from users u inner join coaches_dbs c on u.email=c.Coach_Email where c.Coach_ID = " + Coach_ID + ")"
    var query="SELECT *,Hour as title,Date as start,";
    query+=" CASE";
    query+=" WHEN Status='Y' THEN Hour";
    query+=" WHEN Status='R' THEN Hour";
    query+=" WHEN Status='A' THEN Hour";
    query+=" ELSE ''"
    query+=" END AS title,";

    query+=" CASE";
    query+=" WHEN Status='Y' THEN Date";
    query+=" WHEN Status='R' THEN Date";
    query+=" WHEN Status='A' THEN Date";
    query+=" ELSE ''"
    query+=" END AS start,";


    query+=" CASE";
    query+=" WHEN Status='Y' THEN 'green'";
    query+=" WHEN Status='R' THEN '#e75b00'";
    query+=" WHEN Status='A' THEN 'red'";
    query+=" ELSE ''"
    query+=" END AS backgroundColor";
    query+=" FROM `avaiablity` WHERE `CoachId` = " + Coach_ID;
// console.log(query);
    await db_library
      .execute(query)
      .then(async value => {
        var obj = {
          calender: value
        };
        _output.data = obj;
        _output.isSuccess = true;
        _output.message = "Calendrier avec succ�s";
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "�chec du calendrier";
      });
  } else {
    _output.data = "Le champ obligatoire est manquant";
    _output.isSuccess = false;
    _output.message = "�chec du calendrier";
  }
  res.send(_output);
};

exports.getCalendarMobile = async function(req, res, next) {
  var _output = new output();
  const Coach_ID = req.query.Coach_ID;

  if (Coach_ID != "") {
    //var query = "select * from availability_dbs where Coach_id = (SELECT u.id from users u inner join coaches_dbs c on u.email=c.Coach_Email where c.Coach_ID = " + Coach_ID + ")"

    await db_library
      .execute("call proc_get_calendar_mobile(" + Coach_ID + ")")
      .then(async value => {
        var obj = {
          calender: value[0]
        };
        _output.data = obj;
        _output.isSuccess = true;
        _output.message = "Calendrier avec succès";
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Échec du calendrier";
      });
  } else {
    _output.data = "Le champ obligatoire est manquant";
    _output.isSuccess = false;
    _output.message = "Échec du calendrier";
  }
  res.send(_output);
};
exports.deleteslot = async function (req, res, next) {
    var _output = new output();
    const CoachId = req.body.CoachId;
    const Id = req.body.Id;
    if (CoachId != "" && Id != "") {
        await db_library
            .execute("DELETE FROM `avaiablity` WHERE CoachId=" + CoachId + " AND Id = " + Id + "").then(async (value) => {
                if (value.affectedRows > 0) {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Suppression de la disponibilit�";
                } else {
                    _output.data = {};
                    _output.isSuccess = true;
                    _output.message = "Aucun Enregistrement Trouvé";
                }
            }).catch((err) => {
                _output.data = err.message;
                _output.isSuccess = false;
                _output.message = "�chec de la suppression de la disponibilit�";
            })
    }else{
		_output.data = "";
                _output.isSuccess = false;
                _output.message = "�chec de la suppression de la disponibilit�";

	}
 res.send(_output);
};
