const { signToken } = require('../../src/utils/jwt');
const { hashPassword, comparePassword } = require('../../src/utils/password');

test('signToken returns a string JWT', () => {
  process.env.JWT_SECRET = 'test_secret_1234567890';
  const token = signToken({ id: 'abc', role: 'user' }, '1h');
  expect(typeof token).toBe('string');
  expect(token.split('.').length).toBe(3);
});

test('hash/compare password works', async () => {
  const hash = await hashPassword('secret');
  expect(hash).toMatch(/\$/);
  const ok = await comparePassword('secret', hash);
  expect(ok).toBe(true);
});
