console.log("TESTEST");

var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(express.static('views')); 

app.set('port', 8123);

/***************** HOME SCRIPT ***************************/
/*
app.use(function(req,res,next) {
  console.log(req);
  next();
})
*/
app.get('/', function (req, res, next) {
  console.log("HELLO THERE");
res.render('home');
});

/*TEST DATA
app.get('/',function(req,res){
  db.query('SELECT * FROM class', function(err, rows) {
    if(err) {
      console.log(err);
      return;
    }
    res.render('get', {rows: rows});
  });
});
*/
/****************** ENROLLMENT PAGE *************************/
//TO DISPLAY -- app.get to display data table of enrollment
app.get('/enrollment',function(req,res){
  db.query('SELECT * FROM enrollment_type', function(err, enrollment) {
    if(err) {
      console.log(err);
      return;
    } 
  res.render('enrollment', {enrollment: enrollment});
  });
});



//TO DISPLAY -- function to display enrollment in ID
function getEnrollment(res, db, context, complete){
  db.query("SELECT * FROM enrollment_type", function(error, results, fields){
           if(error){
                console.log("Error in function getEnrollment");
                res.write(JSON.stringify(error));
                res.end();
            }
            context.enrollment = results;
            complete();
  });
};

//TO DISPLAY -- app.get to display enrollment function
app.get('/enrollment',function(req,res){
  var context = {enrollment: enrollment};
  getEnrollment(res, db, context, complete);
  function complete() {
      console.log("Success - enrollment")
      res.render('enrollment', context);
  }
});


//TO ADD -- Add new enrollment type in form 
app.post('/enrollment', function(req, res){
        var sql = `INSERT INTO enrollment_type (type) VALUES (?)`;
        var inserts = [req.body.type];
        db.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/enrollment');
            }
        })
});


//TO DELETE -- Delete enrollment in form
app.delete('/enrollment/:enrollment_id', function(req,res){
  var sql = "DELETE FROM enrollment_type WHERE enrollment_id = ?";
  console.log(req.params);
  var inserts = [req.params.enrollment_id];
  db.query(sql, inserts, function(error, results, fields) {
    if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
              } else {
                res.status(202).end();
            }
  });

});


//TO SEARCH -- function to search enrollment type with name like
function getEnrollmentTypeLike(req, res, db, context, complete) {
//sanitize the input as well as include the % character
var query = `SELECT * FROM enrollment_type WHERE type LIKE` + db.escape(req.params.s + '%');
 console.log(query);
      db.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.enrollment = results;
            complete();
        });
}

//TO SEARCH -- app.get to display the enrollment type name like
app.get('/search/enrollment/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        getEnrollmentTypeLike(req, res, db, context, complete);
        function complete(){
                res.render('search_enrollment', context);
            
        }
    });


//TO EDIT -- To get specific enrollment_id from enrollmnet table
function getEnrollmentSpecific(res, db, context, complete){
    db.query(`SELECT enrollment_id, type FROM enrollment_type WHERE enrollment_id = ?`, 
      [context.enrollment_id], function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.enrollment = results;
            complete();
        });
 };


//TO EDIT -- to go to edit_enrollment page and get specific enrollment id to update
app.get('/enrollment/:enrollment_id',function(req,res){
  var context = {};
  context.enrollment_id = req.params.enrollment_id;
  getEnrollmentSpecific(res, db, context, complete);
  console.log(context);
  function complete() {
 //   callbackCount++;
 //   if(callbackCount >= 2){
      console.log(context);
      res.render('edit_enrollment', context)
 //   }
  }
});


//TO EDIT -- to put data back into table after update 
app.put('/enrollment', function(req,res){
       // var mysql = req.app.get('mysql');
        console.log(req.body);
       // console.log(req.params.instructor_id);
        var sql = "UPDATE enrollment_type SET type=? WHERE enrollment_id = ?";
        var inserts = [req.body.type, parseInt(req.body.enrollment_id)];
        db.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
                //res.redirect('/instructor');
            }
        });
});


/****************** STUDENT PAGE *************************/
//TO DISPLAY -- function to display student table (all)
function getStudent(res, db, context, complete){
   db.query(`SELECT student.student_id, student.first_name, student.last_name, 
    enrollment_type.type, student.enrollment_qtr, student.enrollment_year FROM student JOIN 
    enrollment_type ON enrollment_type.enrollment_id = student.enrollment_type`, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.students = results;
            complete();
        });
 };


