const books = [];

const RENDER_EVENT = 'render-books';
const DELETE_EVENT = 'delete-book';
const localBooksKey = 'books';

function isStorageExists() {
	return typeof Storage !== null;
}

function generateId() {
	return Number(new Date());
}

function updateLocalStorage() {
	if (isStorageExists())
		localStorage.setItem(localBooksKey, JSON.stringify(books));
}

function createBookElement(book) {
	const { id, title, author, year, isComplete } = book;

	const getActionButton = () => {
		if (!isComplete) {
			return `
			<button class="btn-primary" id="finish-btn">Selesai dibaca</button>
      <button class="btn-delete" id="delete-btn">Hapus</button>`;
		}

		return `
    <button class="btn-primary" id="undo-btn">Belum selesai dibaca</button>
    <button class="btn-delete" id="delete-btn">Hapus</button>`;
	};

	return `
  <div class="book-item" book-id="${id}">
    <div class="book-info">
      <h3>Judul</h3>
      <p>${title}</p>
      <h3>Pengarang</h3>
      <p>${author}</p>
      <h3>Year</h3>
      <p>${year}</p>
    </div>
    <div class="book-actions">
      ${getActionButton()}
    </div>
  </div>
  `;
}
function clearForm() {
	document.getElementById('title').value = '';
	document.getElementById('author').value = '';
	document.getElementById('year').value = '';
}

function addBook() {
	const title = document.getElementById('title').value;
	const author = document.getElementById('author').value;
	const year = document.getElementById('year').value;

	const bookObject = {
		id: generateId(),
		title,
		author,
		year,
		isComplete: false,
	};

	clearForm();
	books.push(bookObject);
	document.dispatchEvent(new CustomEvent(RENDER_EVENT));
}

function deleteBook(bookElement) {
	const bookId = bookElement.getAttribute('book-id');
	const bookTarget = books.findIndex(book => book.id === Number(bookId));
	if (bookTarget === -1) return;

	books.splice(bookTarget, 1);

	document.dispatchEvent(new CustomEvent(RENDER_EVENT));
}

function setBookStatus(bookElement, status) {
	const bookId = bookElement.getAttribute('book-id');
	console.log(bookId);
	const bookTarget = books.findIndex(book => book.id === Number(bookId));
	if (bookTarget === -1) return;

	if (status === 'completed') {
		books[bookTarget].isComplete = true;
	} else if (status === 'uncompleted') {
		books[bookTarget].isComplete = false;
	}

	document.dispatchEvent(new CustomEvent(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', () => {
	if (isStorageExists()) {
		const localBooks = JSON.parse(localStorage.getItem(localBooksKey));
		if (localBooks === null)
			localStorage.setItem(localBooksKey, JSON.stringify([]));

		books.push(...localBooks);
		document.dispatchEvent(new CustomEvent(RENDER_EVENT));
	}

	const submitForm = document.getElementById('form');
	const readingList = document.getElementById('reading-list');
	const finishedList = document.getElementById('finished-list');

	submitForm.addEventListener('submit', e => {
		e.preventDefault();
		addBook();
	});

	readingList.addEventListener('click', e => {
		const that = e.target;
		if (that.id === 'finish-btn')
			setBookStatus(that.parentElement.parentElement, 'completed');
		else if (that.id === 'delete-btn')
			deleteBook(that.parentElement.parentElement);
	});

	finishedList.addEventListener('click', e => {
		const that = e.target;
		if (that.id === 'undo-btn')
			setBookStatus(that.parentElement.parentElement, 'uncompleted');
		else if (that.id === 'delete-btn')
			deleteBook(that.parentElement.parentElement);
	});
});

document.addEventListener(RENDER_EVENT, () => {
	const readingList = document.getElementById('reading-list');
	const finishedList = document.getElementById('finished-list');

	readingList.innerHTML = '';
	finishedList.innerHTML = '';

	for (const book of books) {
		const bookElement = createBookElement(book);
		book.isComplete
			? (finishedList.innerHTML += bookElement)
			: (readingList.innerHTML += bookElement);
	}

	updateLocalStorage();
});

document.addEventListener(DELETE_EVENT, e => {});
