
const sampleBooks = [
    { id: "BK-101", title: "Pride and Prejudice", author: "Jane Austen", category: "Literature", quantity: 8, available: 6, color: "#773c39" },
    { id: "BK-102", title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", quantity: 6, available: 3, color: "#b18a48" },
    { id: "BK-103", title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", quantity: 5, available: 4, color: "#355a4b" },
    { id: "BK-104", title: "The Art of War", author: "Sun Tzu", category: "Philosophy", quantity: 7, available: 7, color: "#394d68" },
    { id: "BK-105", title: "The Discovery of India", author: "Jawaharlal Nehru", category: "History", quantity: 4, available: 2, color: "#80583e" },
    { id: "BK-106", title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", quantity: 8, available: 6, color: "#6c4d76" },
    { id: "BK-107", title: "The Complete Works", author: "William Shakespeare", category: "Literature", quantity: 6, available: 5, color: "#874a38" },
    { id: "BK-108", title: "Cosmos", author: "Carl Sagan", category: "Science", quantity: 4, available: 3, color: "#3e6972" }
];

const sampleLoans = [
    { id: 1, bookId: "BK-101", student: "Ananya Sharma", date: "2026-10-20", returned: false },
    { id: 2, bookId: "BK-102", student: "Rahul Mehta", date: "2026-10-21", returned: false },
    { id: 3, bookId: "BK-103", student: "Priya Das", date: "2026-10-22", returned: false },
    { id: 4, bookId: "BK-105", student: "Arjun Roy", date: "2026-10-23", returned: false },
    { id: 5, bookId: "BK-106", student: "Mira Sen", date: "2026-10-24", returned: false },
    { id: 6, bookId: "BK-107", student: "Kabir Bose", date: "2026-10-25", returned: false }
];

function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        return fallback;
    }
}

let books = loadData("grandLibraryBooks", sampleBooks);
let loans = loadData("grandLibraryLoans", sampleLoans);

let availabilityChart = null;
let categoryChart = null;

const $ = id => document.getElementById(id);

function saveData() {
    localStorage.setItem("grandLibraryBooks", JSON.stringify(books));
    localStorage.setItem("grandLibraryLoans", JSON.stringify(loans));
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function getBook(id) {
    return books.find(book => book.id === id);
}

function getIssuedCount(bookId) {
    return loans.filter(loan => loan.bookId === bookId && !loan.returned).length;
}

function getTotalCopies() {
    return books.reduce((sum, book) => sum + book.quantity, 0);
}

function getAvailableCopies() {
    return books.reduce((sum, book) => sum + book.available, 0);
}

function getIssuedCopies() {
    return getTotalCopies() - getAvailableCopies();
}

function renderStats() {
    $("total-books").textContent = getTotalCopies().toLocaleString();
    $("available-books").textContent = getAvailableCopies().toLocaleString();
    $("issued-books").textContent = getIssuedCopies().toLocaleString();
    $("active-loans").textContent = loans.filter(loan => !loan.returned).length.toLocaleString();
}

function renderBookRow(book, showActions = false) {
    const status = book.available === 0
        ? '<span class="pill unavailable">Unavailable</span>'
        : book.available < book.quantity
            ? '<span class="pill issued">Partially Issued</span>'
            : '<span class="pill available">Available</span>';

    const actions = showActions
        ? `<td><button class="action-button" data-delete="${escapeHTML(book.id)}">Delete</button></td>`
        : "";

    return `
        <tr>
            <td>
                <div class="book-cell">
                    <div class="book-cover" style="background:${escapeHTML(book.color || "#355541")}">✦</div>
                    <div>
                        <strong>${escapeHTML(book.title)}</strong>
                        <small>${escapeHTML(book.id)}</small>
                    </div>
                </div>
            </td>
            ${showActions ? `<td>${escapeHTML(book.author)}</td>` : ""}
            <td>${escapeHTML(book.category)}</td>
            ${showActions ? `<td>${book.quantity}</td><td>${book.available}</td>` : ""}
            <td>${status}</td>
            ${actions}
        </tr>`;
}

function renderRecentBooks() {
    $("recent-books").innerHTML = books.slice(-5).reverse()
        .map(book => renderBookRow(book))
        .join("");
}

function renderBooks() {
    const query = $("search-input").value.trim().toLowerCase();
    const category = $("category-filter").value;

    const filtered = books.filter(book => {
        const matchesQuery =
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.id.toLowerCase().includes(query);

        return matchesQuery && (!category || book.category === category);
    });

    $("books-table").innerHTML = filtered.length
        ? filtered.map(book => renderBookRow(book, true)).join("")
        : `<tr><td colspan="7">No books found. Try another search.</td></tr>`;

    $("book-count").textContent =
        `Showing ${filtered.length} of ${books.length} book records`;
}

function renderLoans() {
    const activeLoans = loans.filter(loan => !loan.returned);

    $("loans-table").innerHTML = loans.length
        ? loans.slice().reverse().map(loan => {
            const book = getBook(loan.bookId);

            return `
                <tr>
                    <td>
                        <div class="book-cell">
                            <div class="book-cover" style="background:${escapeHTML(book?.color || "#355541")}">✦</div>
                            <div>
                                <strong>${escapeHTML(book?.title || "Deleted book")}</strong>
                                <small>${escapeHTML(loan.bookId)}</small>
                            </div>
                        </div>
                    </td>
                    <td>${escapeHTML(loan.student)}</td>
                    <td>${escapeHTML(loan.date)}</td>
                    <td>${loan.returned
                        ? '<span class="pill available">Returned</span>'
                        : '<span class="pill issued">On Loan</span>'}</td>
                    <td>${!loan.returned
                        ? `<button class="action-button return-button" data-return="${loan.id}">Return Book</button>`
                        : "—"}</td>
                </tr>`;
        }).join("")
        : `<tr><td colspan="5">No loan records yet.</td></tr>`;

    // Keep the variable useful for the loan display.
    void activeLoans;
}

function renderIssueOptions() {
    const select = $("issue-book");
    const previousValue = select.value;

    const availableBooks = books.filter(book => book.available > 0);

    select.innerHTML = availableBooks.length
        ? `<option value="">Select a book</option>` +
          availableBooks.map(book =>
              `<option value="${escapeHTML(book.id)}">${escapeHTML(book.title)} — ${escapeHTML(book.id)} (${book.available} available)</option>`
          ).join("")
        : `<option value="">No books available</option>`;

    if (availableBooks.some(book => book.id === previousValue)) {
        select.value = previousValue;
    }
}

function renderCharts() {
    if (typeof Chart === "undefined") return;

    const available = getAvailableCopies();
    const issued = getIssuedCopies();

    if (availabilityChart) availabilityChart.destroy();

    availabilityChart = new Chart($("availabilityChart"), {
        type: "doughnut",
        data: {
            labels: ["Available", "Issued"],
            datasets: [{
                data: [available, issued],
                backgroundColor: ["#345b43", "#c5a164"],
                borderColor: "#fffdf7",
                borderWidth: 5,
                hoverOffset: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "72%",
            plugins: {
                legend: { display: false }
            }
        }
    });

    const categoryTotals = {};
    books.forEach(book => {
        categoryTotals[book.category] =
            (categoryTotals[book.category] || 0) + book.quantity;
    });

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart($("categoryChart"), {
        type: "bar",
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                label: "Book Copies",
                data: Object.values(categoryTotals),
                backgroundColor: [
                    "#345b43", "#c5a164", "#7d3937",
                    "#64859b", "#9278a1", "#9a7655"
                ],
                borderRadius: 5,
                maxBarThickness: 35
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: "#858174", font: { size: 10 } }
                },
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0, color: "#858174" },
                    grid: { color: "#eee8dc" }
                }
            }
        }
    });
}

