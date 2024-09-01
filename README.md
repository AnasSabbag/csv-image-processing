
**Image Processing System from CSV Files**
Overview
This project is designed to efficiently process image data extracted from CSV files. It provides robust APIs for uploading CSV files, validating their format, tracking processing status, and storing the results. The system is also equipped with asynchronous workers that handle image processing tasks in the background, ensuring smooth and efficient operations.

**Features**
Upload API: Accepts CSV files, validates their format, and returns a unique request ID for tracking.
Status API: Allows users to query the processing status using the request ID.
Asynchronous Workers: Automatically processes images in the background and updates the status in real-time.

**API Documentation**
Upload API
**Endpoint: {{baseUrl}}/upload-csv-file**
Method: POST
Description: Accepts a CSV file, validates its formatting, and returns a unique request ID.
Request Parameters:
file (File): The CSV file containing data in the format [S.No., Product_Name, ImageUrl].
Response:
requestId (UUID): The unique identifier for the processing request.
Status API
**Endpoint: /status/:requestId**
Method: GET
Description: Returns the current status of the processing request.
Request Parameters:
requestId (UUID): The unique identifier of the processing request.
Response:
requestId (UUID): The unique identifier of the request.
status (String): The current status of the request (e.g., pending, processing, completed).

**Asynchronous Workers**

The system leverages asynchronous workers to handle the image processing tasks in the background, ensuring the main application remains responsive. 
These workers are responsible for:

Reading the CSV file and extracting the image URLs.
Downloading and compressing the images.
Storing the compressed image URLs in the database.
Updating the processing status in the csv_file table.
