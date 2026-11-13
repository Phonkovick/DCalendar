// js/settings-ui.js

import { setColorFilter, getColorFilter } from './settings.js';
import { setWeekStart, getWeekStart } from './settings.js';
import { toggleTheme } from './theme.js';
import { setMode, getMode } from './settings.js';

const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const settingsCloseBtn = document.getElementById('settingsCloseBtn');

const themeToggle = document.getElementById('themeToggle');
const modeToggle = document.getElementById('modeToggle');
const weekStartToggle = document.getElementById('weekStartToggle');

const filterButtons = document.querySelectorAll('.filter-btn');
const filterResetBtn = document.getElementById('filterResetBtn');

function syncColorFilterButtons() {
    const currentFilter = getColorFilter();

    filterButtons.forEach(btn => {
        const color = btn.dataset.color === 'null' ? null : btn.dataset.color;
        btn.classList.toggle('active-filter', color === currentFilter);
    });
}

syncColorFilterButtons();

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const selectedColor = btn.dataset.color === 'null' ? null : btn.dataset.color;
        setColorFilter(selectedColor);
        syncColorFilterButtons();
    });
});

filterResetBtn.addEventListener('click', () => {
    setColorFilter('all');
    syncColorFilterButtons();
});

function openSettings() {
    themeToggle.checked = document.body.classList.contains('dark-theme');
    modeToggle.checked = getMode() === 'inline';
    weekStartToggle.checked = getWeekStart() === 'sunday';
    syncColorFilterButtons();
    settingsModal.classList.add('active');
}

function closeSettings() {
    settingsModal.classList.remove('active');
}

settingsBtn.addEventListener('click', openSettings);
settingsCloseBtn.addEventListener('click', closeSettings);
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeSettings();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsModal.classList.contains('active')) {
        closeSettings();
    }
});

themeToggle.addEventListener('change', () => {
    toggleTheme();
    themeToggle.checked = document.body.classList.contains('dark-theme');
});

modeToggle.addEventListener('change', () => {
    const newMode = modeToggle.checked ? 'inline' : 'modal';
    setMode(newMode);
    if (newMode === 'modal') {
        const panel = document.getElementById('notePanel');
        if (panel) panel.classList.remove('visible');
    }
});

weekStartToggle.addEventListener('change', () => {
    const value = weekStartToggle.checked ? 'sunday' : 'monday';
    setWeekStart(value);
});
