const express = require('express');

const URL_EXT = "https://airtechapione.azurewebsites.net";

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        res.json({
            data: URL_EXT
        })
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
