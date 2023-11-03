DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `CoachCalendarWithUserInfo`(IN `P_CoachId` INT)
    NO SQL
select DISTINCT Date from avaiablity where CoachId =P_CoachId and Status = 'Y'$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `CoachCalendarWithUserInfoIndividual`(IN `P_Coach` INT)
BEGIN
    SELECT MAX(CONCAT(`Date`, ' 00:00:00')) as `start`, 
           'Disponible' AS `title`, 
           'background' AS `display`,
           '#539654' AS `color`
    FROM `avaiablity`
    WHERE `CoachId` = P_Coach AND `Status` = 'Y'
    GROUP BY `Date`
    
    UNION      
    SELECT MAX(CONCAT(`Date`, ' 00:00:00')) as `start`, 
           'Non Disponible' AS `title`, 
           'background' AS `display`,
           '#FF0000' AS `color`
    FROM `avaiablity`
    WHERE `CoachId` = P_Coach AND `Status` = 'R'
    GROUP BY `Date`;
    
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetDayByAvaiablityForClub`(IN `P_Date` DATE, IN `P_COURSE` VARCHAR(255), IN `P_Coach` INT)
select Id SlotId,Hour description,Status Availability from avaiablity where CoachId = P_Coach and Date = P_Date ORDER BY SlotId$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` FUNCTION `SPLIT_STR`(`x` VARCHAR(255), `delim` VARCHAR(12), `pos` INT) RETURNS varchar(255) CHARSET utf8mb3
    DETERMINISTIC
BEGIN
    RETURN REPLACE(SUBSTRING(SUBSTRING_INDEX(x, delim, pos), LENGTH(SUBSTRING_INDEX(x, delim, pos - 1)) + 1), delim, '');
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `filtercoach`(IN `P_POST` VARCHAR(255), IN `P_Date` VARCHAR(255), IN `P_Hour` VARCHAR(255), IN `P_Course` VARCHAR(255))
BEGIN
    DECLARE converted_date DATE;

        IF P_Date = 'null' THEN
        SET converted_date = NULL;
    ELSE
        SET converted_date = NULLIF(P_Date, '0000-00-00');
    END IF;

    SELECT DISTINCT
        c.Coach_ID,
        c.Coach_Fname,
        c.Coach_Lname,
        c.Coach_Image,
        c.Coach_Email,
        c.Coach_Price,
        c.Coach_PriceX10,
        c.Coach_Description,
        c.Coach_Services,
        u.Id
    FROM coaches_dbs c
    INNER JOIN users u ON c.Coach_Email = u.email
    LEFT JOIN avaiablity a ON u.id = a.CoachId
    WHERE
        (u.postalCode = P_POST OR P_POST = '') AND
        (c.Coach_Services LIKE CONCAT('%', P_Course, '%') OR P_Course = '') AND
        (
            (
                (converted_date = Date) OR
                (converted_date IS NULL)
            )
        ) AND
        NULLIF(c.Coach_Services, '') IS NOT NULL AND
        (Hour = P_Hour OR P_Hour = '');
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `filterevent`(IN `P_date` DATE, IN `P_course` VARCHAR(50), IN `P_postalcode` INT)
SELECT * FROM `course_stage` cs WHERE (P_date BETWEEN `from_date` AND `to_date`) AND (`Postalcode` = P_postalcode)$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_demand_course_price`(IN `CoachId` INT, IN `TotalPeople` INT, IN `P_Date` DATE)
select (case when TotalPeople = 2 then Price_2pl_1hr 
	when TotalPeople = 3 then Price_3pl_1hr 
	when TotalPeople = 4 then Price_4pl_1hr 
	when TotalPeople = 5 then Price_5pl_1hr 
	when TotalPeople = 6 then Price_6pl_1hr else 0 end) + (case when dayname(P_Date) = 'Monday' then Price_Mon 
	when dayname(P_Date) = 'Tuesday' then Price_Tue 
	when dayname(P_Date) = 'Wednesday' then Price_Wed
	when dayname(P_Date) = 'Thursday' then Price_Thr 
	when dayname(P_Date) = 'Friday' then Price_Fri
	when dayname(P_Date) = 'Saturday' then Price_Sat
	when dayname(P_Date) = 'Sunday' then Price_Sun
	else 0 end) Price from course_collective_if_demand where Coach_Id = CoachId limit 1$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getcourseClub`(IN `P_CoachID` INT)
    NO SQL
