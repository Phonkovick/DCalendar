// js/notes.js

export function getNoteKey(dateStr) {
    return `note-${dateStr}`;
}

export function loadNote(dateStr) {
    const raw = localStorage.getItem(getNoteKey(dateStr));
    if (!raw) return { title: '', text: '', color: null };

    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) {
            return {
                title: parsed.title || '',
                text: parsed.text || '',
                color: parsed.color || null
            };
        }
        if (typeof parsed === 'string') {
            return { title: '', text: parsed, color: null };
        }
        return { title: '', text: '', color: null };
    } catch {
        return { title: '', text: raw, color: null };
    }
}

export function saveNote(dateStr, title, text, color = null) {
    const data = {
        title: title.trim() || '',
        text: text.trim() || '',
        color: color || null
    };
    if (!data.title && !data.text && !data.color) {
        localStorage.removeItem(getNoteKey(dateStr));
    } else {
        localStorage.setItem(getNoteKey(dateStr), JSON.stringify(data));
    }
}

export function hasNote(dateStr) {
    return localStorage.getItem(getNoteKey(dateStr)) !== null;
}

export function getNoteColor(dateStr) {
    const note = loadNote(dateStr);
    return note.color || null;
}