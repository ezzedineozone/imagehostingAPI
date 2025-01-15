const express = require('express');
const app = express();
const port = 3000;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
app.use(express.json());
//sample json body for POST
/*
{
    "imageId": // statically generated,
    "imageTitle": title_submitted_by_user,
    "imageURL": subdirectory to be stored at
    "imageData": actual image data
}*/
app.post('/data', (req, res) => {
    const receivedData = req.body;
    const file = req.file;
    if(!file){
        return res.status(400).json({ message: 'No file uploaded!' });
    }
    const imageId = Date.now();
    const imageTitle = `${receivedData.imageTitle}_${imageId}`;
    const imageURL = path.join(__dirname, 'uploads', `${imageTitle}.jpeg`);

    fs.writeFile(imageURL, receivedData.imageData, 'base64', (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error saving image!', error: err });
        }
        console.log('Image saved successfully:', imageURL);
    });
    console.log('Received JSON:', receivedData);
    res.json({ message: 'Data received!', receivedData });
});
app.get('/data', (req, res) => {
    res.json({ message: 'GET request received!' });
    const directoryPath = path.join(__dirname, 'uploads');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Unable to scan directory!', error: err });
        }
        const images = files.map(file => ({
            imageTitle: path.basename(file, path.extname(file)),
            imageURL: path.join('uploads', file)
        }));
        res.json({ images });
    });

});
app.listen(port, () => {
    console.log(`API is listening at http://localhost:${port}`);
});
