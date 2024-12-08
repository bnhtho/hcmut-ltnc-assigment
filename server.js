const express = require('express');
const cors = require('cors');
const fs = require('fs'); 
const app = express();
const port = 8080;

// Đọc dữ liệu từ file json
const readDataFromFile = () => {
    const rawData = fs.readFileSync('data.json');
    return JSON.parse(rawData);
};

app.use(cors());

app.get('/api/data', (req, res) => {
    const searchTerm = req.query.term;

    if (!searchTerm) {
        return res.status(400).json({ error: 'Missing search term' });
    }

    const data = readDataFromFile();

    const filteredData = data.filter(item =>
        item.detail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    res.json(filteredData);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
