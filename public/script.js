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
                renderPagination();
            })
            .catch(error => {
                console.error('Lỗi khi gọi API:', error);
                document.getElementById('resultsTableBody').innerHTML = `
                    <tr><td colspan="5">Lỗi khi tải dữ liệu. Hãy thử lại!</td></tr>
                `;
            });
    }, 300);
}



// Hàm cập nhật tổng thu
function updateTotalAmount() {
    // Tính tổng giá trị cột 'credit' từ toàn bộ dữ liệu
    console.log(allData)
    const totalCredit = allData.reduce((sum, item) => {
        const credit = item.credit || 0;
        const debit = item.debit || 0;
        return sum + (credit - debit);
    }, 0);

    // Cập nhật giá trị vào phần tử HTML với id 'totalAmount'
    const totalAmountElement = document.getElementById('totalAmount');
    if (totalAmountElement) {
        
        totalAmountElement.textContent = totalCredit.toLocaleString();
    }

    
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
                <td>${startIndex + index + 1}</td>
                <td>${item.date}</td>
                <td>${item.time}</td>
                <td class="creditDetail">+${item.credit ? item.credit.toLocaleString() : "-" + item.debit.toLocaleString()}</td>
                <td>${item.detail}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    updateTotalAmount()
// Lấy tổng thu
}

// Hiển thị phân trang
function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(allData.length / resultsPerPage);
    const maxVisiblePages = 8;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        const firstButton = document.createElement('button');
        firstButton.innerText = 'First';
        firstButton.onclick = () => {
            currentPage = 1;
            renderTable();
        };
        paginationContainer.appendChild(firstButton);
    }

    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.innerText = 'Prev';
        prevButton.onclick = () => {
            currentPage--;
            renderTable();
        };
        paginationContainer.appendChild(prevButton);
    }

    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.onclick = () => {
            currentPage = i;
            renderTable();
        };
        paginationContainer.appendChild(button);
    }

    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.innerText = 'Next';
        nextButton.onclick = () => {
            currentPage++;
            renderTable();
        };
        paginationContainer.appendChild(nextButton);
    }

    if (endPage < totalPages) {
        const lastButton = document.createElement('button');
        lastButton.innerText = 'Last';
        lastButton.onclick = () => {
            currentPage = totalPages;
            renderTable();
        };
        paginationContainer.appendChild(lastButton);
    }
}

// Toggle menu thả xuống
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

    toggleFilterMenu(); // Ẩn menu sau khi sắp xếp
    renderTable();
}

// Sắp xếp theo số tiền
function sortTableByAmount(order) {
    allData.sort((a, b) => {
        // Tính toán số tiền thực sự từ credit và debit
        const amountA = a.credit - a.debit;
        const amountB = b.credit - b.debit;

        // Sắp xếp theo thứ tự tăng hoặc giảm dần
        return order === 'asc' ? amountA - amountB : amountB - amountA;
    });

    toggleFilterMenu(); 
    renderTable();      
}

// Lọc dữ liệu khi ô tìm kiếm được thay đổi
function searchByTerm(term) {
    const filteredData = allData.filter(item => {
        return item.id.includes(term) || 
               (item.credit && item.credit.includes(term)) || 
               (item.debit && item.debit.includes(term)) || 
               item.detail.includes(term);
    });

    currentPage = 1;
    allData = filteredData;
    renderTable();
}



