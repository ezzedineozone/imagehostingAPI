const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const port = 3000;
const app = express();

// Set up multer storage
var fileName = "";
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, fileName);
    },
});

const upload = multer({ storage });

app.use(express.json());

app.post('/data', upload.single('file'), (req, res) => {
    const receivedData = req.body;
    const file = req.file;
    fileName = `${file.fieldname}-${date}.jpeg`;
    if (!file) {
        return res.status(400).json({ message: 'No file uploaded!' , success: false});
    }
    console.log('Received JSON:', receivedData);
    console.log('File uploaded:', file);
    res.json({ message: 'File uploaded successfully!', success: true , fileName: fileName});
});
app.get('/data', (req, res) => {
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
app.delete('/data/:imageTitle', (req, res) => {
    const imageTitle = req.params.imageTitle;
    const imageURL = path.join(__dirname, 'uploads', `${imageTitle}.jpeg`);
}
);
app.listen(port, () => {
    console.log(`API is listening at http://localhost:${port}`);
});
