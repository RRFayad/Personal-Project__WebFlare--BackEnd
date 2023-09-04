const express = require('express');

const router = express.Router();

router.get('/user/:uid', (req, res, next) => {});
router.post('/', (req, res, next) => {});
router.patch('/:oid', (req, res, next) => {});
router.delete('/:oid', (req, res, next) => {});

module.exports = router;
