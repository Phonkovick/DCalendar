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

function getReadableTextColor(hexColor) {
    if (!/^#[0-9a-f]{6}$/i.test(hexColor)) return '#1a2634';

    const channels = hexColor.slice(1).match(/.{2}/g).map(value => parseInt(value, 16) / 255);
    const linear = channels.map(value =>
        value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    );
    const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];

    // Выбираем более контрастный текст для читаемости на цветном фоне.
    return luminance > 0.179 ? '#1a2634' : '#ffffff';
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
    weekdaysEl.style.display = 'grid';
    daysGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    daysGrid.style.gap = '6px';
    daysGrid.style.gridAutoRows = '1fr';

    const weekStart = getWeekStart();
    applyFontSize(getFontSize());
    renderWeekdays(weekStart);

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();

    const offset = weekStart === 'monday'
        ? (firstDay === 0 ? 6 : firstDay - 1)
        : firstDay;

    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    monthYearEl.textContent = `${monthNames[month]} ${year}`;
    daysGrid.innerHTML = '';

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

        // Отдельный элемент числа гарантирует, что оно останется читаемым на цветном фоне.
        const dayNumber = document.createElement('span');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);

        const dateStr = formatDate(year, month, day);
        cell.dataset.date = dateStr;

        if (dateStr === todayStr) {
            cell.classList.add('today');
        }

        try {
            if (hasNote(dateStr)) {
                const note = loadNote(dateStr);

                if (note.title || note.text) {
                    cell.title = note.title || note.text.substring(0, 20);
                }

                if (typeof note.color === 'string' && /^#[0-9a-f]{6}$/i.test(note.color)) {
                    cell.classList.add('note-colored');
                    cell.style.setProperty('--note-color', note.color);
                    cell.style.setProperty('--note-text-color', getReadableTextColor(note.color));
                } else {
                    const indicator = document.createElement('span');
                    indicator.className = 'note-indicator color-null';
                    cell.appendChild(indicator);
                }
            }
        } catch (error) {
            // Ошибка чтения одной заметки не должна ломать весь календарь.
            console.warn(`Не удалось загрузить заметку ${dateStr}:`, error);
        }

        cell.addEventListener('click', () => {
            if (getMode() === 'modal') {
                openModal(dateStr);
            } else {
                handleDayClick(dateStr);
            }
        });

        daysGrid.appendChild(cell);
    }

    // Добиваем до 42 ячеек, сохраняя одинаковую высоту сетки.
    const totalCells = 42;
    for (let i = daysGrid.children.length; i < totalCells; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell empty';
        daysGrid.appendChild(emptyCell);
    }
}

export function renderYearView(year) {
    applyFontSize(getFontSize());

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
            if (hasNote(formatDate(year, month, day))) {
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
