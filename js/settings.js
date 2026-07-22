// js/settings.js

const modeToggle = document.getElementById('modeToggle');
let currentMode = 'modal';

let weekStart = 'monday';

export function getMode() {
    return currentMode;
}

export function setMode(mode) {
    if (mode !== 'modal' && mode !== 'inline') return;
    currentMode = mode;
    localStorage.setItem('viewMode', mode);
    modeToggle.textContent = mode === 'modal' ? '🪟' : '📋';
    if (mode === 'modal') {
        const panel = document.getElementById('notePanel');
        if (panel) panel.classList.remove('visible');
    }
}

export function toggleMode() {
    const newMode = currentMode === 'modal' ? 'inline' : 'modal';
    setMode(newMode);
}

export function loadMode() {
    const saved = localStorage.getItem('viewMode');
    if (saved === 'inline' || saved === 'modal') {
        currentMode = saved;
    } else {
        currentMode = 'modal';
    }
    modeToggle.textContent = currentMode === 'modal' ? '🪟' : '📋';
}

export function getWeekStart() {
    return weekStart;
}

export function setWeekStart(value) {
	console.log('setWeekStart вызван, значение:', value);
    if (value !== 'monday' && value !== 'sunday') return;
    weekStart = value;
    localStorage.setItem('weekStart', value);
    document.dispatchEvent(new CustomEvent('settings-changed'));
}

export function loadWeekStart() {
    const saved = localStorage.getItem('weekStart');
    if (saved === 'monday' || saved === 'sunday') {
        weekStart = saved;
    } else {
        weekStart = 'monday';
    }
}

export function loadAllSettings() {
    loadMode();
    loadWeekStart();
    loadFontSize();
}

modeToggle.addEventListener('click', toggleMode);

let colorFilter = null;

export function getColorFilter() {
    return colorFilter;
}

export function setColorFilter(color) {
    colorFilter = color;
    localStorage.setItem('colorFilter', color || '');
    document.dispatchEvent(new CustomEvent('settings-changed'));
}

export function loadColorFilter() {
    const saved = localStorage.getItem('colorFilter');
    colorFilter = saved || null;
}