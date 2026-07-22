// js/settings-ui.js

import { setColorFilter, getColorFilter } from './settings.js';
import { setWeekStart, getWeekStart, setFontSize, getFontSize } from './settings.js';
import { toggleTheme, loadTheme } from './theme.js';
import { setMode, getMode, loadMode } from './settings.js';

const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const settingsCloseBtn = document.getElementById('settingsCloseBtn');

const themeToggle = document.getElementById('themeToggle');
const modeToggle = document.getElementById('modeToggle');
const weekStartToggle = document.getElementById('weekStartToggle');
const fontSizeSlider = document.getElementById('fontSizeSlider');

const filterButtons = document.querySelectorAll('.filter-btn');
const filterResetBtn = document.getElementById('filterResetBtn');
const currentFilter = getColorFilter();

filterButtons.forEach(btn => {
    btn.classList.remove('active-filter');
    const color = btn.dataset.color === 'null' ? null : btn.dataset.color;
    if (color === currentFilter) {
        btn.classList.add('active-filter');
    }
    btn.addEventListener('click', () => {
        const selectedColor = btn.dataset.color === 'null' ? null : btn.dataset.color;
        setColorFilter(selectedColor);
        filterButtons.forEach(b => b.classList.remove('active-filter'));
        btn.classList.add('active-filter');
    });
});

filterResetBtn.addEventListener('click', () => {
    setColorFilter(null);
    filterButtons.forEach(b => b.classList.remove('active-filter'));
});

function openSettings() {
    themeToggle.checked = document.body.classList.contains('dark-theme');
    modeToggle.checked = getMode() === 'inline';
    weekStartToggle.checked = getWeekStart() === 'sunday';

    const currentFontSize = getFontSize();
    fontSizeSlider.value = currentFontSize;
    fontSizeLabel.textContent = currentFontSize + '%';

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
	console.log('Переключение Пн/Вс, новое значение:', weekStartToggle.checked ? 'sunday' : 'monday');
    const value = weekStartToggle.checked ? 'sunday' : 'monday';
    setWeekStart(value);
});