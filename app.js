const API_BASE = "https://book-hc8z.onrender.com"; 
// Sostituisci col tuo endpoint su Render

document.addEventListener("DOMContentLoaded", () => {
  // ... codice esistente per books ...
  // ... bookForm, fetchBooks, fetchCategories, etc. ...
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
  // -- Sezione Commenti
  const commentSection = document.getElementById("commentSection");
  const commentBookTitle = document.getElementById("commentBookTitle");
  const commentsList = document.getElementById("commentsList");
  const commentForm = document.getElementById("commentForm");
  const newCommentText = document.getElementById("newCommentText");
  let currentBookIdForComments = null; // memorizza l'id del libro selezionato

   // Al caricamento, fetch libri e categorie
   fetchBooks();
   fetchCategories();
 
   // FORM LIBRO
   bookForm.addEventListener("submit", (e) => {
     e.preventDefault();
     if (bookIdField.value) {
       updateBook(bookIdField.value);
     } else {
       createBook();
     }
   });
  // EVENT LISTENER FORM COMMENTI
  commentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentBookIdForComments) {
      alert("Nessun libro selezionato per i commenti!");
      return;
    }
    addComment(currentBookIdForComments);
  });

 // ==============================
  // Funzioni per LIBRI
  // ==============================

  async function fetchBooks() {
    booksBody.innerHTML = "<tr><td colspan='7'>Caricamento...</td></tr>";
    try {
      const res = await fetch(`${API_BASE}/books`);
      const data = await res.json();
      renderBooks(data);
    } catch (err) {
      booksBody.innerHTML = `<tr><td colspan='7'>Errore: ${err.message}</td></tr>`;
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
        <td>
          <button data-id="${book.id}" class="editBtn">Modifica</button>
          <button data-id="${book.id}" class="delBtn">Elimina</button>
          <button data-id="${book.id}" data-title="${book.title}" class="cmtBtn">Commenti</button>
        </td>
      `;
      booksBody.appendChild(tr);
    });

    // Bottone Modifica
    document.querySelectorAll(".editBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        loadBook(id);
      });
    });

    // Bottone Elimina
    document.querySelectorAll(".delBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        deleteBook(id);
      });
    });

    // Bottone Commenti
    document.querySelectorAll(".cmtBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const title = btn.dataset.title;
        showComments(id, title);
      });
    });
  }

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
      await fetch(`${API_BASE}/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      bookForm.reset();
      fetchBooks();
    } catch (err) {
      alert("Errore creazione libro: " + err.message);
    }
  }

  async function loadBook(bookId) {
    try {
      const res = await fetch(`${API_BASE}/books/${bookId}`);
      if (!res.ok) throw new Error("Errore GET libro");
      const book = await res.json();

      bookIdField.value = book.id;
      titleField.value = book.title;
      authorField.value = book.author;
      yearField.value = book.year || "";
      pagesField.value = book.pages || "";
      ageRangeField.value = book.age_range || "";
      descField.value = book.description || "";
      // Nota: la categorySelect si può gestire se hai book.category_id (non c’è in your server? se serve, modificalo)
      // ...
    } catch (err) {
      alert("Errore caricamento libro: " + err.message);
    }
  }

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
        method: "PUT", // Se non hai definito PUT, puoi usare PATCH
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



  // FUNZIONE showComments
  async function showComments(bookId, bookTitle) {
    try {
      const res = await fetch(`${API_BASE}/books/${bookId}`);
      if (!res.ok) throw new Error("Errore caricamento libro per commenti");
      const book = await res.json();

      currentBookIdForComments = bookId;
      commentBookTitle.textContent = bookTitle; // o book.title
      renderComments(book.comments || []);
      commentSection.style.display = "block";
    } catch (err) {
      alert(err.message);
    }
  }

  // RENDER COMMENTI
  function renderComments(comments) {
    commentsList.innerHTML = "";
    comments.forEach((c) => {
      const li = document.createElement("li");

      // Creiamo uno span per il testo del commento
      const spanText = document.createElement("span");
      spanText.textContent = c.comment_text;

      // Bottone Modifica
      const editBtn = document.createElement("button");
      editBtn.textContent = "Modifica";
      editBtn.style.marginLeft = "10px";
      editBtn.addEventListener("click", () => {
        editCommentPrompt(c.id, c.comment_text);
      });

      // Bottone Elimina
      const delBtn = document.createElement("button");
      delBtn.textContent = "Elimina";
      delBtn.style.marginLeft = "5px";
      delBtn.addEventListener("click", () => {
        deleteComment(c.id);
      });

      li.appendChild(spanText);
      li.appendChild(editBtn);
      li.appendChild(delBtn);
      commentsList.appendChild(li);
    });
  }

  // AGGIUNGI COMMENTO
  async function addComment(bookId) {
    const comment_text = newCommentText.value.trim();
    if (!comment_text) return;

    try {
      const res = await fetch(`${API_BASE}/books/${bookId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_text })
      });
      if (!res.ok) throw new Error("Errore aggiunta commento");
      const updatedBook = await res.json(); // Ritorna il libro aggiornato con comments
      renderComments(updatedBook.comments || []);
      newCommentText.value = "";
    } catch (err) {
      alert(err.message);
    }
  }

  // MODIFICA COMMENTO
  function editCommentPrompt(commentId, oldText) {
    const newText = prompt("Modifica commento:", oldText);
    if (newText === null) return; // annulla
    const trimmed = newText.trim();
    if (!trimmed) return; // stringa vuota => ignora
    updateComment(commentId, trimmed);
  }

  async function updateComment(commentId, newText) {
    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_text: newText })
      });
      if (!res.ok) throw new Error("Errore update commento");
      const updatedComment = await res.json();
      // Non abbiamo l'elenco dei commenti qui, quindi ricarichiamo i commenti del libro
      if (currentBookIdForComments) {
        // Ricarichiamo i commenti col libro
        showComments(currentBookIdForComments, commentBookTitle.textContent);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  // ELIMINA COMMENTO
  async function deleteComment(commentId) {
    if (!confirm("Vuoi eliminare questo commento?")) return;
    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Errore eliminazione commento");
      // Ricarica commenti
      if (currentBookIdForComments) {
        showComments(currentBookIdForComments, commentBookTitle.textContent);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  // ... Resto del codice per BOOKS ...
  // (fetchBooks, renderBooks, createBook, updateBook, deleteBook ecc.)

  // Aggiorniamo renderBooks per aggiungere il pulsante "Commenti"
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
        <td>
          <button data-id="${book.id}" class="editBtn">Modifica</button>
          <button data-id="${book.id}" class="delBtn">Elimina</button>
          <button data-id="${book.id}" data-title="${book.title}" class="cmtBtn">Commenti</button>
        </td>
      `;
      booksBody.appendChild(tr);
    });

    // ... come prima ...
    document.querySelectorAll(".editBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        loadBook(id);
      });
    });

    // ... come prima ...
    document.querySelectorAll(".delBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        deleteBook(id);
      });
    });

    // Bottone “Commenti”
    document.querySelectorAll(".cmtBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const title = btn.dataset.title;
        showComments(id, title);
      });
    });
  }
});
