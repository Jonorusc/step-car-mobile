export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2;
}

/**
 * Validate a Brazilian CPF (11 digits) using check-digit algorithm.
 */
export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  // Reject all-same-digit sequences (e.g. 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === parseInt(cleaned[10]);
}

/**
 * Validate a Brazilian CNPJ (14 digits) using check-digit algorithm.
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleaned)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(cleaned[i]) * weights1[i];
  let remainder = sum % 11;
  const d1 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(cleaned[12]) !== d1) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(cleaned[i]) * weights2[i];
  remainder = sum % 11;
  const d2 = remainder < 2 ? 0 : 11 - remainder;
  return parseInt(cleaned[13]) === d2;
}

/**
 * Validate a document as either CPF (≤11 digits) or CNPJ (>11 digits).
 */
export function validateDocument(doc: string): boolean {
  const cleaned = doc.replace(/\D/g, '');
  return cleaned.length <= 11 ? validateCPF(cleaned) : validateCNPJ(cleaned);
}

/**
 * Validate a Brazilian vehicle plate (old format ABC1234 or Mercosul ABC1D23).
 */
export function validatePlate(plate: string): boolean {
  const cleaned = plate.replace(/[-\s]/g, '').toUpperCase();
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(cleaned);
}
