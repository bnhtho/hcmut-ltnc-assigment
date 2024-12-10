const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = 8080;
const path = require('path');

// Đọc dữ liệu từ file JSON
const readDataFromFile = () => {
    const filePath = path.join(__dirname, 'data', 'data.json');
    const rawData = fs.readFileSync(filePath, 'utf-8'); // Đọc file và chỉ định encoding là 'utf-8'
    return JSON.parse(rawData);
};

app.use(cors());

function buildLPS(pattern) {
    let lps = Array(pattern.length).fill(0);
    let length = 0;
    let i = 1;

    while (i < pattern.length) {
        if (pattern[i] === pattern[length]) {
            length++;
            lps[i] = length;
            i++;
        } else {
            if (length !== 0) {
                length = lps[length - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }
    return lps;
}

// Hàm tìm kiếm KMP
function kmpSearch(text, pattern) {
    let lps = buildLPS(pattern);
    let i = 0; // Chỉ số cho text
    let j = 0; // Chỉ số cho pattern

    while (i < text.length) {
        if (pattern[j] === text[i]) {
            i++;
            j++;
        }

        if (j === pattern.length) {
            return true; 
        } else if (i < text.length && pattern[j] !== text[i]) {
            if (j !== 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }
    return false; 
}

app.get('/api/data', (req, res) => {
    const searchTerm = req.query.term;
    const data = readDataFromFile();

    if (!searchTerm) {
        return res.json(data);
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filteredData = data.filter(item =>
        kmpSearch(item.detail.toLowerCase(), lowerCaseSearchTerm)
    );

    res.json(filteredData);
});

// Hàm chuyển đổi ngày từ định dạng 'dd/mm/yyyy' sang 'yyyy-mm-dd' để so sánh
function convertToDate(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`);
}


// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
