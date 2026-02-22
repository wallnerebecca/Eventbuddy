export function getLang() {
    if (navigator.languages !== undefined)
        return navigator.languages[0];
    return navigator.language;
}

export const getDateString = (date) => {
    const newDate = date ? new Date(date) : new Date();
    return new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000).toISOString().slice(0, -1);
};