"use strict";
const express = require("express");
const router = express.Router();

//importing the controller
const courseController = require("../controller/course");

router.post(
  "/course/setindividualcourse",
  courseController.insertIndividualCourse
);
router.get("/course/getindividualcourseleftmenu", courseController.getIndividualCourseLeftMenu);
router.get("/course/getcoursecollectionleftmenu", courseController.getCourseCollectionLeftMenu);
router.get("/course/getcourseonclubleftmenu", courseController.getCourseOnClubLeftMenu);

router.get(
  "/course/getindividualcourses/:coachId",
  courseController.getIndividualCourses
);

router.post(
  "/course/setcousecollectivedemanad",
  courseController.setcouseCollectiveDemanad
);
router.post(
  "/course/setcousecollectivedemanadinsert",
  courseController.setcouseCollectiveDemanadInsert
);
router.get(
  "/course/getcousecollectivedemanad",
  courseController.getcouseCollectiveDemanad
);
router.get(
  "/course/getcousecollectivedemanadbycoachid",
  courseController.getcouseCollectiveDemanadByCoachId
);
router.get(
  "/course/getcouseCollectiveDemanadbyid",
  courseController.getcouseCollectiveDemanadById
);
router.get("/course/getcoachbyid", courseController.getCoachById);

//Stage
router.get("/course/getstage", courseController.getStage);
router.get("/course/getstagecourse", courseController.getStageCourse);
router.post("/course/setstagecourse", courseController.setStageCourse);
router.post(
  "/course/setstagecourseinsert",
  courseController.setStageCourseInsert
);
router.post(
  "/course/setstagecourseupdate",
  courseController.setStageCourseUpdate
);

router.post("/course/deletecourse",courseController.deleteCourse);
router.post("/course/deletecommentaires",courseController.deleteCommentaires);
router.post("/course/deletecommentairesbyuser",courseController.deleteCommentairesbyuser);

// Tournament
router.post(
  "/course/settournamentcourse",
  courseController.setTournamentCourse
);
router.post(
  "/course/setTournamentCourseInsert",
  courseController.setTournamentCourseInsert
);
router.post(
  "/course/setTournamentCourseUpdate",
  courseController.setTournamentCourseUpdate
);

router.get("/course/gettournament", courseController.getTournament);
router.get("/course/gettournamentcourse", courseController.getTournamentCourse);
// Individual
router.get("/course/getindividualcourse", courseController.getIndividualCourse);

router.get("/course/getindividualcoursebycoachId", courseController.getIndividualCourseByCoachId);
router.get("/course/getindividualcoursebyid", courseController.getIndividualCourseById);

router.post(
  "/course/setindividualcourseinsert",
  courseController.setIndividualCourseInsert
);
// Animation
router.post("/course/setanimationcourse", courseController.setAnimationCourse);
router.post("/course/setanimationinsert", courseController.setAnimationInsert);
router.post("/course/setanimationupdate", courseController.setAnimationUpdate);
router.get("/course/getanimationcourse", courseController.getAnimationCourse);
router.get(
  "/course/getAnimationCourseLeft",
  courseController.getAnimationCourseLeft
);
router.get("/course/getanimation", courseController.getAnimation);
router.get("/course/getteambuilding", courseController.getteambuilding);

// Team building
router.get("/course/getteambuildingleftmenu", courseController.getTeambuildingLeftMenu);
router.post(
  "/course/setteambuildingcourse",
  courseController.setTeambuildingCourse
);
router.post(
  "/course/teambuildingcourseinsert",
  courseController.TeambuildingCourseInsert
);
router.get(
  "/course/getteambuildingcourse",
  courseController.getTeambuildingCourse
);
router.post(
  "/course/setcousecollectiveclub",
  courseController.setCourseCollectiveClub
);
router.post(
  "/course/insertcousecollectiveclub",
  courseController.insertCourseCollectiveClub
);
router.post(
  "/course/updatecousecollectiveclub",
  courseController.updateCourseCollectiveClub
);

router.post(
  "/course/deleteclubavailablity",
  courseController.deleteClubAvailablity
);
router.get(
  "/course/getcousecollectiveclub",
  courseController.getCourseCollectiveClub
);

router.get(
  "/course/getcousecollectiveclubbycoachid",
  courseController.getCourseCollectiveClubByCoachId
);
router.get(
  "/course/getcousecollectiveclubbyid",
  courseController.getCourseCollectiveClubById
);
router.get("/course/getcourseyear", courseController.getYear);

router.get("/course/getcourse", courseController.getcourse);

router.get(
  "/course/courseIsIndivIsOnDemandIsClub",
  courseController.courseIsIndivIsOnDemandIsClub
);

// router.get("/course/searchByEventList", courseController.searchByEventList);

module.exports = router;