//TO DISPLAY -- app.get to display both student and enrollment-name
app.get('/student',function(req,res){
  var callbackCount = 0;
  var context = {};
  getStudent(res, db, context, complete);
  getEnrollment(res, db, context, complete);
  function complete() {
    callbackCount++;
    if(callbackCount >= 2){
      res.render('student', context)
    }
  }
});

//TO ADD -- Add new student in form 
app.post('/student', function(req, res){
        console.log(req.body.enrollment_type);
        console.log(req.body);
        var sql = `INSERT INTO student (first_name, last_name, enrollment_type, 
        enrollment_qtr, enrollment_year) VALUES (?,?,?,?,?)`;
        var inserts = [req.body.first_name, req.body.last_name, parseInt(req.body.enrollment_type), req.body.enrollment_qtr, parseInt(req.body.enrollment_year)];
        db.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/student');
            }
        });
});

//TO DELETE -- Delete a student in form
app.delete('/student/:student_id', function(req,res){
  var sql = "DELETE FROM student WHERE student_id = ?";
  console.log(req.params);
  var inserts = [req.params.student_id];
  db.query(sql, inserts, function(error, results, fields) {
    if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
              } else {
                res.status(202).end();
            }
  });

});

//TO EDIT -- function to get select specific student for edit 
function getStudentSpecific(res, db, context, complete){
   var sql = `SELECT student.student_id, student.first_name, student.last_name, 
    enrollment_type.type, student.enrollment_qtr, student.enrollment_year FROM student JOIN 
    enrollment_type ON enrollment_type.enrollment_id = student.enrollment_type 
    WHERE student.student_id = ?`;
    var inserts = [context.student_id];
    db.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.students = results;
            complete();
        });
 };


//TO EDIT -- to get specific student and re-route to edit_student page
app.get('/student/:student_id',function(req,res){
  var callbackCount = 0;
  var context = {};
  context.student_id = req.params.student_id;
  getStudentSpecific(res, db, context, complete);
  getEnrollment(res, db, context, complete);
  function complete() {
    callbackCount++;
    if(callbackCount >= 2){
      console.log(context);
      res.render('edit_student', context)
    }
  }
});


//TO EDIT -- app.put to update student data 
app.put('/student', function(req,res){
       // var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.student_id)
        var sql = "UPDATE student SET first_name=?, last_name=?, enrollment_type=?, enrollment_qtr=?, enrollment_year=? WHERE student_id=?";
        var inserts = [req.body.first_name, req.body.last_name, parseInt(req.body.enrollment_id), req.body.enrollment_qtr, parseInt(req.body.enrollment_year), parseInt(req.body.student_id)];
        db.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
});


//TO FILTER STUDENT -- function to get select specific year 
function getStudentYear(res, db, context, complete){
   var sql = `SELECT student.student_id, student.first_name, student.last_name, 
    enrollment_type.type, student.enrollment_qtr, student.enrollment_year FROM student JOIN 
    enrollment_type ON enrollment_type.enrollment_id = student.enrollment_type 
    WHERE student.enrollment_year = ?`;
    var inserts = [context.enrollment_year];
    db.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.students = results;
            complete();
        });
 };

//TO FILTER STUDENT -- get student whose enrollment year is equal to x 
app.get('/filter/student/:enrollment_year',function(req,res){
  var callbackCount = 0;
  var context = {};
  context.enrollment_year = req.params.enrollment_year;
  getStudentYear(res, db, context, complete);
  getEnrollment(res, db, context, complete);
  console.log(context);
  function complete() {
    callbackCount++;
    if(callbackCount >= 2){
      console.log(context);
      res.render('filter_student', context)
    }
  }
});

//TO SEARCH -- function to search people with first name like
function getStudentsWithNameLike(req, res, db, context, complete) {
//sanitize the input as well as include the % character
var query = `SELECT student.student_id, student.first_name, student.last_name, 
    enrollment_type.type, student.enrollment_qtr, student.enrollment_year FROM student JOIN 
    enrollment_type ON enrollment_type.enrollment_id = student.enrollment_type 
    WHERE student.first_name LIKE` + db.escape(req.params.s + '%');
 console.log(query);
      db.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.students = results;
            complete();
        });
}

//TO SEARCH -- app.get to display the person who's first name like
app.get('/search/student/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        getStudentsWithNameLike(req, res, db, context, complete);
        getEnrollment(res, db, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('search_student', context);
            }
        }
    });



