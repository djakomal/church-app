import {
  emailValidator,
  passwordValidator,
  nameValidator,
  confirmPasswordValidator,
  loginFormValidator,
  registerFormValidator,
} from '../../hooks/useFormValidation';

describe('emailValidator', () => {
  it('should reject empty email', () => {
    expect(emailValidator('')).toBeDefined();
    expect(emailValidator('   ')).toBeDefined();
  });

  it('should reject invalid email format', () => {
    expect(emailValidator('notanemail')).toBeDefined();
    expect(emailValidator('@domain.com')).toBeDefined();
    expect(emailValidator('user@')).toBeDefined();
  });

  it('should accept valid email', () => {
    expect(emailValidator('test@church.com')).toBeUndefined();
    expect(emailValidator('user.name@domain.co')).toBeUndefined();
  });
});

describe('passwordValidator', () => {
  const validate = passwordValidator(6);

  it('should reject empty password', () => {
    expect(validate('')).toBeDefined();
    expect(validate('   ')).toBeDefined();
  });

  it('should reject short password', () => {
    expect(validate('abc')).toBeDefined();
    expect(validate('12345')).toBeDefined();
  });

  it('should accept password of minimum length', () => {
    expect(validate('abcdef')).toBeUndefined();
    expect(validate('myLongPassword')).toBeUndefined();
  });
});

describe('nameValidator', () => {
  it('should reject empty name', () => {
    expect(nameValidator('')).toBeDefined();
    expect(nameValidator('   ')).toBeDefined();
  });

  it('should reject name with less than 2 characters', () => {
    expect(nameValidator('A')).toBeDefined();
    expect(nameValidator('B')).toBeDefined();
  });

  it('should accept valid name', () => {
    expect(nameValidator('John')).toBeUndefined();
    expect(nameValidator('Jean Dupont')).toBeUndefined();
  });
});

describe('confirmPasswordValidator', () => {
  const validate = confirmPasswordValidator('myPassword');

  it('should reject empty confirmation', () => {
    expect(validate('')).toBeDefined();
  });

  it('should reject non-matching password', () => {
    expect(validate('differentPassword')).toBeDefined();
  });

  it('should accept matching password', () => {
    expect(validate('myPassword')).toBeUndefined();
  });
});

describe('loginFormValidator', () => {
  it('should reject empty email', () => {
    const result = loginFormValidator({ email: '', password: 'pass123' });
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should reject empty password', () => {
    const result = loginFormValidator({ email: 'test@test.com', password: '' });
    expect(result.isValid).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = loginFormValidator({ email: 'invalid', password: 'pass123' });
    expect(result.isValid).toBe(false);
  });

  it('should accept valid credentials', () => {
    const result = loginFormValidator({ email: 'test@church.com', password: 'pass123' });
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe('registerFormValidator', () => {
  it('should reject empty name', () => {
    const result = registerFormValidator({
      name: '', email: 'test@test.com',
      password: 'pass123', confirmPassword: 'pass123', role: 'viewer',
    });
    expect(result.isValid).toBe(false);
  });

  it('should reject password mismatch', () => {
    const result = registerFormValidator({
      name: 'John', email: 'test@test.com',
      password: 'pass123', confirmPassword: 'different', role: 'viewer',
    });
    expect(result.isValid).toBe(false);
  });

  it('should accept valid registration', () => {
    const result = registerFormValidator({
      name: 'John Doe', email: 'john@church.com',
      password: 'pass123', confirmPassword: 'pass123', role: 'viewer',
    });
    expect(result.isValid).toBe(true);
  });
});
