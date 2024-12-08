const express = require('express');
const cors = require('cors');
const fs = require('fs');
var moment = require('moment'); 
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

    // Chuyển đổi startDate và endDate sang đối tượng Date

    // Kiểm tra tính hợp lệ của ngày
    if (isNaN(startDate) || isNaN(endDate)) {
        return res.status(400).json({ error: 'startDate hoặc endDate không hợp lệ' });
    }

    // Đọc dữ liệu từ file (giả sử data là mảng các object với thuộc tính date)
    const data = readDataFromFile();

    // Lọc dữ liệu theo ngày trong khoảng từ startDate đến endDate
    const filteredData = data.filter(item => {
        const itemDate = convertToDate(item.date); // Giả sử cột ngày có tên là "date"

        // Kiểm tra xem itemDate có nằm trong khoảng từ startDate đến endDate không
        return itemDate >= startDate && itemDate <= endDate;
    });

    // Trả về dữ liệu đã lọc
    res.json(filteredData);
});



