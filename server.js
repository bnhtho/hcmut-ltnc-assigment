const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = 8080;
const path = require('path');
// Đọc dữ liệu từ file json

const readDataFromFile = () => {

    const filePath = path.join(__dirname, 'data', 'data.json');
    const rawData = fs.readFileSync(filePath, 'utf-8'); // Đọc file và chỉ định encoding là 'utf-8'
    return JSON.parse(rawData);
};

app.use(cors());

app.get('/api/data', (req, res) => {
    const searchTerm = req.query.term;

    const data = readDataFromFile();
    
    if (!searchTerm) {
        return res.json(data);
    }

    const filteredData = data.filter(item =>
        item.detail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    res.json(filteredData);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get('/api/search', (req, res) => {
    const { startDate, endDate } = req.query;

    // Kiểm tra các tham số
    if (!startDate) {
        return res.status(400).json({ error: 'Vui lòng cung cấp startDate' });
    }
    if (!endDate) {
        return res.status(400).json({ error: 'Vui lòng cung cấp endDate' });
    }

    if (isNaN(startDate) || isNaN(endDate)) {
        return res.status(400).json({ error: 'startDate hoặc endDate không hợp lệ' });
    }

    const data = readDataFromFile();

    const filteredData = data.filter(item => {
        const itemDate = convertToDate(item.date);
        return itemDate >= startDate && itemDate <= endDate;
    });

    // Trả về dữ liệu đã lọc
    res.json(filteredData);
});



