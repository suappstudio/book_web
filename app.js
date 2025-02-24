const API_BASE = "https://book-hc8z.onrender.com"; 
// Se deployi su Render o Supabase, cambia con l'URL es: "https://mio-progetto.onrender.com"

document.addEventListener("DOMContentLoaded", () => {
  const booksBody = document.getElementById("booksBody");
  const bookForm = document.getElementById("bookForm");
  const bookIdField = document.getElementById("bookId");
  const titleField = document.getElementById("title");
  const authorField = document.getElementById("author");
  const yearField = document.getElementById("year");
  const pagesField = document.getElementById("pages");
  const categorySelect = document.getElementById("categorySelect");
  const ageRangeField = document.getElementById("ageRange");
  const descField = document.getElementById("description");

  // Al caricamento, fetch di libri e categorie
  fetchBooks();
  fetchCategories();

  // Al submit del form, se c’è un ID -> update, altrimenti crea libro
  bookForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (bookIdField.value) {
      updateBook(bookIdField.value);
    } else {
      createBook();
    }
  });

  // Carica lista di libri
  async function fetchBooks() {
    booksBody.innerHTML = "<tr><td colspan='8'>Caricamento...</td></tr>";
    try {
      const res = await fetch(`${API_BASE}/books`);
      const data = await res.json();
      renderBooks(data);
    } catch (err) {
      booksBody.innerHTML = `<tr><td colspan='8'>Errore: ${err.message}</td></tr>`;
    }
  }

  function renderBooks(books) {
    booksBody.innerHTML = "";
    books.forEach((book) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${book.id}</td>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.year || ""}</td>
        <td>${book.pages || ""}</td>
        <td>${book.categories?.name || "N/A"}</td>
        <td>${book.age_range || ""}</td>
        <td>
          <button data-id="${book.id}" class="editBtn">Modifica</button>
          <button data-id="${book.id}" class="delBtn">Elimina</button>
        </td>
      `;
      booksBody.appendChild(tr);
    });

    // Bottone modifica
    document.querySelectorAll(".editBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        loadBook(id);
      });
    });

    // Bottone elimina
    document.querySelectorAll(".delBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        deleteBook(id);
      });
    });
  }

  // Carica categorie
  async function fetchCategories() {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      renderCategories(data);
    } catch (err) {
      console.error("Errore fetch categorie:", err);
    }
  }

  function renderCategories(categories) {
    categorySelect.innerHTML = "";
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.name;
      categorySelect.appendChild(opt);
    });
  }

  // Crea nuovo libro
  async function createBook() {
    const body = {
      title: titleField.value,
      author: authorField.value,
      year: parseInt(yearField.value) || null,
      pages: parseInt(pagesField.value) || null,
      category_id: parseInt(categorySelect.value),
      age_range: ageRangeField.value,
      description: descField.value
    };
    try {
      const res = await fetch(`${API_BASE}/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Errore POST libri");
      bookForm.reset();
      fetchBooks();
    } catch (err) {
      alert("Errore creazione libro: " + err.message);
    }
  }

  // Carica un singolo libro e popola il form
  async function loadBook(bookId) {
    try {
      const res = await fetch(`${API_BASE}/books/${bookId}`);
      if (!res.ok) throw new Error("Errore GET libro");
      const book = await res.json();

      // Popoliamo campi
      bookIdField.value = book.id;
      titleField.value = book.title;
      authorField.value = book.author;
      yearField.value = book.year || "";
      pagesField.value = book.pages || "";
      ageRangeField.value = book.age_range || "";
      descField.value = book.description || "";

      // Se esiste category e vogliamo selezionare
      // Nota: Se la tabella ha categories(name) -> cat name, per ID serve book.category_id
      // Con l'endpoint attuale, potresti fare extra fetch?
      // Se ha categories?.name, devi mappare su quell'ID. Per ora ipotizziamo che funzioni se catID => categories
      // ...
    } catch (err) {
      alert("Errore caricamento libro: " + err.message);
    }
  }

  // Update libro
  async function updateBook(bookId) {
    const body = {
      title: titleField.value,
      author: authorField.value,
      year: parseInt(yearField.value) || null,
      pages: parseInt(pagesField.value) || null,
      category_id: parseInt(categorySelect.value),
      age_range: ageRangeField.value,
      description: descField.value
    };
    try {
      const res = await fetch(`${API_BASE}/books/${bookId}`, {
        method: "PUT",  // o PATCH se preferisci
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Errore update libro");
      bookForm.reset();
      bookIdField.value = "";
      fetchBooks();
    } catch (err) {
      alert("Errore update libro: " + err.message);
    }
  }

  // Elimina libro
  async function deleteBook(bookId) {
    if (!confirm("Eliminare il libro?")) return;
    try {
      const res = await fetch(`${API_BASE}/books/${bookId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Errore eliminazione libro");
      fetchBooks();
    } catch (err) {
      alert(err.message);
    }
  }
});
