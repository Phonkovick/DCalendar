// js/calendar.js

import { hasNote, loadNote } from './notes.js';
import { getMode, getWeekStart, getFontSize } from './settings.js';
import { openModal } from './modal.js';
import { handleDayClick } from './panel.js';

const daysGrid = document.getElementById('daysGrid');
const monthYearEl = document.getElementById('monthYear');
const weekdaysEl = document.getElementById('weekdays');

function applyFontSize(percent) {
    document.documentElement.style.setProperty('--calendar-font-size', percent + '%');
}

export function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

export function formatDate(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function renderWeekdays(weekStart) {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    if (weekStart === 'sunday') {
        days.unshift(days.pop());
    }
    weekdaysEl.innerHTML = days.map(d => `<span>${d}</span>`).join('');
}

export function renderCalendar(year, month) {
    // Восстанавливаем стили
    weekdaysEl.style.display = 'grid';
    daysGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    daysGrid.style.gap = '6px';
    daysGrid.style.gridAutoRows = '1fr';

    const weekStart = getWeekStart();
    const fontSize = getFontSize();
    applyFontSize(fontSize);
    renderWeekdays(weekStart);

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();

    let offset;
    if (weekStart === 'monday') {
        offset = (firstDay === 0) ? 6 : firstDay - 1;
    } else {
        offset = firstDay;
    }

    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    monthYearEl.textContent = `${monthNames[month]} ${year}`;
    daysGrid.innerHTML = '';

    // Пустые ячейки
    for (let i = 0; i < offset; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell empty';
        daysGrid.appendChild(emptyCell);
    }

    const today = new Date();
    const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        cell.textContent = day;
        const dateStr = formatDate(year, month, day);
        cell.dataset.date = dateStr;

        // Подсказка (заголовок) – безопасно
        try {
            const note = loadNote(dateStr);
            if (note && (note.title || note.text)) {
                cell.title = note.title || note.text.substring(0, 20);
            }
        } catch (e) {
            // игнорируем ошибки загрузки
        }

        if (dateStr === todayStr) {
            cell.classList.add('today');
        }

        // Индикатор заметки – безопасно
        if (hasNote(dateStr)) {
            try {
                const note = loadNote(dateStr);
                const color = (note && note.color) ? note.color : null;
                const indicator = document.createElement('span');
                indicator.className = 'note-indicator';
                if (color) {
                    indicator.style.background = color;
                } else {
                    indicator.classList.add('color-null');
                }
                cell.appendChild(indicator);
            } catch (e) {
                // если ошибка, просто не добавляем индикатор
            }
        }

        cell.addEventListener('click', () => {
            const mode = getMode();
            if (mode === 'modal') {
                openModal(dateStr);
            } else {
                handleDayClick(dateStr);
            }
        });

        daysGrid.appendChild(cell);
    }

    // Добиваем до 42 ячеек
    const totalCells = 42;
    const currentCells = daysGrid.children.length;
    for (let i = currentCells; i < totalCells; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell empty';
        daysGrid.appendChild(emptyCell);
    }
}

export function renderYearView(year) {
    const fontSize = getFontSize();
    applyFontSize(fontSize);

    weekdaysEl.style.display = 'none';
    monthYearEl.textContent = `${year}`;

    daysGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    daysGrid.style.gap = '10px';
    daysGrid.style.gridAutoRows = 'auto';
    daysGrid.innerHTML = '';

    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

    for (let month = 0; month < 12; month++) {
        const monthCard = document.createElement('div');
        monthCard.className = 'month-card';

        const title = document.createElement('div');
        title.className = 'month-card-title';
        title.textContent = monthNames[month];
        monthCard.appendChild(title);

        const daysList = document.createElement('div');
        daysList.className = 'month-card-days';

        const daysInMonth = getDaysInMonth(year, month);
        const daysWithNotes = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = formatDate(year, month, day);
            if (hasNote(dateStr)) {
                daysWithNotes.push(day);
            }
        }

        if (daysWithNotes.length === 0) {
            const emptyMsg = document.createElement('span');
            emptyMsg.className = 'month-card-empty';
            emptyMsg.textContent = 'Нет заметок';
            daysList.appendChild(emptyMsg);
        } else {
            const displayDays = daysWithNotes.slice(0, 10);
            displayDays.forEach((day, index) => {
                const daySpan = document.createElement('span');
                daySpan.className = 'month-card-day';
                daySpan.textContent = day;
                daysList.appendChild(daySpan);
                if (index < displayDays.length - 1) {
                    daysList.appendChild(document.createTextNode(', '));
                }
            });
            if (daysWithNotes.length > 10) {
                const more = document.createElement('span');
                more.className = 'month-card-more';
                more.textContent = ` и ещё ${daysWithNotes.length - 10}`;
                daysList.appendChild(more);
            }
        }

        monthCard.appendChild(daysList);

        const countLabel = document.createElement('div');
        countLabel.className = 'month-card-count';
        countLabel.textContent = `${daysWithNotes.length} записей`;
        monthCard.appendChild(countLabel);

        monthCard.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('month-selected', { detail: { year, month } }));
        });

        daysGrid.appendChild(monthCard);
    }
}