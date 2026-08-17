// Password hashing helpers. We NEVER store plain passwords — only bcrypt hashes.
// bcryptjs is a pure-JS implementation (no native build step), which keeps
// setup painless on Windows.
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, SALT_ROUNDS)

export const comparePassword = (
  plain: string,
  hash: string
): Promise<boolean> => bcrypt.compare(plain, hash)
