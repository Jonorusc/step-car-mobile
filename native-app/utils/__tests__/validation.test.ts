import { validateEmail, validatePassword, validateName } from '../validation';

describe('Validation Helpers', () => {
  it('correctly validates email formats', () => {
    expect(validateEmail('test@email.com')).toBe(true);
    expect(validateEmail('user.name+label@sub.domain.co')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
  });

  it('enforces password length constraints', () => {
    expect(validatePassword('123456')).toBe(true);
    expect(validatePassword('abcdefg')).toBe(true);
    expect(validatePassword('12345')).toBe(false);
    expect(validatePassword('')).toBe(false);
  });

  it('enforces name length constraints', () => {
    expect(validateName('Jo')).toBe(true);
    expect(validateName('João Silva')).toBe(true);
    expect(validateName('J')).toBe(false);
    expect(validateName('   ')).toBe(false);
  });
});