function renderAll() {
    renderStats();
    renderRecentBooks();
    renderBooks();
    renderLoans();
    renderIssueOptions();
    renderCharts();
}

$("add-book-form").addEventListener("submit", event => {
    event.preventDefault();

    const id = $("book-id").value.trim();
    const title = $("book-title").value.trim();
    const author = $("book-author").value.trim();
    const category = $("book-category").value;
    const quantity = Number($("book-quantity").value);

    if (!id || !title || !author || !category || !Number.isInteger(quantity) || quantity < 1) {
        $("add-message").textContent = "Please enter valid book details and quantity.";
        return;
    }

    if (books.some(book => book.id.toLowerCase() === id.toLowerCase())) {
        $("add-message").textContent = "This book ID already exists. Please use a unique ID.";
        return;
    }

    const colors = ["#773c39", "#b18a48", "#355a4b", "#394d68", "#80583e"];

    books.push({
        id, title, author, category, quantity,
        available: quantity,
        color: colors[Math.floor(Math.random() * colors.length)]
    });

    saveData();
    renderAll();
    event.target.reset();

    $("add-message").textContent = "Book successfully added to the collection!";
});

$("search-input").addEventListener("input", renderBooks);
$("category-filter").addEventListener("change", renderBooks);

$("books-table").addEventListener("click", event => {
    const button = event.target.closest("[data-delete]");
    if (!button) return;

    const id = button.dataset.delete;
    const book = getBook(id);

    if (!book) return;

    if (getIssuedCount(id) > 0) {
        alert("This book has active loans. Please process its returns before deleting the record.");
        return;
    }

    if (!confirm(`Delete "${book.title}" from the catalogue?`)) return;

    books = books.filter(item => item.id !== id);
    saveData();
    renderAll();
});

$("issue-form").addEventListener("submit", event => {
    event.preventDefault();

    const bookId = $("issue-book").value;
    const student = $("student-name").value.trim();
    const date = $("issue-date").value;
    const book = getBook(bookId);

    if (!book || book.available < 1 || !student || !date) {
        $("issue-message").textContent = "Select an available book and enter all required details.";
        return;
    }

    book.available--;

    loans.push({
        id: loans.reduce((max, loan) => Math.max(max, loan.id), 0) + 1,
        bookId,
        student,
        date,
        returned: false
    });

    saveData();
    renderAll();
    event.target.reset();
    $("issue-date").value = new Date().toLocaleDateString("en-CA");

    $("issue-message").textContent =
        `"${book.title}" has been issued to ${student}.`;
});

$("loans-table").addEventListener("click", event => {
    const button = event.target.closest("[data-return]");
    if (!button) return;

    const loan = loans.find(item => item.id === Number(button.dataset.return));

    if (!loan || loan.returned) return;

    const book = getBook(loan.bookId);

    if (!book) {
        alert("The associated book record could not be found.");
        return;
    }

    if (!confirm(`Record the return of "${book.title}" from ${loan.student}?`)) return;

    loan.returned = true;
    book.available = Math.min(book.quantity, book.available + 1);

    saveData();
    renderAll();
});

$("issue-date").value = new Date().toLocaleDateString("en-CA");

// Navigation highlighting
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        document.querySelectorAll(".nav-link").forEach(item => item.classList.remove("active"));
        link.classList.add("active");

        const section = link.getAttribute("href");
        const headings = {
            "#dashboard": "Library Dashboard",
            "#books": "Library Catalogue",
            "#add-book": "Add a New Volume",
            "#issue": "Issue a Book",
            "#returns": "Returns & Loan Records"
        };

        $("page-heading").textContent = headings[section] || "Library Dashboard";
    });
});

renderAll();
