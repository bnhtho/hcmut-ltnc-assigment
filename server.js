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

// Demo: lọc theo ngày
app.get('/api/search', (req, res) => {
    const { startDate } = req.query;

    // Đọc dữ liệu từ file (giả sử data là mảng các object với thuộc tính date)
    const data = readDataFromFile();

    // Kiểm tra các tham số
    if (!startDate) {
        return res.status(400).json({ error: 'Vui lòng cung cấp startDate' });
    }

    // Chuyển đổi startDate sang đối tượng Date
    const start = new Date(startDate);
    if (isNaN(start)) {
        return res.status(400).json({ error: 'startDate không hợp lệ' });
    }

    // Lọc dữ liệu theo ngày
    const filteredData = data.filter(item => {
        const itemDate = new Date(item.date); // Giả sử cột ngày có tên là "date"
        return itemDate.getTime() === start.getTime(); // So sánh chính xác thời gian
    });

    res.json(filteredData);
});