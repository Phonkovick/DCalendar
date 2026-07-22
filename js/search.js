// js/search.js

import { loadNote } from './notes.js';

const searchInput = document.getElementById('searchInput');
let timeoutId = null;

function applySearch(query) {
    document.querySelectorAll('.day-cell.search-match').forEach(el => {
        el.classList.remove('search-match');
    });

    const trimmed = query.trim();
    if (trimmed === '') return;

    const cells = document.querySelectorAll('.day-cell[data-date]');
    const lowerQuery = trimmed.toLowerCase();
    cells.forEach(cell => {
        const dateStr = cell.dataset.date;
        const note = loadNote(dateStr);
        const text = note.text || '';
        const title = note.title || '';
        if (text.toLowerCase().includes(lowerQuery) || title.toLowerCase().includes(lowerQuery)) {
            cell.classList.add('search-match');
        }
    });
}

function handleSearchInput(e) {
    const query = e.target.value;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        applySearch(query);
    }, 200);
}

export function initSearch() {
    searchInput.addEventListener('input', handleSearchInput);
}

export function refreshSearch() {
    const query = searchInput.value;
    applySearch(query);
}