export function isNword (string: string) {
    return string.match(/ +n+(i|e|1)+g+r*(a|e|o|ö)+r* +/g)?.length;
}