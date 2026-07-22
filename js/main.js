// js/main.js

import { initSearch, refreshSearch } from './search.js';
import { renderCalendar, renderYearView } from './calendar.js';
import { loadTheme } from './theme.js';
import { loadAllSettings } from './settings.js';
import './settings-ui.js';

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let isYearView = false;

const monthYearEl = document.getElementById('monthYear');

// Переключение между месячным и годовым видом
function toggleView() {
    isYearView = !isYearView;
    refreshCalendar();
}

// Клик по заголовку переключает вид
monthYearEl.addEventListener('click', toggleView);

// Функция обновления календаря
function refreshCalendar() {
    console.log('refreshCalendar вызван, isYearView:', isYearView);
    if (isYearView) {
        renderYearView(currentYear);
    } else {
        renderCalendar(currentYear, currentMonth);
    }
    refreshSearch();
}

// Обработчик события выбора месяца из годового обзора
document.addEventListener('month-selected', (e) => {
    const { year, month } = e.detail;
    currentYear = year;
    currentMonth = month;
    isYearView = false;
    refreshCalendar();
});

// Навигация (стрелки)
document.getElementById('prevMonth').addEventListener('click', () => {
    if (isYearView) {
        currentYear--;
        refreshCalendar();
    } else {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        refreshCalendar();
    }
});
document.getElementById('nextMonth').addEventListener('click', () => {
    if (isYearView) {
        currentYear++;
        refreshCalendar();
    } else {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        refreshCalendar();
    }
});

// Кнопка "Сегодня"
document.getElementById('todayBtn').addEventListener('click', () => {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    isYearView = false;
    refreshCalendar();
});

// Инициализация
loadTheme();
loadAllSettings();
initSearch();
refreshCalendar();