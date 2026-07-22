// js/panel.js

import { loadNote, saveNote } from './notes.js';

const notePanel = document.getElementById('notePanel');
const panelDate = document.getElementById('panelDate');
const panelTitleInput = document.getElementById('panelTitleInput');
const panelNoteInput = document.getElementById('panelNoteInput');
const panelColorPicker = document.getElementById('panelColorPicker');
const panelSaveBtn = document.getElementById('panelSaveBtn');
const panelDeleteBtn = document.getElementById('panelDeleteBtn');
const panelClose = document.getElementById('panelClose');

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

export function getSelectedDate() {
    return selectedDate;
}

export function openInlineNote(dateStr) {
    selectedDate = dateStr;
    const [year, month, day] = dateStr.split('-').map(Number);
    panelDate.textContent = `Заметка на ${day}.${month}.${year}`;
    const data = loadNote(dateStr);
    panelTitleInput.value = data.title || '';
    panelNoteInput.value = data.text || '';
    selectedColor = data.color || null;

    const buttons = panelColorPicker.querySelectorAll('.color-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        const btnColor = btn.dataset.color === 'null' ? null : btn.dataset.color;
        if (btnColor === selectedColor) {
            btn.classList.add('active');
        }
    });

    notePanel.classList.add('visible');
    panelTitleInput.focus();
}

export function closeInlineNote() {
    notePanel.classList.remove('visible');
    selectedDate = null;
    selectedColor = null;
}

export function handleDayClick(dateStr) {
    if (selectedDate === dateStr && notePanel.classList.contains('visible')) {
        closeInlineNote();
    } else {
        openInlineNote(dateStr);
    }
}

function handleSave() {
    if (!selectedDate) return;
    const title = panelTitleInput.value;
    const text = panelNoteInput.value;
    saveNote(selectedDate, title, text, selectedColor);
    document.dispatchEvent(new CustomEvent('notes-updated'));
}

function handleDelete() {
    if (!selectedDate) return;
    saveNote(selectedDate, '', '');
    panelTitleInput.value = '';
    panelNoteInput.value = '';
    document.dispatchEvent(new CustomEvent('notes-updated'));
}

setupColorPicker(panelColorPicker, (color) => {
    selectedColor = color;
});

panelSaveBtn.addEventListener('click', handleSave);
panelDeleteBtn.addEventListener('click', handleDelete);
panelClose.addEventListener('click', closeInlineNote);

function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
    }
}
panelTitleInput.addEventListener('keydown', handleKeydown);
panelNoteInput.addEventListener('keydown', handleKeydown);