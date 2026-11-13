// js/import.js

import { hasNote, loadNote, saveNote } from './notes.js';

export function importFromICS() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ics,text/calendar';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const content = event.target.result;
                const events = parseICS(content);

                if (events.length === 0) {
                    alert('Не найдено событий с корректной датой в файле');
                    return;
                }

                // В хранилище пока предусмотрена одна заметка на дату.
                // События одного дня объединяются в одну заметку, а существующие данные сохраняются.
                const eventsByDate = new Map();
                events.forEach(item => {
                    if (!eventsByDate.has(item.date)) {
                        eventsByDate.set(item.date, []);
                    }
                    eventsByDate.get(item.date).push(item);
                });

                const conflicts = [...eventsByDate.keys()].filter(date => hasNote(date));

                if (conflicts.length > 0) {
                    const shouldMerge = confirm(
                        `В файле найдено ${events.length} событий.\n` +
                        `${conflicts.length} дат уже содержат заметки.\n\n` +
                        'Продолжить импорт и объединить новые события с существующими заметками?'
                    );

                    if (!shouldMerge) return;
                }

                eventsByDate.forEach((items, date) => {
                    const existing = loadNote(date);
                    const hasExistingContent = Boolean(existing.title || existing.text);
                    let title = existing.title || '';
                    let text = existing.text || '';

                    if (!hasExistingContent && items.length === 1) {
                        // Обычный случай: одна новая запись на свободную дату.
                        title = items[0].summary || 'Заметка';
                        text = items[0].description || '';
                    } else {
                        const importedBlocks = items
                            .map(({ summary, description }) => [summary, description].filter(Boolean).join('\n'))
                            .filter(Boolean);

                        if (!title) {
                            title = items.length === 1
                                ? (items[0].summary || 'Заметка')
                                : `События (${items.length})`;
                        }

                        text = [text, ...importedBlocks].filter(Boolean).join('\n\n');
                    }

                    // Сохраняем цвет старой заметки, если он был задан.
                    saveNote(date, title, text, existing.color || null);
                });

                alert(
                    `Импортировано событий: ${events.length}\n` +
                    `Обновлено дат: ${eventsByDate.size}\n` +
                    `Объединено с существующими заметками: ${conflicts.length}`
                );

                document.dispatchEvent(new CustomEvent('notes-updated'));
            } catch (error) {
                console.error('Ошибка импорта ICS:', error);
                alert('Не удалось импортировать файл. Проверьте, что это корректный файл ICS.');
            }
        };

        reader.onerror = () => {
            alert('Не удалось прочитать выбранный файл');
        };

        reader.readAsText(file);
    };

    input.click();
}

function unfoldIcsLines(icsText) {
    // В iCalendar длинные строки продолжаются со следующей строки, начинающейся с пробела или табуляции.
    return String(icsText)
        .replace(/\r\n[ \t]|\n[ \t]|\r[ \t]/g, '')
        .split(/\r\n|\n|\r/);
}

function unescapeIcsText(value) {
    return value.replace(/\\([nN,;\\])/g, (_, character) => {
        if (character === 'n' || character === 'N') return '\n';
        return character;
    });
}

function parseIcsDate(value) {
    const match = String(value).match(/^(\d{4})(\d{2})(\d{2})/);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }

    return `${match[1]}-${match[2]}-${match[3]}`;
}

function parseICS(icsText) {
    const lines = unfoldIcsLines(icsText);
    const events = [];
    let currentEvent = null;

    for (const line of lines) {
        const structuralLine = line.trim().toUpperCase();

        if (structuralLine === 'BEGIN:VEVENT') {
            currentEvent = {};
            continue;
        }

        if (structuralLine === 'END:VEVENT') {
            if (currentEvent && currentEvent.date) {
                events.push({
                    date: currentEvent.date,
                    summary: currentEvent.summary || '',
                    description: currentEvent.description || ''
                });
            }
            currentEvent = null;
            continue;
        }

        if (!currentEvent) continue;

        const separatorIndex = line.indexOf(':');
        if (separatorIndex === -1) continue;

        const property = line.slice(0, separatorIndex).split(';')[0].toUpperCase();
        const value = line.slice(separatorIndex + 1);

        if (property === 'DTSTART') {
            currentEvent.date = parseIcsDate(value);
        } else if (property === 'SUMMARY') {
            currentEvent.summary = unescapeIcsText(value);
        } else if (property === 'DESCRIPTION') {
            currentEvent.description = unescapeIcsText(value);
        }
    }

    return events;
}
