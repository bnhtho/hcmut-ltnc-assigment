let allData = [];
let currentPage = 1;
let resultsPerPage = 5;

// Gọi API để tải dữ liệu và hiển thị bảng
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value;
    resultsPerPage = parseInt(document.getElementById('resultsPerPage').value);
    currentPage = 1;

    axios.get(`http://localhost:8080/api/data?term=${encodeURIComponent(searchTerm)}`)
        .then(response => {
            allData = response.data;
            renderTable();
        })
        .catch(error => {
            console.error('Lỗi khi gọi API:', error);
            document.getElementById('resultsTableBody').innerHTML = `
                <tr><td colspan="5">Lỗi khi tải dữ liệu. Hãy thử lại!</td></tr>
            `;
        });
}

// Hiển thị bảng kết quả
function renderTable() {
    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = '';

    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const currentData = allData.slice(startIndex, endIndex);

    if (currentData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">Không tìm thấy dữ liệu</td></tr>`;
        return;
    }

    currentData.forEach((item, index) => {
        const row = `
            <tr>
                <td>${item.date}</td>
                <td>${item.id}</td>
                <td>${item.credit}</td>
                <td>${item.sender}</td>
                <td>${item.detail}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    renderPagination();
}

// Hiển thị phân trang
function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(allData.length / resultsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        button.classList.add(i === currentPage ? 'active' : '');
        button.onclick = () => {
            currentPage = i;
            renderTable();
            renderPagination();
        };

        paginationContainer.appendChild(button);
    }
}

// Hiển thị hoặc ẩn menu thả xuống
function toggleFilterMenu() {
    const menu = document.getElementById('filterMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Sắp xếp theo ngày giao dịch
function sortTableByDate(order) {
    allData.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return order === 'asc' ? dateA - dateB : dateB - dateA;
    });

    toggleFilterMenu();
    renderTable();
}

// Sắp xếp theo số tiền
function sortTableByAmount(order) {
    allData.sort((a, b) => {
        const amountA = parseFloat(a.credit.replace(/[^0-9.-]+/g, ''));
        const amountB = parseFloat(b.credit.replace(/[^0-9.-]+/g, ''));
        return order === 'asc' ? amountA - amountB : amountB - amountA;
    });

    toggleFilterMenu();
    renderTable();
}

// Lọc theo khoảng ngày
function applyDateFilter() {
    const startDateInput = document.getElementById('startDate').value;
    const endDateInput = document.getElementById('endDate').value;

    const startDate = startDateInput ? new Date(startDateInput) : null;
    const endDate = endDateInput ? new Date(endDateInput) : null;

    const filteredData = allData.filter(item => {
        const itemDate = new Date(item.date);

        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;

        return true;
    });

    allData = filteredData;
    currentPage = 1;
    renderTable();
    renderPagination();
}

// Lọc theo tìm kiếm
document.getElementById('searchInput').addEventListener('input', performSearch);

// Lọc dữ liệu khi ô tìm kiếm được thay đổi
function searchByTerm(term) {
    const filteredData = allData.filter(item => {
        return item.id.includes(term) || item.credit.includes(term) || item.sender.includes(term);
    });

    allData = filteredData;
    currentPage = 1;
    renderTable();
    renderPagination();
}
