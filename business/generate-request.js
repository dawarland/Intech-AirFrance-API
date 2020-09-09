function generateRequestBillet(vols, passagers, idCommande, dateDepart, dateArrivee){
    let requests = [];
    passagers.forEach( (p) => {
        requests.push("INSERT INTO passager (nomPassager, prenomPassager) VALUES ('"+p.nomPassager+"', '"+ p.prenomPassager+"')");
        vols.forEach( (v) => {
            requests.push("INSERT INTO billet (noPassager, noVol, noCommande, dateDepart, dateArrivee) VALUES ('"+p.idPassager+"', '"+v+"', '"+idCommande+"', '"+dateDepart+"', '"+dateArrivee+")");
        });
    });
    return requests;
}

function generateRequestCommande(noClient)  {
    let requests = [];
    requests.push("INSERT INTO commande (noClient, dateCreation) VALUES ('"+noClient+"', now())");
    return requests;
}

module.exports = {
    generateRequestBillet,
    generateRequestCommande
};