/****************** STUDENT_CLASS PAGE *************************/
//TO DISPLAY -- Function for student selection drop down for form
function getStudent_Class(res, db, context, complete){
   db.query(`SELECT student_id, first_name, last_name FROM student`, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.students = results;
            complete();
        });
 };

//TO DISPLAY -- Function for class selection drop down for form
function getClass_Student(res, db, context, complete){
   db.query(`SELECT class_id, class_name FROM class`, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.classes = results;
            complete();
        });
 };

//TO DISPLAY -- Function for student_ckass for table display
function getTableStudent_Class(res, db, context, complete){
   db.query(`SELECT student.first_name, student.last_name, student_class.class_id, class.class_name 
    FROM student 
    JOIN student_class ON student_class.student_id = student.student_id
    JOIN class ON class.class_id = student_class.class_id`, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.student_classes = results;
            complete();
        });
 };


//TO DISPLAY -- app.get to display dropdown for student_class form 
app.get('/student_class',function(req,res){
 var callbackCount = 0;
  var context = {};
  getStudent_Class(res, db, context, complete);
  getClass_Student(res, db, context, complete);
  getTableStudent_Class(res, db, context, complete);
  function complete() {
    callbackCount++;
    if(callbackCount >= 3){
      console.log(context);
      res.render('student_class', context)
    }
  }
});


//TO DELETE -- Delete a student_class in form
app.delete('/student_class/:class_id', function(req,res){
  var sql = "DELETE FROM student_class WHERE class_id = ?";
  console.log(req.params);
  var inserts = [req.params.class_id];
  db.query(sql, inserts, function(error, results, fields) {
    if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
              } else {
                res.status(202).end();
            }
  });

});


//TO ADD -- Add new student_class in form 
app.post('/student_class', function(req, res){
        var sql = `INSERT INTO student_class (student_id, class_id) VALUES (?,?)`;
        var inserts = [req.body.student_id, req.body.class_id];
        db.query(sql, inserts, function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/student_class');
            }
        });
});



//TO FILTER STUDENT_CLASS -- function to get select specific year 
function getStudent_ClassFilter(res, db, context, complete){
   var sql = `SELECT student.first_name, student.last_name, student_class.class_id, class.class_name 
    FROM student 
    JOIN student_class ON student_class.student_id = student.student_id
    JOIN class ON class.class_id = student_class.class_id
    WHERE student_class.class_id = ?`;
    var inserts = [context.class_id];
    db.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.student_classes = results;
            complete();
        });
 };


//TO FILTER STUDENT_CLASS -- get student whose enrollment year is equal to x 
app.get('/filter/student_class/:class_id', function(req,res){
  console.log("TEST");
  var callbackCount = 0;
  var context = {};
  context.class_id = req.params.class_id;
  getStudent_ClassFilter(res, db, context, complete); 
  //getStudent_Class(res, db, context, complete);
  //getClass_Student(res, db, context, complete);
  //getTableStudent_Class(res, db, context, complete);
  console.log(context);
  function complete() {
   // callbackCount++;
 //   if(callbackCount >= 2){
      console.log(context);
      res.render('filter_student_class', context)
  //  }
  }
});

//TO SEARCH -- function to get first name like
function getStudents_ClassLike(req, res, db, context, complete) {
var query = `SELECT student.first_name, student.last_name, student_class.class_id, class.class_name 
    FROM student 
    JOIN student_class ON student_class.student_id = student.student_id
    JOIN class ON class.class_id = student_class.class_id
    WHERE student.first_name LIKE` + db.escape(req.params.s + '%');
     console.log(query);
      db.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.student_classes = results;
            complete();
        });
}

//TO SEARCH -- app.get to display the person who's first name like
app.get('/search/student_class/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        getStudents_ClassLike(req, res, db, context, complete);
      //  getEnrollment(res, db, context, complete);
        function complete(){
       //     callbackCount++;
       //     if(callbackCount >= 2){
                res.render('search_student_class', context);
       //     }
        }
    });

