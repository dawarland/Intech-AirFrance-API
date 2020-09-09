const express = require('express');
const mysql = require('mysql');

const SELECT_ALL_QUERY = 'SELECT * FROM vol';

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

router.post('/query', (req, res, next) => {
    //const {dateDepart, dateArrivee, idAeroportDepart, idAeroportArrivee} = req.query;
    const {dateDepart, dateArrivee, idAeroportDepart, idAeroportArrivee} = req.body;

    const querySelectVol = `SELECT vol.idVol , aeroport1.nomAeroport AS "Depart", aeroport1.idAeroport AS "idDepart", aeroport2.nomAeroport AS "Arrivee", aeroport2.idAeroport AS "idArrivee", vol.prixVol 
FROM vol AS vol
JOIN aeroport AS aeroport1 ON vol.noAeroportDepart = aeroport1.idAeroport
JOIN aeroport AS aeroport2 ON vol.noAeroportArrivee = aeroport2.idAeroport
WHERE
 noAeroportDepart = ${idAeroportDepart} OR noAeroportArrivee = ${idAeroportArrivee} OR noAeroportDepart = ${idAeroportArrivee} OR noAeroportArrivee = ${idAeroportDepart}`;
    try {
        connection.query(querySelectVol, (err, results) => {
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
