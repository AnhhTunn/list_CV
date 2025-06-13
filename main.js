const api_products = "https://673b2887339a4ce4451ae2d9.mockapi.io/products";
const display_item = document.getElementById("display_item");
const txtID = document.getElementById("txtID");
const txtName = document.getElementById("txtName");
const txtTitle = document.getElementById("txtTitle");
const txtPrice = document.getElementById("txtPrice");
const txtEXP = document.getElementById("txtEXP");
const getMadeIn = document.querySelectorAll("input[type='radio'][name='madein']")
const fileImg = document.getElementById("fileImg")
const loadingDialog = document.getElementById("loadingDialog")
const btnClear = document.getElementById("btnClear")

//Hàm reset form
const reset = () => {
    txtID.value = "";
    txtName.value = "";
    txtTitle.value = "";
    txtPrice.value = "";
    txtEXP.value = "";
    getMadeIn.forEach(item => {
        item.checked = false
    })
}
loadingDialog.showModal()

// Hàm gọi API
const getApi = async (url, options = {}) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error("Lỗi mạng");
        return await response.json();
    } catch (error) {
        console.error("❌ Fetch lỗi:", error);
        return [];
    }
};

// Hàm hiển thị dữ liệu
const display = (list_products = []) => {
    if (list_products.length === 0) {
        display_item.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">Không có data</td>
            </tr>
        `;
        return;
    }

    const html = list_products.map(item => {
        const { id, name, title, price, date, madein } = item;
        return `
            <tr>
                <td>${id}</td>
                <td>${name}</td>
                <td>${title}</td>
                <td>${price}</td>
                <td>${date}</td>
                <td>${madein}</td>
                <td>
                    <div class="d-flex justify-content-center gap-2">
                        <button onclick="btnEdit(${id})" class="btn btn-sm btn-warning">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="btnDelete(${id})" class="btn btn-sm btn-danger">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
    display_item.innerHTML = html;
};

// Hàm load dữ liệu và hiển thị
const getData = async () => {
    try {
        loadingDialog.showModal(); // Hiển thị loading
        const products = await getApi(api_products);
        display(products);
    } catch (error) {
        Swal.fire("Lỗi khi tải dữ liệu", error.message, "error");
    } finally {
        loadingDialog.close();
    }
};
getData();

const btnSave = document.getElementById("btnSave");

const addProduct = async () => {
    const result = await Swal.fire({
        title: "Bạn có muốn lưu sản phẩm này?",
        icon: "question",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Lưu",
        denyButtonText: "Không lưu"
    });

    if (!result.isConfirmed) return;

    const madein = [...getMadeIn].find(item => item.checked)?.value || "";

    const product = {
        name: txtName.value.trim(),
        title: txtTitle.value.trim(),
        price: parseFloat(txtPrice.value),
        date: txtEXP.value,
        madein
    };

    try {
        loadingDialog.showModal();
        const response = await fetch(api_products, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product)
        });

        if (!response.ok) throw new Error("❌ Thêm sản phẩm thất bại");

        console.log("✅ Thêm sản phẩm thành công");
        await getData();
        reset();
        Swal.fire("Đã thêm!", "Sản phẩm đã được thêm thành công.", "success");
    } catch (error) {
        console.error("❌ Lỗi khi thêm sản phẩm:", error);
        Swal.fire("Lỗi!", "Không thể thêm sản phẩm.", "error");
    } finally {
        loadingDialog.close();
    }
};


btnSave.onclick = addProduct;

const btnDelete = async (id) => {
    const result = await Swal.fire({
        title: "Bạn chắc chắn muốn xóa?",
        text: "Thao tác này không thể hoàn tác!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy"
    });

    if (!result.isConfirmed) return;
    try {
        loadingDialog.showModal();
        const response = await fetch(`${api_products}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error(`Xóa thất bại với ID: ${id}`);

        await getData();
        Swal.fire("Đã xóa!", `Sản phẩm có ID ${id} đã bị xóa.`, "success");
    } catch (error) {
        console.error("❌ Lỗi khi xóa:", error);
        Swal.fire("Lỗi!", "Xảy ra lỗi khi xóa sản phẩm.", "error");
    } finally {
        loadingDialog.close();
    }
};

const btnEdit = async (id) => {
    try {
        loadingDialog.showModal();

        const response = await fetch(`${api_products}/${id}`);
        if (!response.ok) throw new Error("Không lấy được sản phẩm");

        const { id: editId, name, title, price, date, madein } = await response.json();

        txtID.value = editId;
        txtName.value = name;
        txtTitle.value = title;
        txtPrice.value = price;
        txtEXP.value = date;

        // Set radio madein
        [...getMadeIn].forEach(item => item.checked = item.value === madein);

        btnSave.textContent = "Edit";
        btnSave.onclick = () => updateItem(id);

    } catch (error) {
        console.error("❌ Lỗi khi lấy thông tin:", error);
        Swal.fire("Lỗi!", error.message, "error");
    } finally {
        loadingDialog.close();
    }
};

const updateItem = async (id) => {
    const result = await Swal.fire({
        title: "Bạn có muốn lưu thay đổi?",
        icon: "question",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Lưu",
        denyButtonText: "Không lưu"
    });

    if (!result.isConfirmed) return;

    try {
        loadingDialog.showModal();

        const madein = [...getMadeIn].find(item => item.checked)?.value || "";

        const updatedProduct = {
            name: txtName.value.trim(),
            title: txtTitle.value.trim(),
            price: parseFloat(txtPrice.value),
            date: txtEXP.value,
            madein
        };

        const response = await fetch(`${api_products}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedProduct)
        });

        if (!response.ok) throw new Error("Sửa sản phẩm thất bại");

        console.log("✅ Sửa thành công");
        await getData();

        Swal.fire(`Đã sửa sản phẩm mã: ${id}`, "", "success");

        // Reset về trạng thái thêm
        reset();
        btnSave.textContent = "Save";
        btnSave.onclick = addProduct;

    } catch (error) {
        console.error("❌ Lỗi khi sửa:", error);
        Swal.fire("Lỗi!", error.message, "error");
    } finally {
        loadingDialog.close();
    }
};
