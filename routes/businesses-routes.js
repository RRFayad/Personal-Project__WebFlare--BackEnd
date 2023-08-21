const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {});
router.get('/users/:uid', (req, res, next) => {});
router.get('/:bid', (req, res, next) => {});
router.post('/', (req, res, next) => {});
router.patch('/:bid', (req, res, next) => {});
router.delete('/:bid', (req, res, next) => {});

module.exports = router;
