// js/export.js

import { getAllNotes } from './notes.js';

export function exportToICS() {
    const notes = getAllNotes();
    if (notes.length === 0) {
        alert('Нет заметок для экспорта');
        return;
    }

    let ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//DCalendar//RU',
        'CALSCALE:GREGORIAN'
    ];

    notes.forEach(({ date, title, text }) => {
        const [year, month, day] = date.split('-').map(Number);
        const dateStr = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
        const summary = title || 'Заметка';
        const description = text || '';
        ics.push(
            'BEGIN:VEVENT',
            `DTSTART;VALUE=DATE:${dateStr}`,
            `DTEND;VALUE=DATE:${dateStr}`,
            `SUMMARY:${summary}`,
            `DESCRIPTION:${description}`,
            'END:VEVENT'
        );
    });

    ics.push('END:VCALENDAR');
    const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'calendar.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}