/* BECAUSE THIS IS A MANY-TO-MANY TABLE, MIGHT BE UNABLE TO EDIT BECAUSE THEY ARE PULLING FROM 2
DIFFERENT TABLES AND WHEN YOU ADD, IT ADDS A NEW ASSOCIATION TO SPECIFIC STUDENT (AND VICE VERSA) 

//TO EDIT -- STILL WORKING ON
function getStudent_ClassSpecific(res, db, context, complete){
    db.query(`SELECT student.first_name, student.last_name, student_class.class_id, class.class_name 
    FROM student 
    JOIN student_class ON student_class.student_id = student.student_id
    JOIN class ON class.class_id = student_class.class_id
    WHERE student_class.student_id=?`, [context.student_id], function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.student_classes = results;
            complete();
        });
 };

//TO EDIT -- STILL WORKING ON
app.get('/student_class/:student_id',function(req,res){
  var callbackCount = 0;
  var context = {};
  context.student_id = req.params.student_id;
  getStudent_ClassSpecific(res, db, context, complete);
  getStudent_Class(res, db, context, complete);
  getClass_Student(res, db, context, complete);
//  getAcademicRank(res, db, context, complete);
//  console.log(context);
  function complete() {
    callbackCount++;
    if(callbackCount >= 3){
      console.log(context);
      res.render('edit_student_class', context)
    }
  }
});

//TO EDIT -- STILL WORKING ON
app.put('/student_class', function(req,res){
       // var mysql = req.app.get('mysql');
        console.log(req.body);
       // console.log(req.params.instructor_id);
        var sql = "UPDATE student_class SET student_id=?, class_id=? WHERE student_id = ?";
        var inserts = [req.body.student_id, req.body.class_id];
        db.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
                //res.redirect('/instructor');
            }
        });
});

*/

/****************** INSTRUTOR PAGE *************************/
//TO DISPLAY -- instructor function 
function getInstructor(res, db, context, complete){
  console.log("In getInstructor function");
db.query(`SELECT instructor.instructor_id, instructor.first_name, 
    instructor.last_name, academic_rank.name FROM instructor 
    JOIN academic_rank ON academic_rank.rank_id = instructor.academic_rank`, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.instructors = results;
            complete();
        });
 };

 //TO DISPLAY -- function to display academic_rank and rank_id 
function getAcademicRank(res, db, context, complete){
    console.log("In getAcademicRank function");
  db.query("SELECT * FROM academic_rank", function(error, results, fields){
           if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.academic_rank = results;
            complete();
  });
};


//TO DISPLAY  -- app.get to display instructor table
app.get('/instructor',function(req,res){
  console.log("In app.get instructor");
 var callbackCount = 0;
  var context = {};
  getInstructor(res, db, context, complete);
  getAcademicRank(res, db, context, complete);
  function complete() {
    callbackCount++;
    if(callbackCount >= 2){
            console.log(context);
      res.render('instructor', context)
    }
  }
});

//TO ADD -- Add new istructor in form 
app.post('/instructor', function(req, res){
        console.log(req.body.academic_rank);
        console.log(req.body);
        var sql = `INSERT INTO instructor (first_name, last_name, academic_rank) VALUES (?,?,?)`;
        var inserts = [req.body.first_name, req.body.last_name, parseInt(req.body.academic_rank)];
        db.query(sql, inserts, function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/instructor');
            }
        });
});

//TO DELETE -- Delete an instructor in form
app.delete('/instructor/:instructor_id', function(req,res){
  var sql = "DELETE FROM instructor WHERE instructor_id = ?";
  console.log(req.params);
  var inserts = [req.params.instructor_id];
  db.query(sql, inserts, function(error, results, fields) {
    if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
              } else {
                res.status(202).end();
            }
  });

});

//TO FILTER -- function to get people academic id
function getInstructor_Rank (res, db, context, complete) {
  console.log("In getInstructor function");
db.query(`SELECT instructor.instructor_id, instructor.first_name, 
    instructor.last_name, academic_rank.name FROM instructor 
    JOIN academic_rank ON academic_rank.rank_id = instructor.academic_rank
    WHERE instructor.academic_rank = ?`, [context.rank_id], function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.instructors = results;
            complete();
        });
 };

//TO FILTER -- get people whose academic id is equal to x
app.get('/filter/instructor/:rank_id',function(req,res){
  var callbackCount = 0;
  var context = {};
  context.rank_id = req.params.rank_id;
  getInstructor_Rank (res, db, context, complete);
  getAcademicRank(res, db, context, complete);
  console.log(context);
  function complete() {
    callbackCount++;
    if(callbackCount >= 2){
      console.log(context);
      res.render('filter_instructor', context)
    }
  }
});


//TO EDIT -- To get specific person for UPDATE - use for page edit_instructor 
function getInstructorSpecific(res, db, context, complete){
    db.query(`SELECT instructor.instructor_id, instructor.first_name, 
    instructor.last_name, academic_rank.name FROM instructor 
    JOIN academic_rank ON academic_rank.rank_id = instructor.academic_rank 
    WHERE instructor.instructor_id= ?`, [context.instructor_id], function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.instructor = results;
            complete();
        });
 };