SELECT  (SELECT * FROM `couse_collective_if_club` WHERE Coach_Id =  P_CoachID) AS course,
		(SELECT * FROM `courseclub_availablity` WHERE CoachId =  P_CoachID) AS availablity$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `ins_upd_avaiablity`(IN `h8` VARCHAR(5), IN `h9` VARCHAR(5), IN `h10` VARCHAR(5), IN `h11` VARCHAR(5), IN `h12` VARCHAR(5), IN `h13` VARCHAR(5), IN `h14` VARCHAR(5), IN `h15` VARCHAR(5), IN `h16` VARCHAR(5), IN `h17` VARCHAR(5), IN `h18` VARCHAR(5), IN `h19` VARCHAR(5), IN `h20` VARCHAR(5), IN `h21` VARCHAR(5), IN `P_CoachId` INT, IN `P_Date` DATE, IN `P_FromDate` DATE, IN `P_ToDate` DATE)
begin
  IF EXISTS (select 1 from avaiablity where CoachId = P_CoachId and Date = P_Date) THEN
	update avaiablity set Status = h8 where CoachId = P_CoachId and Date = P_Date and Hour = '8h - 9h';
	update avaiablity set Status = h9 where CoachId = P_CoachId and Date = P_Date and Hour = '9h - 10h';
	update avaiablity set Status = h10 where CoachId = P_CoachId and Date = P_Date and Hour = '10h - 11h';
	update avaiablity set Status = h11 where CoachId = P_CoachId and Date = P_Date and Hour = '11h - 12h';
	update avaiablity set Status = h12 where CoachId = P_CoachId and Date = P_Date and Hour = '12h - 13h';
	update avaiablity set Status = h13 where CoachId = P_CoachId and Date = P_Date and Hour = '13h - 14h';
	update avaiablity set Status = h14 where CoachId = P_CoachId and Date = P_Date and Hour = '14h - 15h';
	update avaiablity set Status = h15 where CoachId = P_CoachId and Date = P_Date and Hour = '15h - 16h';
	update avaiablity set Status = h16 where CoachId = P_CoachId and Date = P_Date and Hour = '16h - 17h';
	update avaiablity set Status = h17 where CoachId = P_CoachId and Date = P_Date and Hour = '17h - 18h';
	update avaiablity set Status = h18 where CoachId = P_CoachId and Date = P_Date and Hour = '18h - 19h';
	update avaiablity set Status = h19 where CoachId = P_CoachId and Date = P_Date and Hour = '19h - 20h';
	update avaiablity set Status = h20 where CoachId = P_CoachId and Date = P_Date and Hour = '20h - 21h';
	update avaiablity set Status = h21 where CoachId = P_CoachId and Date = P_Date and Hour = '21h - 22h';
	
  ELSE 
    insert into avaiablity (CoachId,Hour,Status,Date,DateName,TotalSeat,Price) values (P_CoachId,'8h - 9h',h8,P_Date,DAYNAME(P_Date),0,0);
	insert into avaiablity (CoachId,Hour,Status,Date,DateName,TotalSeat,Price) values (P_CoachId,'9h - 10h',h9,P_Date,DAYNAME(P_Date),0,0);
	insert into avaiablity (CoachId,Hour,Status,Date,DateName,TotalSeat,Price) values (P_CoachId,'10h - 11h',h10,P_Date,DAYNAME(P_Date),0,0);
	insert into avaiablity (CoachId,Hour,Status,Date,DateName,TotalSeat,Price) values (P_CoachId,'11h - 12h',h11,P_Date,DAYNAME(P_Date),0,0);
	insert into avaiablity (CoachId,Hour,Status,Date,DateName,TotalSeat,Price) values (P_CoachId,'12h - 13h',h12,P_Date,DAYNAME(P_Date),0,0);
	insert into avaiablity (CoachId,Hour,Status,Date,DateName,TotalSeat,Price) values (P_CoachId,'13h - 14h',h13,P_Date,DAYNAME(P_Date),0,0);
	insert into avaiablity (CoachId,Hour,Status,Date,DateName,TotalSeat,Price) values (P_CoachId,'14h - 15h',h14,P_Date,DAYNAME(P_Date),0,0);
	insert into avaiablity (CoachId,Hour,Status,Date,DateName,TotalSeat,Price) values (P_CoachId,'15h - 16h',h15,P_Date,DAYNAME(P_Date),0,0);
	insert into avaiablity (CoachId,Hour,Status,Date,DateName,TotalSeat,Price) values (P_CoachId,'16h - 17h',h16,P_Date,DAYNAME(P_Date),0,0);
	insert into avaiablity (CoachId,Hour,Status,Date,DateName,TotalSeat,Price) values (P_CoachId,'17h - 18h',h17,P_Date,DAYNAME(P_Date),0,0);
	insert into avaiablity (CoachId,Hour,Status,Date,DateName,TotalSeat,Price) values (P_CoachId,'18h - 19h',h18,P_Date,DAYNAME(P_Date),0,0);
	insert into avaiablity (CoachId,Hour,Status,Date,DateName,TotalSeat,Price) values (P_CoachId,'19h - 20h',h19,P_Date,DAYNAME(P_Date),0,0);
	insert into avaiablity (CoachId,Hour,Status,Date,DateName,TotalSeat,Price) values (P_CoachId,'20h - 21h',h20,P_Date,DAYNAME(P_Date),0,0);
	insert into avaiablity (CoachId,Hour,Status,Date,DateName,TotalSeat,Price) values (P_CoachId,'21h - 22h',h21,P_Date,DAYNAME(P_Date),0,0);
