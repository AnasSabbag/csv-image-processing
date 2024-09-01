const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const multer = require('multer');

const upload = multer({ dest: '../uploads/' });




router.post('/upload-csv-file', upload.single('file'), fileController.uploadCSVFile);

router.get('/status/:requestId', fileController.getRequestStatus);
router.post('/webhook', fileController.webhookCallback);

module.exports = router;










// const express = require('express');
// const router = express.Router();
// const fileController = require('../controllers/fileController');
// const multer = require('multer');
// const upload = multer({ dest: './uploads/'});




// // Define your routes here
// router.post('/upload-csv-file', upload.single('file'), fileController.uploadCSVFile);

// router.get('/status/:requestId', fileController.getRequestStatus);
// router.post('/webhook', fileController.webhookCallback);

// module.exports=router;