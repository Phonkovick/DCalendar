// js/modal.js

import { loadNote, saveNote } from './notes.js';

const modalOverlay = document.getElementById('modalOverlay');
const modalDateEl = document.getElementById('modalDate');
const modalTitleInput = document.getElementById('modalTitleInput');
const noteInput = document.getElementById('noteInput');
const modalColorPicker = document.getElementById('modalColorPicker');
const saveBtn = document.getElementById('saveNoteBtn');
const deleteBtn = document.getElementById('deleteNoteBtn');
const closeBtn = document.getElementById('closeModalBtn');

let selectedDate = null;
let selectedColor = null;

function setupColorPicker(picker, onSelect) {
    const buttons = picker.querySelectorAll('.color-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const color = btn.dataset.color === 'null' ? null : btn.dataset.color;
            onSelect(color);
        });
    });
}

export function openModal(dateStr) {
    selectedDate = dateStr;
    const [year, month, day] = dateStr.split('-').map(Number);
    modalDateEl.textContent = `Заметка на ${day}.${month}.${year}`;
    const data = loadNote(dateStr);
    modalTitleInput.value = data.title || '';
    noteInput.value = data.text || '';
    selectedColor = data.color || null;

    const buttons = modalColorPicker.querySelectorAll('.color-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        const btnColor = btn.dataset.color === 'null' ? null : btn.dataset.color;
        if (btnColor === selectedColor) {
            btn.classList.add('active');
        }
    });

    modalOverlay.classList.add('active');
    modalTitleInput.focus();
}

function closeModal() {
    modalOverlay.classList.remove('active');
    selectedDate = null;
    selectedColor = null;
}

function handleSave() {
    if (!selectedDate) return;
    const title = modalTitleInput.value;
    const text = noteInput.value;
    saveNote(selectedDate, title, text, selectedColor);
    closeModal();
    document.dispatchEvent(new CustomEvent('notes-updated'));
}

function handleDelete() {
    if (!selectedDate) return;
    saveNote(selectedDate, '', '');
    closeModal();
    document.dispatchEvent(new CustomEvent('notes-updated'));
}

setupColorPicker(modalColorPicker, (color) => {
    selectedColor = color;
});

saveBtn.addEventListener('click', handleSave);
deleteBtn.addEventListener('click', handleDelete);
closeBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
    }
}
modalTitleInput.addEventListener('keydown', handleKeydown);
noteInput.addEventListener('keydown', handleKeydown);