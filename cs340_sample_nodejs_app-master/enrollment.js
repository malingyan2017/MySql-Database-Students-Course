module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getEnrollment(res, mysql, context, complete) {
	    mysql.pool.query("SELECT enrollment_id as id, type FROM enrollment_type", function(error, results, fields){
	    if(error){
		        res.write(JSON.stringify(error));
                res.end();
            }
	    context.enrollment = results;
            complete();
        });
    }

    

    /*Display all enrollments. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
	console.log('start get /');
        //var callbackCount = 0;
        var context = {};
        //context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
        var mysql = req.app.get('mysql');
        getEnrollment(res, mysql, context, complete);
        function complete(){
            //callbackCount++;
            //if(callbackCount >= 2){
                res.render('enrollment', context);
            //}

        }
    });

    

    /* Adds a enrollment, redirects to the enrollment page after adding */

    router.post('/', function(req, res){
        console.log(req.body.homeworld)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO enrollment_type (type) VALUES (?)";
        var inserts = [req.body.type];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/enrollment');
            }
        });
    });


    return router;
}();
