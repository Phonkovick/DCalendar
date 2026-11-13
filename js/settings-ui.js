// js/settings-ui.js

import { setWeekStart, getWeekStart, setMode, getMode } from './settings.js';
import { toggleTheme } from './theme.js';

const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const settingsCloseBtn = document.getElementById('settingsCloseBtn');

const themeToggle = document.getElementById('themeToggle');
const modeToggle = document.getElementById('modeToggle');
const weekStartToggle = document.getElementById('weekStartToggle');

function openSettings() {
    themeToggle.checked = document.body.classList.contains('dark-theme');
    modeToggle.checked = getMode() === 'inline';
    weekStartToggle.checked = getWeekStart() === 'sunday';
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
