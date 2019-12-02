const express = require('express');
const router = express.Router();
const plansController = require('../controllers/plansController');
const isAuthorized = require('../middleware/authorization');

router.get('/', isAuthorized, plansController.getPlans).post('/', isAuthorized, plansController.createPlan);

router.get('/:id', isAuthorized, plansController.getPlan).
    put('/:id', isAuthorized, plansController.updatePlan).
    delete('/:id', isAuthorized, plansController.deletePlan);

module.exports = router;
