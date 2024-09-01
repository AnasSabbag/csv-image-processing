const express = require('express');
require('dotenv').config();
const fileRoutes = require('./routes/fileRoutes');
const path = require('path');
const app = express();

const port = process.env.PORT;


app.use(express.json());



app.use('/file',fileRoutes)

// serve the 'compressed_images' directory as static files
app.use('/compressed_images', express.static(path.join(__dirname, 'compressed_images')));


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
