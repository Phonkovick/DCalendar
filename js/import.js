// js/import.js

import { saveNote } from './notes.js';

export function importFromICS() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ics,text/calendar';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            const events = parseICS(content);
            if (events.length === 0) {
                alert('Не найдено событий в файле');
                return;
            }
            let count = 0;
            events.forEach(({ date, summary, description }) => {
                saveNote(date, summary, description);
                count++;
            });
            alert(`Импортировано ${count} заметок`);
            document.dispatchEvent(new CustomEvent('notes-updated'));
        };
        reader.readAsText(file);
    };
    input.click();
}

function parseICS(icsText) {
    const lines = icsText.split(/\r?\n/);
    const events = [];
    let currentEvent = null;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === 'BEGIN:VEVENT') {
            currentEvent = {};
        } else if (trimmed === 'END:VEVENT') {
            if (currentEvent && currentEvent.date) {
                events.push(currentEvent);
            }
            currentEvent = null;
        } else if (currentEvent) {
            if (trimmed.startsWith('DTSTART;VALUE=DATE:')) {
                const dateStr = trimmed.replace('DTSTART;VALUE=DATE:', '').trim();
                if (dateStr.length === 8) {
                    currentEvent.date = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
                }
            } else if (trimmed.startsWith('SUMMARY:')) {
                currentEvent.summary = trimmed.replace('SUMMARY:', '').trim();
            } else if (trimmed.startsWith('DESCRIPTION:')) {
                currentEvent.description = trimmed.replace('DESCRIPTION:', '').trim();
            }
        }
    }
    return events;
}