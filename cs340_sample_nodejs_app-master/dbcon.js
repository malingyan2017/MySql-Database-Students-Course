var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_maling',
  password        : '5670',
  database        : 'cs340_maling'
});
module.exports.pool = pool;
