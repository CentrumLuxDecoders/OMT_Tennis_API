"use strict";
const express = require("express");
const router = express.Router();
const uploadfile = require("../../_helpers/uploadFile");

const calenderController = require("../controller/calender");

router.get("/getcalender", calenderController.getCalendar);
router.get("/getcalendermobile", calenderController.getCalendarMobile);

router.post("/calender/deleteslot", calenderController.deleteslot);

module.exports = router;
