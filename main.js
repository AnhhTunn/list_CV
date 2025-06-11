const API_URL = "https://673b2887339a4ce4451ae2d9.mockapi.io/Users";

const elements = {
    name: document.getElementById('txtCV'),
    checkStatus: document.querySelectorAll('input[type="radio"][name="status"]'),
    displayItem: document.getElementById('display_item'),
    btnEdit: document.getElementById('btnEdit'),
    btnSearch: document.getElementById('btnSearch'),
    btnAdd: document.getElementById('btnAdd'),
    userDialog: document.getElementById('userDialog'),
    pagination: document.getElementById("phan_trang"),
};

let currentPage = 1;
const limit = 5;
let idEdit = null;

// Utility functions
const fetchAPI = async (url, options = {}) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
    } catch (error) {
        console.error("API Error:", error);
        return null;
    }
};

const showDialog = (isLoading = true) => {
    isLoading ? elements.userDialog.showModal() : elements.userDialog.close();
};

const resetForm = () => {
    elements.name.value = "";
    elements.checkStatus.forEach((item) => (item.checked = false));
};

// Pagination setup
const setupPagination = async (current) => {
    const data = await fetchAPI(API_URL);
    if (!data) return;

    const total = data.length;
    const totalPages = Math.ceil(total / limit);

    elements.pagination.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = i === current ? "active" : "";
        btn.onclick = () => restart(i);
        elements.pagination.appendChild(btn);
    }
};

// Display items
const displayItems = (items = []) => {
    if (items.length === 0) {
        elements.displayItem.innerHTML = "No data";
        return;
    }

    elements.displayItem.innerHTML = items.map(({ id, nameCV, status }) => `
        <tr>
            <td>${nameCV}</td>
            <td>${status}</td>
            <td>
                <div class="list_btn_js">
                    <button class="detail" onclick="btnDetail(${id})">Detail</button>
                    <button class="delete" onclick="btnDelete(${id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join("");
};

// Restart (Fetch and display items)
const restart = async (page = 1) => {
    showDialog();
    const data = await fetchAPI(`${API_URL}?limit=${limit}&page=${page}`);
    if (data) {
        displayItems(data);
        await setupPagination(page);
    }
    showDialog(false);
};  

// Add new item
const addItem = async () => {
    const status = [...elements.checkStatus].find((item) => item.checked)?.value;
    const name = elements.name.value.trim();

    if (!name || !status) {
        alert("Please fill out all fields");
        return;
    }

    showDialog();
    elements.btnAdd.disabled = true;

    const newItem = { nameCV: name, status };
    const result = await fetchAPI(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
    });

    if (result) {
        restart();
        resetForm();
    }
    elements.btnAdd.disabled = false;
    showDialog(false);
};

// Detail/Edit item
const btnDetail = async (id) => {
    showDialog();
    const item = await fetchAPI(`${API_URL}/${id}`);
    if (item) {
        elements.name.value = item.nameCV;
        [...elements.checkStatus].forEach((radio) => {
            radio.checked = radio.value === item.status;
        });
        idEdit = id;
        elements.btnEdit.style.display = "block";
    }
    showDialog(false);
};

const editItem = async () => {
    const status = [...elements.checkStatus].find((item) => item.checked)?.value;
    const name = elements.name.value.trim();

    if (!name || !status) {
        alert("Please fill out all fields");
        return;
    }

    showDialog();
    const updatedItem = { nameCV: name, status };
    const result = await fetchAPI(`${API_URL}/${idEdit}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
    });

    if (result) {
        restart();
        resetForm();
        elements.btnEdit.style.display = "none";
    }
    showDialog(false);
};

// Delete item
const btnDelete = async (id) => {
    showDialog();
    const result = await fetchAPI(`${API_URL}/${id}`, { method: "DELETE" });
    if (result) restart();
    showDialog(false);
};

// Search items
const searchItems = async (page = 1) => {
    const statusFilter = document.getElementById("cbbStatus").value;
    const searchName = elements.name.value.trim();

    showDialog();
    const data = await fetchAPI(API_URL);
    if (!data) return;

    // Lọc kết quả theo trạng thái và tên
    let filteredItems = data;
    if (statusFilter !== "All") {
        filteredItems = filteredItems.filter((item) => item.status === statusFilter);
    }
    if (searchName) {
        filteredItems = filteredItems.filter((item) => item.nameCV.includes(searchName));
    }

    if (filteredItems.length === 0) {
        Swal.fire({
            title: "Search",
            text: `No items found for "${searchName}"`,
            icon: "info",
        });
        elements.displayItem.innerHTML = "No data";
        elements.pagination.innerHTML = ""; // Xóa nút phân trang
        showDialog(false);
        return;
    }
    // const totalPages = Math.ceil(filteredItems.length / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filteredItems.filter((_, index) => index >= startIndex && index < endIndex);
    displayItems(paginatedItems);
    setupPaginationForSearch(filteredItems.length, page);
    showDialog(false);
};
const setupPaginationForSearch = (totalItems, currentPage) => {
    const totalPages = Math.ceil(totalItems / limit);

    elements.pagination.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = i === currentPage ? "active" : "";
        btn.onclick = () => searchItems(i); 
        elements.pagination.appendChild(btn);
    }
};


// Event listeners
elements.btnAdd.onclick = addItem;
elements.btnEdit.onclick = editItem;
elements.btnSearch.onclick = () => searchItems(1);

// Initialize
restart(currentPage);
