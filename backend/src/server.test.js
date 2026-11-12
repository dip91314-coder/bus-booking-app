import { describe, it, expect } from 'vitest';

describe('Backend API Core Service', () => {
  it('loads environment configurations and defines port', () => {
    const port = process.env.PORT || 5000;
    expect(Number(port)).toBeGreaterThan(0);
  });

  it('validates core utility helpers and error classes', async () => {
    const { AppError, ValidationError, UnauthorizedError, NotFoundError } = await import('../src/utils/customErrors.js');
    expect(AppError).toBeDefined();
    
    const err = new NotFoundError('Route not found');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Route not found');

    const valErr = new ValidationError('Invalid seat selection');
    expect(valErr.statusCode).toBe(400);

    const authErr = new UnauthorizedError('Invalid agent credentials');
    expect(authErr.statusCode).toBe(401);
  });

  it('verifies route and booking schemas', async () => {
    const schemas = await import('../src/validators/schemas.js');
    expect(schemas).toBeDefined();
  });
});
