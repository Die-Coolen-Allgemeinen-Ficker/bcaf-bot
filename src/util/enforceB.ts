export function isValidB (string: string) {
    return !string.match(/^[^🅱]| [^🅱0-9\(\)]/);
}

export function bIfy (string: string) {
    return string.replace(/ [^0-9\(\)]/g, ' 🅱').replace(/^./, '🅱');
}