//TO EDIT -- Edit a instructor  
app.get('/instructor/:instructor_id',function(req,res){
  var callbackCount = 0;
  var context = {};
  context.instructor_id = req.params.instructor_id;
  getInstructorSpecific(res, db, context, complete);
  getAcademicRank(res, db, context, complete);
  console.log(context);
  function complete() {
    callbackCount++;
    if(callbackCount >= 2){
      console.log(context);
      res.render('edit_instructor', context)
    }
  }
});


//TO EDIT -- app.put to update instructor data 
app.put('/instructor', function(req,res){
       // var mysql = req.app.get('mysql');
        console.log(req.body);
       // console.log(req.params.instructor_id);
        var sql = "UPDATE instructor SET first_name=?, last_name=?, academic_rank=? WHERE instructor_id = ?";
        var inserts = [req.body.first_name, req.body.last_name, parseInt(req.body.rank_id), req.body.instructor_id];
        db.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
                //res.redirect('/instructor');
            }
        });
});

//TO SEARCH -- function to search people with first name like
function getPeopleWithNameLike(req, res, db, context, complete) {
//sanitize the input as well as include the % character
var query = `SELECT instructor.instructor_id, instructor.first_name, 
    instructor.last_name, academic_rank.name FROM instructor 
    JOIN academic_rank ON academic_rank.rank_id = instructor.academic_rank 
    WHERE instructor.first_name LIKE` + db.escape(req.params.s + '%');
 console.log(query);
      db.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.instructor = results;
            complete();
        });
}

//TO SEARCH -- app.get to display the person who's first name like
app.get('/search/instructor/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        getPeopleWithNameLike(req, res, db, context, complete);
        getAcademicRank(res, db, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('search_instructor', context);
            }
        }
    });



/****************** ACADEMIC RANK PAGE *************************/
//TO DISPLAY -- function to display academic_rank table
app.get('/academic_rank',function(req,res){
  db.query('SELECT * FROM academic_rank', function(err, rank) {
    if(err) {
      console.log(err);
      return;
    } 
  res.render('academic_rank', {rank: rank});
  });
});


//TO ADD -- Add new academic_rank name in form 
app.post('/academic_rank', function(req, res){
        var sql = `INSERT INTO academic_rank (name) VALUES (?)`;
        var inserts = [req.body.name];
        db.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/academic_rank');
            }
        })
});


//TO DELETE -- Delete enrollment in form
app.delete('/academic_rank/:rank_id', function(req,res){
  var sql = "DELETE FROM academic_rank WHERE rank_id = ?";
  console.log(req.params);
  var inserts = [req.params.rank_id];
  db.query(sql, inserts, function(error, results, fields) {
    if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
              } else {
                res.status(202).end();
            }
  });

});


//TO SEARCH -- function to search academic_rank name with name like
function getAcademicRankLike(req, res, db, context, complete) {
//sanitize the input as well as include the % character
var query = `SELECT * FROM academic_rank WHERE name LIKE` + db.escape(req.params.s + '%');
 console.log(query);
      db.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.rank = results;
            complete();
        });
}

//TO SEARCH -- app.get to display the enrollment type name like
app.get('/search/academic_rank/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        getAcademicRankLike(req, res, db, context, complete);
        function complete(){
                res.render('search_academic_rank', context);
            
        }
    });

//TO EDIT -- get academic rank for update
function getAcademicRankSpecific(res, db, context, complete){
    db.query(`SELECT * FROM academic_rank WHERE rank_id= ?`, [context.rank_id], function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.academic_rank = results;
            complete();
        });
 };

//TO EDIT -- Edit academic rank name
app.get('/academic_rank/:rank_id',function(req,res){
  var context = {};
  context.rank_id = req.params.rank_id;
  getAcademicRankSpecific(res, db, context, complete);
  console.log(context);
  function complete() {
      console.log(context);
      res.render('edit_academic_rank', context)
  }
});