END IF;
end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `inst_upd_clubavailablity`(
    IN `P_CoachId` INT, 
    IN `P_Weekday` VARCHAR(20), 
    IN `P_StartTime` VARCHAR(50), 
    IN `P_EndTime` VARCHAR(50), 
    IN `P_MaxCount` INT, 
    IN `P_Price` INT, 
    IN `P_COURSE` VARCHAR(100), 
    IN `P_CourseId` INT, 
    IN `P_Id` INT
)
    NO SQL
BEGIN
    IF EXISTS (SELECT 1 FROM courseclub_availablity WHERE Id = P_Id) THEN
        UPDATE courseclub_availablity 
        SET Weekday = P_Weekday,
            MaxCount = P_MaxCount,
            StartTime = P_StartTime,
            EndTime = P_EndTime,
            Price = P_Price,
            Course = P_COURSE,
            Course_Id = P_CourseId
        WHERE Id = P_Id;
    ELSE
        INSERT INTO courseclub_availablity (CoachId, Weekday, StartTime, EndTime, MaxCount, Price, Course,Course_Id) 
        VALUES (P_CoachId, P_Weekday, P_StartTime, P_EndTime, P_MaxCount, P_Price, P_COURSE,P_CourseId);
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_get_calendar`(IN `P_Coach` INT)
select Id,Status Availability,1 allDay,0 editable, case 
when Status = 'B' then '#e06363' 
when Status = 'R' then '#de6111' 
when Status = 'Y' then '#539654' 
else '#e06363' end color , Date end, Date start, case when CourseName is null then Hour else concat(CourseName,'(',Hour,')') end title from  avaiablity av 
left join course_dbs cd on av.CourseId = cd.Course_Shotname
where CoachId = P_Coach and Status != 'N'
order by Id$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_get_calendar_summary`(IN `P_Coach` INT)
select 'Event' title,'#539654' color,start,end ,allDay, editable  from(
select distinct * from (
select IFNULL(bs.hdstatus,IFNULL(ava.SlotAvaiStaus,'N')) As Availability, case 
when IFNULL(bs.hdstatus,IFNULL(ava.SlotAvaiStaus,'N')) = 'B' then '#e06363' 
when IFNULL(bs.hdstatus,IFNULL(ava.SlotAvaiStaus,'N')) = 'R' then '#de6111' 
when IFNULL(bs.hdstatus,IFNULL(ava.SlotAvaiStaus,'N')) = 'Y' then '#539654' 
else '#e06363' end color
 , Start_Date as start, IFNULL(EndDate,Start_Date) as end,CONCAT (s.Course , ' (' ,s.description ,')') as title, true allDay, false editable from slot s 
left join (select Start_Date,SDateName,Course,'Morning' SlotName, Morning SlotAvaiStaus from vwaviaiablity where Coach_id = P_Coach
union all
select Start_Date,SDateName,Course,'Afternoon' SlotName, Afternoon SlotAvaiStaus from vwaviaiablity where  Coach_id = P_Coach
union all
select Start_Date,SDateName,Course,'Evening' SlotName, Evening SlotAvaiStaus from vwaviaiablity where  Coach_id = P_Coach) ava 
on ava.SlotName = s.session
left join (select distinct t.*,b.status hdstatus  from bookingcourse_slot t inner JOIN booking_dbs b on 
          b.booking_Id = t.BookedId where  b.Coach_ID = P_Coach) bs on 
s.description = bs.Slot and ava.Start_Date between bs.Date and bs.EndDate ) var where Availability != 'N' and Availability != ''
union all
select IFNULL(bs.hdstatus,'N') As Availability, case 
when IFNULL(bs.hdstatus,'N') = 'B' then '#e06363' 
when IFNULL(bs.hdstatus,'N') = 'R' then '#de6111' 
when IFNULL(bs.hdstatus,'N') = 'Y' then '#539654' 
else '#e06363' end color
 , Date as start, IFNULL(EndDate,Date) as end, 'CoursCollectifClub' as title, true allDay, false editable from
(select distinct t.*,b.status hdstatus  from bookingcourse_slot t inner JOIN booking_dbs b on 
          b.booking_Id = t.BookedId where  b.Coach_ID = P_Coach and b.bookingCourse = 'CoursCollectifClub') bs)v group by start,end ,allDay, editable$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_ins_booking_dbs`(IN `P_CoachId` INT, IN `P_CourseId` VARCHAR(50), IN `P_Date` DATE, IN `P_Hour` VARCHAR(25), IN `P_UserId` INT, IN `P_Amount` DECIMAL, IN `P_Remarks` TEXT)
BEGIN
	declare P_MAX_COUNT int DEFAULT 0;declare P_Total_Count int DEFAULT  0;
	Insert into booking_dbs (Coach_ID,user_Id,payment_Id,status,bookingDate,bookingCourse,amount,BookingTime,`Remarks`)
	values (P_CoachId,P_UserId,'0','R',P_Date,P_CourseId,P_Amount,P_Hour,P_Remarks);
	if (P_CourseId = 'CoursIndividuel') THEN
		update avaiablity set Status = 'B', UserId = P_UserId, CourseId = P_CourseId,Price = P_Amount,TotalSeat = '1' 
	where CoachId = P_CoachId and Date =  P_Date and Hour =  P_Hour;
	ELSEIF  (P_CourseId = 'CoursCollectifClub') then 
		update avaiablity set UserId = P_UserId, CourseId = P_CourseId,Price = P_Amount,
		TotalSeat = TotalSeat + (select d.MaxCount from couse_collective_if_club d where d.Coach_Id = P_CoachId LIMIT 1),
		Status = (case when ((select d.MaxCount from couse_collective_if_club d where d.Coach_Id = P_CoachId LIMIT 1) - 1) = TotalSeat then 'B' else 'Y' end)
		where CoachId = P_CoachId and `Date` =  P_Date and `Hour` =  P_Hour;
	ELSEIF  (P_CourseId = 'CoursCollectifOndemand') then 
		update avaiablity set UserId = P_UserId, CourseId = P_CourseId,Price = P_Amount,
		TotalSeat = TotalSeat + (select  d.Max_People from course_collective_if_demand d where d.Coach_Id = P_CoachId LIMIT 1),
		Status = (case when ((select d.Max_People from course_collective_if_demand d where d.Coach_Id = P_CoachId LIMIT 1) - 1) = TotalSeat then 'B' else 'Y' end)
		where CoachId = P_CoachId and Date =  P_Date and Hour =  P_Hour;
 END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_set_booking_status`(IN `P_BookingId` INT, IN `P_Amount` DECIMAL, IN `P_STATUS` VARCHAR(50))
    NO SQL
BEGIN
DECLARE P_UserId INT DEFAULT 0;
DECLARE P_CoachId INT DEFAULT 0;
DECLARE P_CourseId varchar(255) DEFAULT "";
DECLARE P_Date Date DEFAULT "";
DECLARE P_Pre_Status varchar(255) DEFAULT "";


SET P_UserId  = (select `user_Id` from booking_dbs where `booking_Id` = P_BookingId);
SET P_CourseId = (select `bookingCourse` from booking_dbs where `booking_Id` = P_BookingId);
SET P_Date  = (select `bookingDate` from booking_dbs where `booking_Id` = P_BookingId);
SET P_CoachId  = (select `Coach_ID` from booking_dbs where `booking_Id` = P_BookingId);
SET P_Pre_Status = (select `status` from booking_dbs where `booking_Id` = P_BookingId);


UPDATE booking_dbs SET `status` = P_STATUS ,`amount` = P_Amount WHERE `Coach_ID` = P_CoachId and `bookingDate` = P_Date and `user_Id` = P_UserId and `bookingCourse` = P_CourseId and  `status`= P_Pre_Status ;

END$$
DELIMITER ;
