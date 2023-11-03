ALTER TABLE `db_tennis`.`couse_collective_if_club` 
CHANGE COLUMN `Coach_Id` `Coach_Id` INT NOT NULL ;


ALTER TABLE `db_tennis`.`booking_dbs` 
ADD COLUMN `token` VARCHAR(255) NULL DEFAULT NULL AFTER `Remarks`;


ALTER TABLE `db_tennis`.`service` 
CHANGE COLUMN `updated_at` `updated_at` DATETIME NULL DEFAULT NULL ;


INSERT INTO `service` VALUES (1,'CoursCollectifOndemand',21,15,150,15,'2020-01-03 13:15:42','2020-01-03 14:32:52'),
(2,'CoursIndividuel',20,10,100,5,'2020-01-03 14:32:23', NOW()), -- Use NOW() for the current timestamp
(3,'CoursCollectifClub',22,0,0,0,'2020-01-03 14:33:12','2020-01-03 14:34:14'),
(4,'Stage',23,0,0,0,'2020-01-03 14:33:19', NOW()), -- Use NOW() for the current timestamp
(5,'TeamBuilding',24,0,0,0,'2020-01-03 14:33:26', NOW()), -- Use NOW() for the current timestamp
(6,'Animation',25,0,0,0,'2020-01-03 14:33:33', NOW()), -- Use NOW() for the current timestamp
(7,'Tournoi',26,0,0,0,'2020-01-03 14:33:39', NOW()); -- Use NOW() for the current timestamp


ALTER TABLE `db_tennis`.`courseclub_availablity` 
CHANGE COLUMN `couch_id` `couch_id` INT NULL DEFAULT NULL ;

ps aux | grep node

pm2 start server.js