//TO EDIT -- app.put to update academic rank data 
app.put('/academic_rank', function(req,res){
       // var mysql = req.app.get('mysql');
        console.log(req.body);
       // console.log(req.params.instructor_id);
        var sql = "UPDATE academic_rank SET name=? WHERE rank_id = ?";
        var inserts = [req.body.name, parseInt(req.body.rank_id)];
        db.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
                //res.redirect('/instructor');
            }
        });
});
/****************** CLASS PAGE *************************/
//TO DISPLAY -- Function for class table 
function getTable_Class(res, db, context, complete){
   db.query(`SELECT class.class_id, class.class_name, class.prerequisite, 
    class.qtr_offered, instructor.first_name, instructor.last_name
    FROM class
    JOIN instructor ON instructor.instructor_id = class.instructor`, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.classes = results;
            complete();
        });
 };

//TO DISPLAY -- Function for degrees for instructors
function getInstructor_Class(res, db, context, complete){
   db.query(`Select instructor_id, first_name, last_name FROM instructor`, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.instructors = results;
            complete();
        });
 };

//TO DISPLAY -- app.get to display class table
app.get('/class',function(req,res){
  var callbackCount = 0;
  var context = {};
  getTable_Class(res, db, context, complete);
  getInstructor_Class(res, db, context, complete);
  function complete() {
    callbackCount++;
    if(callbackCount >= 2){
      console.log(context);
      res.render('class', context)
    }
  }
});

//TO ADD -- Add new class in form 
app.post('/class', function(req, res){
        var sql = `INSERT INTO class (class_name, prerequisite, qtr_offered, instructor) VALUES (?, ?, ?, ?)`;
        var inserts = [req.body.class_name, req.body.prerequisite, req.body.qtr_offered, req.body.instructor];
        db.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/class');
            }
        })
});

//TO DELETE -- Delete class in class list
app.delete('/class/:class_id', function(req,res){
  var sql = "DELETE FROM class WHERE class_id = ?";
  console.log(req.params);
  var inserts = [req.params.class_id];
  db.query(sql, inserts, function(error, results, fields) {
    if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
              } else {
                res.status(202).end();
            }
  });

});

//TO EDIT -- To get specific class for UPDATE - use for page edit_class
function getClassSpecific(res, db, context, complete){
    db.query(`SELECT class.class_id, class.class_name, class.prerequisite, 
    class.qtr_offered, instructor.first_name, instructor.last_name
    FROM class
    JOIN instructor ON instructor.instructor_id = class.instructor
    WHERE class.class_id= ?`, [context.class_id], function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.class = results;
            complete();
        });
 };

//TO EDIT -- Edit a class  
app.get('/class/:class_id',function(req,res){
  var callbackCount = 0;
  var context = {};
  context.class_id = req.params.class_id;
  getClassSpecific(res, db, context, complete);
  getInstructor_Class(res, db, context, complete);
  console.log(context);
  function complete() {
    callbackCount++;
    if(callbackCount >= 2){
      console.log(context);
      res.render('edit_class', context)
    }
  }
});

//TO EDIT -- app.put to update class data 
app.put('/class', function(req,res){
       // var mysql = req.app.get('mysql');
        console.log(req.body);
       // (class_name, prerequisite, qtr_offered, instructor)
        var sql = "UPDATE class SET class_name=?, prerequisite=?, qtr_offered=?, instructor=? WHERE class_id = ?";
        var inserts = [req.body.class_name, req.body.prerequisite, req.body.qtr_offered, req.body.instructor, req.body.class_id];
        db.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
                //res.redirect('/instructor');
            }
        });
});

//TO SEARCH -- function to search instructor whose first name like
function getStudentsWithNameLike(req, res, db, context, complete) {
//sanitize the input as well as include the % character
var query = `SELECT class.class_id, class.class_name, class.prerequisite, 
    class.qtr_offered, instructor.first_name, instructor.last_name
    FROM class
    JOIN instructor ON instructor.instructor_id = class.instructor
    WHERE instructor.first_name LIKE` + db.escape(req.params.s + '%');
 console.log(query);
      db.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.classes = results;
            complete();
        });
}

//TO SEARCH -- app.get to display instructor first name is like
app.get('/search/class/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        getStudentsWithNameLike(req, res, db, context, complete);
        getInstructor_Class(res, db, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('search_class', context);
            }
        }
    });

//TO FILTER -- function to get people academic id
function getQtrOffered (res, db, context, complete) {
  console.log("In getQtrOffered function");
db.query(`SELECT class.class_id, class.class_name, class.prerequisite, 
    class.qtr_offered, instructor.first_name, instructor.last_name
    FROM class
    JOIN instructor ON instructor.instructor_id = class.instructor
    WHERE class.qtr_offered=?`, [context.qtr_offered], function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.classes = results;
            complete();
        });
 };

