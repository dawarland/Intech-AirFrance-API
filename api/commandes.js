const generateRequest = require('../business/generate-request');
const businessService = require('../business/businessService');

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

    connection.query("SELECT * FROM client WHERE mailClient='"+mailClient+"'", (err, results) => {
        if (err) {
            return next(err);
        } else {
            if(JSON.stringify(results) === '[]'){
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

                                                let noCommande = JSON.parse(JSON.stringify(results))[0]["LAST_INSERT_ID()"];

                                                passagers.forEach(async (p) => {
                                                    let c = await connection.query("INSERT INTO passager (nomPassager, prenomPassager) VALUES ('" + p.nomPassager + "', '" + p.prenomPassager + "')", (err, results) => {
                                                        if (err) {
                                                            return next(err);
                                                        } else {
                                                            connection.query('SELECT LAST_INSERT_ID()', (err, results1) => {
                                                                if (err) return next(err);
                                                                else {
                                                                    vols.forEach((v) => {
                                                                        console.log((JSON.parse(JSON.stringify(results1))[0]["LAST_INSERT_ID()"]));
                                                                        connection.query("INSERT INTO billet (noPassager, noVol, noCommande, dateDepart, dateArrivee) VALUES ('" + (JSON.parse(JSON.stringify(results1))[0]["LAST_INSERT_ID()"]) + "', '" + v + "', '" + noCommande + "', '" + dateDepart + "', '" + dateArrivee + "')", (err, results2) => {
                                                                            if (err) return next(err);
                                                                            console.log(results2);
                                                                        });
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                });
                                                res.json({
                                                    data: results
                                                })
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }else{
                connection.query(generateRequest.generateRequestCommande(results[0].idClient)[0], (err, results) => {
                    if (err) {
                        return next(err);
                    } else {
                        connection.query('SELECT LAST_INSERT_ID()', (err, results) => {
                            if (err) {
                                return next(err);
                            } else {

                                let noCommande = JSON.parse(JSON.stringify(results))[0]["LAST_INSERT_ID()"];

                                for (let i = 0; i<passagers.length; i++) {
                                    let p = passagers[i];
                                //passagers.forEach(async (p) => {
                                    connection.query("INSERT INTO passager (nomPassager, prenomPassager) VALUES ('" + p.nomPassager + "', '" + p.prenomPassager + "')", (err, results) => {
                                        if (err) {
                                            return next(err);
                                        } else {
                                            console.log("creation passager ",results);
                                            connection.query('SELECT LAST_INSERT_ID()', (err, results1) => {
                                                if (err) return next(err);
                                                else {
                                                    for (const v of vols) {
                                                        console.log("Utilisateur ",(JSON.parse(JSON.stringify(results1))[0]["LAST_INSERT_ID()"]));
                                                        connection.query("INSERT INTO billet (noPassager, noVol, noCommande, dateDepart, dateArrivee) VALUES ('" + (JSON.parse(JSON.stringify(results1))[0]["LAST_INSERT_ID()"]) + "', '" + v + "', '" + noCommande + "', '" + dateDepart + "', '" + dateArrivee + "')", (err, results2) => {
                                                            if (err) return next(err);
                                                            console.log(results2);
                                                        });
                                                    };
                                                }
                                            });
                                        }
                                    });
                                    //createBilletsWithPassager(p.nomPassager, p.prenomPassager, vols, noCommande, dateDepart, dateArrivee, next)
                                }
                                res.json({
                                    data: results
                                })
                            }
                        });
                    }
                });
            }
        }});
});

router.get('/:idCommande', async (req, res, next) => {
    const { idCommande } = req.params;
    try {
        connection.query(SELECT_ALL_QUERY+" WHERE idCommande='"+idCommande+"'", (err, results) => {
            if(err){
                return next(err);
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

router.get('/tarif/:idCommande', async (req, res, next) => {
    const { idCommande } = req.params;
    try {
        connection.query("SELECT SUM(prixVol), COUNT(idVol), COUNT(idPassager)" +
            "FROM (" +
            "    SELECT vol.idVol, vol.prixVol, passager.idPassager " +
            "    FROM vol" +
            "    INNER JOIN billet" +
            "        ON billet.noVol = vol.idVol" +
            "    INNER JOIN passager" +
            "        ON billet.noPassager = passager.idPassager" +
            "    WHERE " +
            "    billet.noCommande=" +idCommande+
            ") AS PrixTotal", (err, results) => {
            if(err){
                return next(err);
            }
            else {
                console.log(results);
                let sumPrixVol = results[0]["SUM(prixVol)"];
                let nbVol = results[0]["COUNT(idVol)"];
                let nbPassager = results[0]["COUNT(idPassager)"];
                const prixTotal = businessService.calculRemise(sumPrixVol, nbVol, nbPassager);
                console.log(prixTotal);

                connection.query("UPDATE commande SET prixTotal="+prixTotal+" WHERE idCommande='"+idCommande+"'", (err, results) => {
                    if(err){
                        return next(err);
                    }
                    else {
                        return res.json({
                            data: {"prixTotal": prixTotal}
                        })
                    }
                });
            }
        });
    } catch (e) {
        return next(e);
    }
});

router.put('/paye/:idCommande', async (req, res, next) => {
        const { idCommande } = req.body;
    try {
        connection.query("UPDATE commande SET paye=true WHERE idCommande='"+idCommande+"'", (err, results) => {
            if(err){
                console(err);
                return next(err);
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
router.get('/paye/:idCommande', async (req, res, next) => {
    const { idCommande } = req.params;
    try {
        connection.query("UPDATE commande SET paye=true WHERE idCommande='"+idCommande+"'", (err, results) => {
            if(err){
                console(err);
                return next(err);
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

router.get('/informations/:idCommande', async (req, res, next) => {
    const { idCommande } = req.params;
    try {
        connection.query("SELECT idBillet, dateDepart, dateArrivee, noPassager, noVol, nomPassager, prenomPassager, prixVol, aeroport1.nomAeroport AS \"Depart\", aeroport1.idAeroport AS \"idDepart\", aeroport2.nomAeroport AS \"Arrivee\", aeroport2.idAeroport AS \"idArrivee\", noClient, dateCreation, prixTotal, nomClient, mailClient " +
            " FROM billet" +
            " INNER JOIN passager ON billet.noPassager = passager.idPassager" +
            " INNER JOIN vol ON billet.noVol = vol.idVol " +
            " INNER JOIN aeroport AS aeroport1 ON vol.noAeroportDepart = aeroport1.idAeroport" +
            "    INNER JOIN aeroport AS aeroport2 ON vol.noAeroportArrivee = aeroport2.idAeroport" +
            " INNER JOIN commande ON billet.noCommande = commande.idCommande" +
            " INNER JOIN client ON client.idClient = commande.noClient"+
            " WHERE billet.noCommande='"+idCommande+"'", (err, results) => {
            if(err){
                return next(err);
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
