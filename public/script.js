let currentPage = 1;
let resultsPerPage = 5;
let allData = [];


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
                <td>${item.credit}</td>
                <td>${item.detail}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    
    document.getElementById('currentPage').innerText = `Trang ${currentPage}`;
}


function changePage(direction) {
    const maxPage = Math.ceil(allData.length / resultsPerPage);
    currentPage += direction;

    if (currentPage < 1) currentPage = 1;
    if (currentPage > maxPage) currentPage = maxPage;

    renderTable();
}
