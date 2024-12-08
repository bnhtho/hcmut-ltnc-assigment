let allData = [];
let currentPage = 1;
let resultsPerPage = 5;
let debounceTimer;
// Gọi API để tải dữ liệu và hiển thị bảng
function performSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const searchTerm = document.getElementById('searchInput').value;
        resultsPerPage = parseInt(document.getElementById('resultsPerPage').value);
        currentPage = 1;

        document.getElementById('resultsTableBody').innerHTML = `
            <tr><td colspan="5">Đang tải dữ liệu...</td></tr>
        `;

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
    }, 300);
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
        console.log(item)
        const row = `
            <tr>
                <td>${startIndex + index + 1}</td>
                <td>${item.date}</td>
                <td>${item.time}</td>
                <td>${item.credit ? item.credit.toLocaleString() : item.debit.toLocaleString()}</td>
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
    const maxVisiblePages = 8; // Số trang hiển thị liền kề

    // Tính toán phạm vi trang cần hiển thị
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Điều chỉnh lại startPage nếu endPage chạm đến cuối
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Nút "First"
    if (startPage > 1) {
        const firstButton = document.createElement('button');
        firstButton.innerText = 'First';
        firstButton.onclick = () => {
            currentPage = 1;
            renderTable();
            renderPagination();
        };
        paginationContainer.appendChild(firstButton);
    }

    // Nút "Previous"
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.innerText = 'Prev';
        prevButton.onclick = () => {
            currentPage--;
            renderTable();
            renderPagination();
        };
        paginationContainer.appendChild(prevButton);
    }

    // Các trang liền kề
    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.onclick = () => {
            currentPage = i;
            renderTable();
            renderPagination();
        };
        paginationContainer.appendChild(button);
    }

    // Nút "Next"
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.innerText = 'Next';
        nextButton.onclick = () => {
            currentPage++;
            renderTable();
            renderPagination();
        };
        paginationContainer.appendChild(nextButton);
    }

    // Nút "Last"
    if (endPage < totalPages) {
        const lastButton = document.createElement('button');
        lastButton.innerText = 'Last';
        lastButton.onclick = () => {
            currentPage = totalPages;
            renderTable();
            renderPagination();
        };
        paginationContainer.appendChild(lastButton);
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
// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');  // Lấy ngày và thêm số 0 nếu ngày < 10
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Lấy tháng, nhớ cộng thêm 1 vì tháng bắt đầu từ 0
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

function applyDateFilter() {
    const startDateInput = document.getElementById('startDate').value;
    const endDateInput = document.getElementById('endDate').value;
    console.log(formatDate(startDateInput))
    // Kiểm tra xem người dùng có nhập ngày bắt đầu và ngày kết thúc không
    if (!startDateInput || !endDateInput) {
        alert("Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc.");
        return;
    }
    // Convert sang kiểu /

    // // Chuyển đổi ngày từ DD/MM/YYYY sang YYYY-MM-DD
    const startDate = formatDate(startDateInput);
    const endDate = formatDate(endDateInput);
    // console.log(startDate)

    // // Gửi yêu cầu API với ngày đã chuyển đổi
    axios.get(`http://localhost:8080/api/search?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`)
        .then(response => {
    //         // Dữ liệu nhận được từ API
            const filteredData = response.data;
            console.log(filteredData)
    //         // Cập nhật allData với dữ liệu đã lọc từ API
            allData = filteredData;

    //         // Cập nhật trang hiện tại và render lại bảng
            currentPage = 1;
            renderTable();
            renderPagination();
        })
        .catch(error => {
            console.error('Lỗi khi gọi API:', error);
            document.getElementById('resultsTableBody').innerHTML = `
                <tr><td colspan="5">Lỗi khi tải dữ liệu. Hãy thử lại!</td></tr>
        `;
        });
}



// Lọc dữ liệu khi ô tìm kiếm được thay đổi
function searchByTerm(term) {
    const filteredData = allData.filter(item => {
        return item.id.includes(term) || item.credit.includes(term) || item.sender.includes(term);
    });

    allData = filteredData;
    currentPage = 1;
    renderTable();
    // renderPagination();
}
