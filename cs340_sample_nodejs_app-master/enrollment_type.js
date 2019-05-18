module.exports = function(){
    var express = require('express');
    var router = express.Router();

/* Adds a person, redirects to the people page after adding */

router.post('/', function(req, res){
    console.log(req.body.homeworld)
    console.log(req.body)
    var mysql = req.app.get('mysql');
    var sql = "INSERT INTO bsg_people (fname, lname, homeworld, age) VALUES (?,?,?,?)";
    var inserts = [req.body.fname, req.body.lname, req.body.homeworld, req.body.age];
    sql = mysql.pool.query(sql,inserts,function(error, results, fields){
        if(error){
            console.log(JSON.stringify(error))
            res.write(JSON.stringify(error));
            res.end();
        }else{
            res.redirect('/people');
        }
    });
});


return router;
}();