const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();

const SELECT_ALL_VOLS_QUERY = 'SELECT * FROM vol';
const SELECT_ALL_AEROPORT_QUERY = 'SELECT * FROM aeroport';

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

app.use(cors());

app.get('/', (req, res) => {
    res.send('go to /products to see products')
});

app.get('/aeroport', (req, res) => {
    connection.query(SELECT_ALL_AEROPORT_QUERY, (err, results) => {
        if(err){
            return res.send(err)
        }
        else {
            return res.json({
                data: results
            })
        }
    });
});

app.get('/vol', (req, res) => {
    connection.query(SELECT_ALL_VOLS_QUERY, (err, results) => {
        if(err){
            return res.send(err)
        }
        else {
            return res.json({
                data: results
            })
        }
    });
});
app.get('/vol/query', (req, res) => {
    const {dateDepart, dateArrivee, idAeroportDepart, idAeroportArrivee} = req.query;

    const querySelectVol = `SELECT vol.idVol , aeroport1.nomAeroport AS "Depart", aeroport1.idAeroport AS "idDepart", aeroport2.nomAeroport AS "Arrivee", aeroport2.idAeroport AS "idArrivee", vol.prixVol 
FROM vol AS vol
JOIN aeroport AS aeroport1 ON vol.noAeroportDepart = aeroport1.idAeroport
JOIN aeroport AS aeroport2 ON vol.noAeroportArrivee = aeroport2.idAeroport
WHERE
 noAeroportDepart = ${idAeroportDepart} OR noAeroportArrivee = ${idAeroportArrivee} OR noAeroportDepart = ${idAeroportArrivee} OR noAeroportArrivee = ${idAeroportDepart}`;
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
});
app.get('/vol/add', (req, res) => {
    const {name, price} = req.query;
    const queryAjout = `INSERT INTO vol (name, price) VALUES ('${name}', '${price}')`;
    connection.query(queryAjout, (err, results) => {
        if(err){
            return res.send(err)
        }
        else {
            connection.query('SELECT LAST_INSERT_ID()', (err, results) => {
                if(err){
                    return res.send(err)
                }
                return res.json({
                    data: results
                })
            });
        }
    });
});

app.get('/client/add', (req, res) => {
    const {nomClient, prenomClient, mailClient} = req.query;
    const queryAjoutClient = `INSERT INTO client (nomClient, prenomClient, mailClient) VALUES ('${nomClient}', '${prenomClient}', '${mailClient}')`;
    connection.query(queryAjoutClient, (err, results) => {
        if(err){
            return res.send(err)
        }
        else {
            connection.query('SELECT LAST_INSERT_ID()', (err, results) => {
                if(err){
                    return res.send(err)
                }
                return res.json({
                    data: results
                })
            });
        }
    });
});

app.get('/commande/add', (req, res) => {
    const {noClient} = req.query;
    const dateNow = Date.now();
    const queryAjoutCommande = `INSERT INTO commande (noClient, dateCreation) VALUES ('${noClient}', '${dateNow}')`;
    connection.query(queryAjoutCommande, (err, results) => {
        if(err){
            return res.send(err)
        }
        else {
            connection.query('SELECT LAST_INSERT_ID()', (err, results) => {
                if(err){
                    return res.send(err)
                }
                return res.json({
                    data: results
                })
            });
        }
    });
});

app.get('/billet/add', (req, res) => {
    const {idPassager, idVol, idCommande, dateDepart, dateArrivee} = req.query;

    const queryAjoutBillet = `INSERT INTO billet (noPassager, noVol, noCommande, dateDepart, dateArrivee) VALUES ('${idPassager}', '${idVol}', '${idCommande}', '${dateDepart}', '${dateArrivee}')`;
    connection.query(queryAjoutBillet, (err, results) => {
        if(err){
            return res.send(err)
        }
        else {
            connection.query('SELECT LAST_INSERT_ID()', (err, results) => {
                if(err){
                    return res.send(err)
                }
                else{
                    return res.send({idCommande : idCommande});
                }
            });
        }
    });
});

app.get('/passager/add', (req, res) => {
    const {nomPassager, prenomPassager} = req.query;

    const queryAjoutPassager = `INSERT INTO passager (nomPassager, prenomPassager) VALUES ('${nomPassager}', '${prenomPassager}')`;
    connection.query(queryAjoutPassager, (err, results) => {
        if(err){
            return res.send(err)
        }
        else {
            connection.query('SELECT LAST_INSERT_ID()', (err, results) => {
                if(err){
                    return res.send(err)
                }
                else{
                    return res.json({
                        data: results
                    })
                }
            });
        }
    });
});




app.listen(process.env.PORT || 3000, () => {
    console.log("Air France's server listening on port "+ (process.env.PORT || 3000 ) )
});
