"use strict";
const express = require("express");
const router = express.Router(); 
const cityController = require("../controller/cities");

router.get("/city/getcityName", cityController.citiesbyrayon);
router.get("/city/:postalcode", cityController.getCitynameForPostalCode);
router.get("/city/cityTable", cityController.cityTable);
router.get("/city/getcitybyID/:id", cityController.getCityID);
router.get("/city/getcityPostal/:name", cityController.getCityPostal );
router.get("/city/postalcodesbyrayon/:rayon", cityController.postalcodesbyrayon );
module.exports = router;
