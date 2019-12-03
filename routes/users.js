const express = require('express');
const isAuthorized = require('../middleware/authorization');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.post('/login', usersController.login);
router.post('/register', usersController.createUser);

router.get('/', isAuthorized, usersController.getUsers).post('/', isAuthorized, usersController.createUser);

router.get('/:id', isAuthorized, usersController.getUser).
    put('/:id', isAuthorized, usersController.updateUser).
    delete('/:id', isAuthorized, usersController.deleteUser);

module.exports = router;
