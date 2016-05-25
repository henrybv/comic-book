'use strict';

const router = require('express').Router();
module.exports = router;

router.get('/', function(req, res, next) {
	if(process.env.NODE_ENV === 'production'){
		res.status(201).send(true);
	} else {
		res.status(201).send(false);
	}
})
