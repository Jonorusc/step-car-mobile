export const formatCurrencyBRL = (value: number | string | undefined | null) => {
  if (value === undefined || value === null) return 'R$ 0,00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'R$ 0,00';
  const decimalValue = num / 100;
  
  const parts = decimalValue.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${parts.join(',')}`;
};

export const formatPlateInput = (plate: string) => {
  const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  let formatted = '';

  for (let i = 0; i < clean.length && i < 7; i++) {
    const char = clean[i];

    if (i < 3) {
      if (/[A-Z]/.test(char)) formatted += char;
      else break;
    } else if (i === 3) {
      if (/[0-9]/.test(char)) formatted += '-' + char;
      else break;
    } else if (i === 4) {
      if (/[A-Z0-9]/.test(char)) formatted += char;
      else break;
    } else if (i === 5 || i === 6) {
      if (/[0-9]/.test(char)) formatted += char;
      else break;
    }
  }

  return formatted;
};

export const formatPlateDisplay = (plate: string) => {
  if (!plate) return '';
  return formatPlateInput(plate);
};

export const unformatPlate = (plate: string) => {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
};
