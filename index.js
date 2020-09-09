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
    const {nom, prenom, dateDepart, dateArrivee, idAeroportDepart, idAeroportArrivee} = req.query;

    const queryAjoutUser = `INSERT INTO passager (nomPassager, prenomPassager) VALUES ('${nom}', '${prenom}')`;
    // const querySelectVol = `SELECT * FROM vol WHERE noAeroportDepart = ${idAeroportDepart} OR noAeroportDepart = ${idAeroportDepart}`;
    const querySelectVol = `SELECT vol.idVol , aeroport1.nomAeroport AS "Depart", aeroport2.nomAeroport AS "Arrivee", vol.prixVol 
FROM vol AS vol
JOIN aeroport AS aeroport1 ON vol.noAeroportDepart = aeroport1.idAeroport
JOIN aeroport AS aeroport2 ON vol.noAeroportArrivee = aeroport2.idAeroport
WHERE
 noAeroportDepart = ${idAeroportDepart} OR noAeroportArrivee = ${idAeroportArrivee} OR noAeroportDepart = ${idAeroportArrivee} OR noAeroportArrivee = ${idAeroportDepart}`;
    connection.query(queryAjoutUser, (err, results) => {
        if(err){
            console.log("erreur insert user");
            return res.send(err)
        }
        else {
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
        }
    });
});
app.post('/vol/add', (req, res) => {
    const {name, price} = req.query;
    const queryAjout = `INSERT INTO vol (name, price) VALUES ('${name}', '${price}')`;
    connection.query(queryAjout, (err, results) => {
        if(err){
            return res.send(err)
        }
        else {
            return res.send('succesfully')
        }
    });
});




app.listen(4000, () => {
    console.log("Products server listening on port 4000")
});