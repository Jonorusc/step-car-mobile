export function useCoinsFormatted(value: string | number) {
    let convertString = value.toString();
    return maskCoin(convertString);
}

const maskCoin = (event: any) => {
    const onlyDigits = event
        .split('')
        .filter((s: any) => /\d/.test(s))
        .join('')
        .padStart(3, '0');
    const digitsFloat = onlyDigits.slice(0, -2) + '.' + onlyDigits.slice(-2);
    return maskCurrency(digitsFloat);
};

const maskCurrency = (valor: any, locale = 'pt-BR', currency = 'BRL') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
    }).format(valor);
};
