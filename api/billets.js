const express = require('express');
const mysql = require('mysql');

const SELECT_ALL_QUERY = 'SELECT * FROM billet';

const connection = mysql.createConnection({
    host: 'ec2-3-129-149-208.us-east-2.compute.amazonaws.com',
    user: 'AirFranceAPI',
    password: 'AirFranceAPI',
    database: 'airfrance'
});
connection.connect( (err) => {
    if (!err) {
        console.log("mysql connected")
    } else {
        console.log("mysql connection lost: ", err);
    }
});

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        connection.query(SELECT_ALL_QUERY, (err, results) => {
            if(err){
                return res.send(err)
            }
            else {
                return res.json({
                    data: results
                })
            }
        });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
