const mySql = require("../db/connect").con.promise();
const moment = require("moment");
const crypto = require("crypto");
const fs = require("fs");
exports.addSchool = async (req, res) => {
  try {
    const { SchoolName, userId } = req.body;
    var inviteCodes = 3000; // Starting point for invite codes, consider making this more dynamic or unique.

    // Fetch the highest current invite code
    const query =
      "SELECT inviteCodes FROM schools ORDER BY inviteCodes DESC LIMIT 1";
    const [existingInviteCodes] = await mySql.query(query);

    // Check if any invite codes exist and increment from the highest
    if (existingInviteCodes.length > 0) {
      inviteCodes = Number(existingInviteCodes[0].inviteCodes) + 1;
    }
const querys="Update users set inviteCode = ? where id = ?";
  const [results] = await mySql.query(querys, [
  inviteCodes,
  userId,
  ]);
    // Corrected insert SQL query with placeholders for each column value including NOW() for timestamps
    const insertSchoolQuery =
      "INSERT INTO schools (schoolName, Photo, inviteCodes, createdAt, updatedAt, userId) VALUES (?, ?, ?, NOW(), NOW(), ?)";

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const uploadedFile = req.files[i];
        const tmp_path = uploadedFile.path;
        const timeStamp = moment().valueOf();
        const randomString = crypto.randomBytes(10).toString("hex");
        const fileExtentsion = uploadedFile.originalname.split(".");
        const file_final_name = `${randomString}-${timeStamp}.${
          fileExtentsion[fileExtentsion.length - 1]
        }`;
        const final_path = "uploads/" + file_final_name;
        console.log(final_path);
        fs.renameSync(tmp_path, final_path, (err) => {
          if (err) {
            return uploadedFile.fieldname + " file linking failed";
          }
        });

        Photo = final_path;
      }
    }
    // Execute the insert query with the parameters
    const [result] = await mySql.query(insertSchoolQuery, [
      SchoolName,
      Photo,
      inviteCodes,
      userId,
    ]);

    // Corrected status code for success
    return res.status(201).json({
      success: true,
      msg: "School added successfully",
      data: result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err: 500, msg: err.message });
  }
};
