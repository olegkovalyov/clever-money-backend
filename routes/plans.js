const express = require('express');
const router = express.Router();
const plansController = require('../controllers/plansController');

router.get('/', plansController.getPlans).post('/', plansController.createPlan);

router.get('/:id', plansController.getPlan).
    put('/:id', plansController.updatePlan).
    delete('/:id', plansController.deletePlan);

module.exports = router;
