const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const port = 3000;
const cors = require('cors');
const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const imageTitle = req.body.imageTitle || file.fieldname;
        const fileName = `${imageTitle}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, fileName);
    },
});

const upload = multer({ storage });
app.use(cors());
app.use(express.json());

app.post('/data', upload.single('file'), (req, res) => {
    const receivedData = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded!', success: false });
    }

    console.log('Received JSON:', receivedData);
    console.log('File uploaded:', file);

    res.json({ message: 'File uploaded successfully!', success: true, fileName: file.filename });
});
app.get('/data', (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.json({ images: [] });
            }
            return res.status(500).json({ message: 'Unable to scan directory!', error: err });
        }
        if (files.length === 0) {
            return res.json({ images: [] });
        }
        const images = files.map(file => ({
            imageTitle: path.basename(file, path.extname(file)),
            imageURL: path.join('uploads', file),
            fileData: fs.readFileSync(path.join(directoryPath, file)).toString('base64'),
        }));
        res.json({ images });
    });
});
app.delete('/data', (req, res) => {
    const imageTitle = req.query.imageTitle;
    const directoryPath = path.join(__dirname, 'uploads');
    const filePath = path.join(directoryPath, `${imageTitle}`);

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Unable to scan directory!', error: err });
        }
        const fileToDelete = files.find(file =>{
            let basename = path.basename(file, path.extname(file));
            console.log("compared " + basename + " with " + imageTitle);
            return basename === imageTitle;
        });

        if (!fileToDelete) {
            return res.status(404).json({ message: 'File not found!', success: false });
        }

        fs.unlink(path.join(directoryPath, fileToDelete), err => {
            if (err) {
                return res.status(500).json({ message: 'Unable to delete file!', error: err });
            }

            res.json({ message: 'File deleted successfully!', success: true });
        });
    });
}
);
app.listen(port, () => {
    console.log(`API is listening at http://localhost:${port}`);
});
