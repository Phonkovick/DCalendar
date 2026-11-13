// js/export.js

import { getAllNotes } from './notes.js';

function escapeIcsText(value) {
    return String(value ?? '')
        .replace(/\\/g, '\\\\')
        .replace(/\r\n|\n|\r/g, '\\n')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;');
}

function formatIcsDate(year, month, day) {
    return `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
}

function getNextIcsDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const nextDate = new Date(Date.UTC(year, month - 1, day + 1));
    return formatIcsDate(
        nextDate.getUTCFullYear(),
        nextDate.getUTCMonth() + 1,
        nextDate.getUTCDate()
    );
}

function foldIcsLine(value) {
    const encoder = new TextEncoder();
    const chunks = [];
    let currentLine = '';
    let byteLength = 0;

    for (const character of String(value)) {
        const characterLength = encoder.encode(character).length;

        if (currentLine && byteLength + characterLength > 75) {
            chunks.push(currentLine);
            currentLine = ` ${character}`;
            byteLength = 1 + characterLength;
        } else {
            currentLine += character;
            byteLength += characterLength;
        }
    }

    if (currentLine) chunks.push(currentLine);
    return chunks.join('\r\n');
}

export function exportToICS() {
    const notes = getAllNotes()
        .filter(({ date }) => /^\d{4}-\d{2}-\d{2}$/.test(date))
        .sort((a, b) => a.date.localeCompare(b.date));

    if (notes.length === 0) {
        alert('Нет заметок для экспорта');
        return;
    }

    const stamp = new Date().toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z$/, 'Z');

    const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//DCalendar//RU',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ];

    notes.forEach(({ date, title, text }, index) => {
        const [year, month, day] = date.split('-').map(Number);
        const dateStr = formatIcsDate(year, month, day);
        const summary = title || 'Заметка';
        const description = text || '';

        ics.push(
            'BEGIN:VEVENT',
            `UID:${date}-${index + 1}@dcalendar.local`,
            `DTSTAMP:${stamp}`,
            `DTSTART;VALUE=DATE:${dateStr}`,
            // DTEND для события на целый день — исключающая граница, то есть следующий день.
            `DTEND;VALUE=DATE:${getNextIcsDate(date)}`,
            `SUMMARY:${escapeIcsText(summary)}`,
            `DESCRIPTION:${escapeIcsText(description)}`,
            'END:VEVENT'
        );
    });

    ics.push('END:VCALENDAR');

    const content = ics.map(foldIcsLine).join('\r\n') + '\r\n';
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'calendar.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Не отзывать URL синхронно: браузеру нужно время, чтобы начать загрузку.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
