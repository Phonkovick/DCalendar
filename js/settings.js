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
    loadColorFilter();
}

// Значение 'all' означает отсутствие фильтра, null — заметки без выбранного цвета.
let colorFilter = 'all';

export function getColorFilter() {
    return colorFilter;
}

export function setColorFilter(color) {
    const isValidColor = typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color);
    if (color !== 'all' && color !== null && !isValidColor) return;

    colorFilter = color;

    if (color === 'all') {
        localStorage.removeItem('colorFilter');
    } else {
        localStorage.setItem('colorFilter', color === null ? 'none' : color);
    }

    document.dispatchEvent(new CustomEvent('settings-changed'));
}

export function loadColorFilter() {
    const saved = localStorage.getItem('colorFilter');

    if (saved === 'none') {
        colorFilter = null;
    } else if (typeof saved === 'string' && /^#[0-9a-f]{6}$/i.test(saved)) {
        colorFilter = saved;
    } else {
        colorFilter = 'all';
    }
}

export function getFontSize() {
    return 100;
}
