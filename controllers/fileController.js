
const pool = require('../config/database');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const sharp = require('sharp');
const uuid = require('uuid');


const port= process.env.PORT;



function isValidCSV(row) {
    return row['S. No.'] !== undefined && row['Product Name'] !== undefined && row['Input Image Urls'] !== undefined;
}

// Process each row in the CSV
async function processCSVRows(rows, requestId) {
    for (const row of rows) {
        if (isValidCSV(row)) {
            const productName = row['Product Name'];
            const imageUrls = row['Input Image Urls'].split(',');

            let compressedImageUrls = await Promise.all(
              imageUrls.map((url, index) => processImage(url.trim(), `compressed-image-${row['S No.']}-${productName}-${index + 1}.jpg`))
            );

            const outputImageUrl = compressedImageUrls.join(',');

            const productId = uuid.v4();
            await pool.query('INSERT INTO file_product(id, file_id, product_name) VALUES ($1, $2, $3);', [productId, requestId,productName]);
            await pool.query('INSERT INTO product_images(product_id, input_image_url, output_image_url) VALUES ($1, $2, $3);', [productId, row['Input Image Urls'], outputImageUrl]);
        }
    }
}

// Download, compress, and save the image locally
async function processImage(imageUrl, outputFileName) {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const compressedImageBuffer = await sharp(response.data).jpeg({ quality: 50 }).toBuffer();

        const localDir = path.join(__dirname, 'compressed_images');
        if (!fs.existsSync(localDir)) {
            fs.mkdirSync(localDir);
        }
        const localPath = path.join(localDir, outputFileName);
        fs.writeFileSync(localPath, compressedImageBuffer);

        return `http://localhost:${port}/compressed_images/${outputFileName}`;
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}



exports.uploadCSVFile = async(req,res)=>{
    const rows = [];
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    console.log('reeq file.path :',req.file.path);
    __dirname += '/..';
    console.log('__dirname :',__dirname);

    const filePath = path.join(__dirname, req.file.path);
    
    console.log('file Path : ',filePath);

    const requestId = uuid.v4();
    console.log('hittt ');
    try {
      await pool.query('INSERT INTO csv_file(id, status) VALUES ($1, $2);', [requestId, 'pending']);

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => rows.push(data))
            .on('end', async () => {
                console.log('before called');
                fs.unlinkSync(filePath);
                console.log('after called');
                // Validate the CSV format
                if (!isValidCSV(rows[0])) {
                    return res.status(400).send('CSV file is not properly formatted.');
                }

                try {
                    await processCSVRows(rows, requestId);
                    await pool.query('UPDATE csv_file SET status = $1,completed_at = now() WHERE id = $2', ['completed', requestId]);
                    res.json({ 'request id': requestId });
                } catch (error) {
                    console.log("error process csv row hs: ",error);
                    res.status(500).send('Error processing CSV rows.');
                }
            })
            .on('error', (error) => {
                fs.unlinkSync(filePath);
                res.status(500).send(`Error parsing CSV: ${error.message}`);
            });
    } catch (error) {
        console.log("error :",error);
        res.status(500).send('Error processing CSV.');
    }
};


// get the status of csv file request 
exports.getRequestStatus=async(req,res)=>{
  const { requestId } = req.params;
  try {
      console.log('request id', requestId);
      const result = await pool.query('SELECT status FROM csv_file WHERE id = $1', [requestId]);
      const rows = result.rows;
      if (rows.length === 0) return res.status(404).send('Request ID not found.');
      console.log('hehe');
      res.status(200).send({ requestId, status: rows[0].status });
  } catch (error) {
      console.log('error', error);
      res.status(500).send('Error retrieving status.');
  }
};


exports.webhookCallback=async(req,res)=>{
    const { requestId, status } = req.body;
    try {
        await pool.query('UPDATE csv_file SET status = $1 WHERE id = $2', [status, requestId]);
        res.status(200).send('Webhook processed.');
    } catch (error) {
        res.status(500).send('Error processing webhook.');
    }
};