
const router = require('../routes/index');
const moment = require('moment');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'kocieta',
    database: 'data_test'
});


// akcje obslugujace kontkretne podstrony
exports.home = (req, res) => {
    res.render('home', {moment: moment});
    console.log('Home page opened');
};

exports.measurement = (req, res) => {

    var obj={};
        connection.query('SELECT * FROM pressure LIMIT 1000', function(err, result) {
            if(err) {
                throw err;
                res.status('404').render('404');
            } else {
                obj = {print: result};
                res.render('measurement', obj);
                console.log('Query Send $ Read SUCCESS');
            }
        });
    
    //res.render('measurement');
    console.log('measurement page opened');
    //connection.end();
    console.log("End connections")
};
