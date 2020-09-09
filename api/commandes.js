const generateRequest = require('../business/generate-request');

const express = require('express');
const mysql = require('mysql');

const SELECT_ALL_QUERY = 'SELECT * FROM commande';

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

router.post('/add', (req, res, next) => {
    const {nomClient, prenomClient, mailClient, aeroportDepart, aeroportArrivee, dateDepart, dateArrivee, passagers, vols} = req.body;
    const dateNow = Date.now();

    const queryAjoutClient = `INSERT INTO client (nomClient, prenomClient, mailClient) VALUES ('${nomClient}', '${prenomClient}', '${mailClient}')`;
    // const queryAjoutCommande = `INSERT INTO commande (noClient, dateCreation) VALUES ('${noClient}', now())`;
    // const queryAjoutPassager = `INSERT INTO passager (nomPassager, prenomPassager) VALUES ('${nomPassager}', '${prenomPassager}')`;
    // const queryAjoutBillet = `INSERT INTO billet (noPassager, noVol, noCommande, dateDepart, dateArrivee) VALUES ('${idPassager}', '${idVol}', '${idCommande}', '${dateDepart}', '${dateArrivee}')`;

    console.log(generateRequest.generateRequestBillet(vols, passagers, 1, dateDepart, dateArrivee));

    connection.query(queryAjoutClient, (err, results) => {
        if (err) {
            return next(err);
        } else {
            connection.query('SELECT LAST_INSERT_ID()', (err, results) => {
                if (err) {
                    return next(err);
                } else {
                    connection.query(generateRequest.generateRequestCommande(JSON.parse(JSON.stringify(results))[0]["LAST_INSERT_ID()"])[0], (err, results) => {
                        //connection.query(`INSERT INTO commande (noClient, dateCreation) VALUES ('${JSON.parse(JSON.stringify(results))[0]["LAST_INSERT_ID()"]}',now())`, (err, results) => {
                        if (err) {
                            return next(err);
                        } else {
                            connection.query('SELECT LAST_INSERT_ID()', (err, results) => {
                                if (err) {
                                    return next(err);
                                } else {
                                    passagers.forEach((p) => {
                                        connection.query("INSERT INTO passager (nomPassager, prenomPassager) VALUES ('" + p.nomPassager + "', '" + p.prenomPassager + "')", (err, results) => {
                                            if (err) {
                                                return next(err);
                                            } else {
                                                connection.query('SELECT LAST_INSERT_ID()', (err, results) => {
                                                    if (err) return next(err);
                                                    else {
                                                        vols.forEach((v) => {
                                                            connection.query("INSERT INTO billet (noPassager, noVol, noCommande, dateDepart, dateArrivee) VALUES ('" + p.idPassager + "', '" + v + "', '" + JSON.parse(JSON.stringify(results))[0]["LAST_INSERT_ID()"][0] + "', '" + dateDepart + "', '" + dateArrivee + ")", (err, results) => {
                                                                if (err) return next(err);
                                                                console.log(results);
                                                            });
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});


module.exports = router;