//TO FILTER -- get people whose academic id is equal to x
app.get('/filter/class/:qtr_offered',function(req,res){
  var callbackCount = 0;
  var context = {};
  context.qtr_offered = req.params.qtr_offered;
  getQtrOffered (res, db, context, complete);
  getInstructor_Class(res, db, context, complete);
  console.log(context);
  function complete() {
    callbackCount++;
    if(callbackCount >= 2){
      console.log(context);
      res.render('filter_class', context)
    }
  }
});


/****************** DEGREE PAGE *************************/
//TO DISPLAY -- function to get all
function getDegree (res, db, context, complete) {
  console.log("In getDegreeType function");
db.query(`SELECT * FROM degree`, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.degrees = results;
            complete();
        });
 };

//TO DISPLAY -- function to get degree type form 
function getDegreeTypeForm (res, db, context, complete) {
  console.log("In getDegreeType function");
db.query(`SELECT * FROM degree GROUP BY degree_type`, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.degreesForm = results;
            complete();
        });
 };

//TO DISPLAY -- to display degree table 
app.get('/degrees',function(req,res){
  var callbackCount = 0;
  var context = {};
  getDegree (res, db, context, complete) ;
  getDegreeTypeForm (res, db, context, complete);
  function complete() {
    callbackCount++;
    if(callbackCount >= 2){
      console.log(context);
      res.render('degrees', context)
    }
  }
});

//TO ADD -- Add new degree type and field in form 
app.post('/degrees', function(req, res){
        var sql = `INSERT INTO degree (degree_type, field) VALUES (?, ?)`;
        var inserts = [req.body.degree_type, req.body.field];
        db.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/degrees');
            }
        })
});

//TO DELETE -- Delete degree in table list
app.delete('/degrees/:degree_id', function(req,res){
  var sql = "DELETE FROM degree WHERE degree_id = ?";
  console.log(req.params);
  var inserts = [req.params.degree_id];
  db.query(sql, inserts, function(error, results, fields) {
    if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
              } else {
                res.status(202).end();
            }
  });

});

//TO EDIT -- To get specific degree_id for UPDATE - use for page edit_degree
function getDegreeSpecific(res, db, context, complete){
    db.query(`SELECT * FROM degree WHERE degree_id= ?`, [context.degree_id], function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.degrees = results;
            complete();
        });
 };

//TO EDIT -- display data on edit_degrees page
app.get('/degrees/:degree_id',function(req,res){
  var context = {};
  context.degree_id = req.params.degree_id;
  getDegreeSpecific(res, db, context, complete);
  console.log(context);
  function complete() {
      console.log(context);
      res.render('edit_degrees', context)
  }
});

//TO EDIT -- app.put to update degree data 
app.put('/degrees', function(req,res){
       // var mysql = req.app.get('mysql');
        console.log(req.body);
       // console.log(req.params.instructor_id);
        var sql = "UPDATE degree SET degree_type=?, field=? WHERE degree_id = ?";
        var inserts = [req.body.degree_type, req.body.field, req.body.degree_id];
        db.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
                //res.redirect('/instructor');
            }
        });
});

//TO FILTER -- function to filter degree by type
function getDegreeFilter (res, db, context, complete) {
  console.log("In getDegreeType function");
db.query(`SELECT * FROM degree WHERE degree_type=?`, [context.degree_type], function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.degrees = results;
            complete();
        });
 };

//TO FILTER -- get people whose academic id is equal to x
app.get('/filter/degrees/:degree_type',function(req,res){
  var callbackCount = 0;
  var context = {};
  context.degree_type = req.params.degree_type;
  getDegreeFilter (res, db, context, complete);
  //getDegreeTypeForm (res, db, context, complete);
  //getDegree (res, db, context, complete);
  console.log(context);
  function complete() {
  //   if(callbackCount >= 2){
      console.log(context);
      res.render('filter_degrees', context)
  //        }
  }
});

//TO SEARCH -- function to search people with first name like
function getDegreesWithFieldLike(req, res, db, context, complete) {
//sanitize the input as well as include the % character
var query = `SELECT * FROM degree WHERE field LIKE` + db.escape(req.params.s + '%');
 console.log(query);
      db.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.degrees = results;
            complete();
        });
}

//TO SEARCH -- app.get to display the person who's first name like
app.get('/search/degrees/:s', function(req, res){
        var context = {};
        getDegreesWithFieldLike(req, res, db, context, complete);
        function complete(){
                res.render('search_degrees', context);
        }
    });

