const mySql = require("../db/connect").con.promise();

exports.addClass = async (req, res) => {
  try {
    const { Name, SchoolID } = req.body;
    // Assuming the 'createdAt' and 'updatedAt' will be handled automatically by MySQL as CURRENT_TIMESTAMP
    const query = `INSERT INTO classes (Name, SchoolID, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())`;
    const [result] = await mySql.execute(query, [Name, SchoolID]);

    // Fetch the newly created class to return it in the response
    const [newClass] = await mySql.execute(
      "SELECT * FROM classes WHERE ClassID = ?",
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Class added successfully",
      data: newClass[0],
    });
  } catch (error) {
    console.error("Error adding class:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.addStudentinClass = async (req, res) => {
  try {
    const { ClassClassID, StudentStudentID } = req.body;
    const query = `INSERT INTO studentclasses (ClassClassID, StudentStudentID, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())`;
    const [result] = await mySql.execute(query, [
      ClassClassID,
      StudentStudentID,
    ]);
    const [newAssignment] = await mySql.execute(
      "SELECT * FROM studentclasses WHERE StudentClassID = ?",
      [result.insertId]
    );

    return res.status(200).json({
      success: true,
      message: "Student assigned to class successfully",
      data: newAssignment[0],
    });
  } catch (error) {
    console.error("Error assigning student to class:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getClassMate = async (req, res) => {
  try {
    const { StudentStudentID } = req.body;

    const query = `SELECT s.StudentStudentID
FROM studentclasses s
JOIN (
  SELECT ClassClassID
  FROM studentclasses
  WHERE StudentStudentID = ?
) AS given_student_classes ON s.ClassClassID = given_student_classes.ClassClassID
GROUP BY s.StudentStudentID
HAVING COUNT(s.ClassClassID) = (
  SELECT COUNT(ClassClassID)
  FROM studentclasses
  WHERE StudentStudentID = ?
);
`;

    const [classmates] = await mySql.execute(query, [
      StudentStudentID,
      StudentStudentID,
    ]);
    const array = [];
    for (let data in classmates) {
      console.log(classmates[data].StudentStudentID);
      const selectedStudent = "select * from students where StudentID =?";
      const [student] = await mySql.execute(selectedStudent, [
        classmates[data].StudentStudentID,
      ]);
      array.push(student[0]);
    }

    return res.status(200).json({
      success: true,
      message: "Classmates retrieved successfully",
      data: array,
    });
  } catch (error) {
    console.error("Error retrieving classmates:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getClass=async(req,res) => {
    try {
      const { SchoolID } = req.body; // Assuming SchoolID is sent through route parameters

      const query = "SELECT * FROM classes WHERE SchoolID = ?";
      const [classes] = await mySql.execute(query, [SchoolID]);

      // Check if classes were found
      if (classes.length > 0) {
        return res.status(200).json({
          success: true,
          message: "Classes found successfully",
          data: classes,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "No classes found for the given SchoolID",
        });
      }
    } catch (error) {
      console.error("Error finding classes:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
};