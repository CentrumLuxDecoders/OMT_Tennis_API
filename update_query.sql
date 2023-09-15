ALTER TABLE `db_tennis`.`booking_dbs` 
ADD COLUMN `BookingTime` VARCHAR(250) NULL AFTER `bookingCourseID`;

ALTER TABLE `db_tennis`.`avaiablity` 
ADD COLUMN `UserId` INT(11) NULL AFTER `ToDate`;



ps aux | grep node

pm2 start server.js