/****************** STUDENT_DEGREE PAGE *************************/
//TO DISPLAY -- Function for degrees selection drop down for form in student_degree
function getDegree_Student(res, db, context, complete){
   db.query(`SELECT degree_id, degree_type, field FROM degree`, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.degrees = results;
            complete();
        });
 };

//TO DISPLAY -- Function for students selection drop down for form in student_degree
function getStudent_Degree(res, db, context, complete){
   db.query(`Select student_id, first_name, last_name FROM student`, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.students = results;
            complete();
        });
 };

//TO DISPLAY -- Function to display table in student_degree
function getTableStudent_Degree(res, db, context, complete){
   db.query(`SELECT student.first_name, student.last_name, student_degree.degree_id, degree.degree_type, degree.field 
    FROM student 
    JOIN student_degree ON student_degree.student_id = student.student_id
    JOIN degree ON degree.degree_id = student_degree.degree_id`, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.student_degree = results;
            complete();
        });
 };

//TO DISPLAY -- app.get to display dropdown for student_class form 
app.get('/student_degree',function(req,res){
 var callbackCount = 0;
  var context = {};
  getDegree_Student(res, db, context, complete);
  getStudent_Degree(res, db, context, complete);
  getTableStudent_Degree(res, db, context, complete);
  function complete() {
    callbackCount++;
    if(callbackCount >= 3){
      console.log(context);
      res.render('student_degree', context)
    }
  }
});


//TO ADD -- Add new student_degree in form 
app.post('/student_degree', function(req, res){
        var sql = `INSERT INTO student_degree (student_id, degree_id) VALUES (?,?)`;
        var inserts = [req.body.student_id, req.body.degree_id];
        db.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/student_degree');
            }
        });
});

//TO DELETE -- Delete a student_degree in form
app.delete('/student_degree/:degree_id', function(req,res){
  var sql = "DELETE FROM student_degree WHERE degree_id = ?";
  console.log(req.params);
  var inserts = [req.params.degree_id];
  db.query(sql, inserts, function(error, results, fields) {
    if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
              } else {
                res.status(202).end();
            }
  });

});


//TO FILTER -- function to get degree field by degree_id
function getInstructor_Rank (res, db, context, complete) {
  console.log("In getInstructor function");
db.query(`SELECT student.first_name, student.last_name, student_degree.degree_id, degree.degree_type, degree.field 
    FROM student 
    JOIN student_degree ON student_degree.student_id = student.student_id
    JOIN degree ON degree.degree_id = student_degree.degree_id
    WHERE student_degree.degree_id = ?`, [context.degree_id], function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.student_degree = results;
            complete();
        });
 };

 //TO FILTER STUDENT_DEGREE -- get student whose degree field is equal to x 
app.get('/filter/student_degree/:degree_id', function(req,res){
  console.log("TEST");
  var callbackCount = 0;
  var context = {};
  context.degree_id = req.params.degree_id;
 getInstructor_Rank (res, db, context, complete); 
  console.log(context);
  function complete() {
      console.log(context);
      res.render('filter_student_degree', context)
  }
});

//TO SEARCH -- function to search people with first name like
function getStudent_DegreeWithNameLike(req, res, db, context, complete) {
//sanitize the input as well as include the % character
var query = `SELECT student.first_name, student.last_name, student_degree.degree_id, degree.degree_type, degree.field 
    FROM student 
    JOIN student_degree ON student_degree.student_id = student.student_id
    JOIN degree ON degree.degree_id = student_degree.degree_id
    WHERE student.first_name LIKE` + db.escape(req.params.s + '%');
 console.log(query);
      db.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.student_degree = results;
            complete();
        });
}

//TO SEARCH -- app.get to display the person who's first name like
app.get('/search/student_degree/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        getStudent_DegreeWithNameLike(req, res, db, context, complete) ;
       // getEnrollment(res, db, context, complete);
        function complete(){
       //     callbackCount++;
       //     if(callbackCount >= 2){
                res.render('search_student_degree', context);
       //     }
        }
    });



//app.post('/',function(req,res){
//  res.render('post');
//});

//app.use(function(req,res){
//  req.status(404);
//  res.render('404');
//});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

var mysql = require('mysql');
var db = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_alasagae',
  password        : '2039',
  database        : 'cs340_alasagae'
});


/*
app.post('/',function(req,res){
  res.type('text/html');
  console.log(req.query.x);
  res.send('<h1>POST Request Received"</h1>');
});

app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});
*/

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
