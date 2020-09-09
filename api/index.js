const express = require('express');

const aeroports = require('./aeroports');
const billets = require('./billets');
const clients = require('./clients');
const commandes = require('./commandes');
const passagers = require('./passagers');
const vols = require('./vols');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API version 1 !'
  });
});

router.use('/aeroport', aeroports);
router.use('/billet', billets);
router.use('/client', clients);
router.use('/commande', commandes);
router.use('/passager', passagers);
router.use('/vol', vols);

module.exports = router;
