const express = require('express');
const isAuthorized = require('../middleware/authorization');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.post('/login', usersController.login);
router.post('/register', usersController.createUser);

router.get('/', usersController.getUsers).post('/', usersController.createUser);

router.get('/:id', usersController.getUser).
    put('/:id', usersController.updateUser).
    delete('/:id', usersController.deleteUser);

module.exports = router;
