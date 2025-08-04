const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');

router.post('/register', adminCtrl.register);
router.post('/login', adminCtrl.login);
router.put('/update', auth, adminCtrl.update);
router.delete('/delete', auth, adminCtrl.delete);

module.exports = router;
