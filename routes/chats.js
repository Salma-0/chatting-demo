const express = require('express');
const router = express.Router();

router.get('/', (req, res)=> res.render('chat'));

router.get('/test', (req, res)=> {
    res.render('chatt')
})

module.exports = router;