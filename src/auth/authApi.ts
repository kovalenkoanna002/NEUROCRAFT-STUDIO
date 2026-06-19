import { z } from "zod";

const USERS_KEY = "neurocraft.users";
const SESSION_KEY = "neurocraft.session";

const PBKDF2_ITERATIONS = 150_000;
const SALT_BYTES = 16;
const HASH_BITS = 256;

const delay = (ms = 250) => new Promise<void>((r) => setTimeout(r, ms));

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
});

export type User = z.infer<typeof userSchema>;

const signUpSchema = z.object({
  username: z.string().trim().min(1, "Введите имя пользователя"),
  email: z.string().trim().toLowerCase().email("Некорректный email"),
  password: z.string().min(6, "Пароль должен быть не короче 6 символов"),
});

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

interface StoredUser extends User {

  password: string;
}

const bytesToB64 = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes));

const b64ToBytes = (b64: string): Uint8Array =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function derive(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    HASH_BITS,
  );
  return new Uint8Array(bits);
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${bytesToB64(salt)}$${bytesToB64(hash)}`;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function verifyPassword(
  password: string,
  stored: string,
): Promise<{ ok: boolean; legacy: boolean }> {
  if (!stored.startsWith("pbkdf2$")) {

    return { ok: password.length > 0 && stored === password, legacy: true };
  }

  try {
    const parts = stored.split("$");
    if (parts.length !== 4) return { ok: false, legacy: false };
    const [, iterStr, saltB64, hashB64] = parts;
    const iterations = Number(iterStr);
    const salt = b64ToBytes(saltB64);
    const expected = b64ToBytes(hashB64);
    if (
      !Number.isFinite(iterations) ||
      iterations <= 0 ||
      expected.length === 0
    ) {
      return { ok: false, legacy: false };
    }
    const baseKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      baseKey,
      expected.length * 8,
    );
    return {
      ok: timingSafeEqual(new Uint8Array(bits), expected),
      legacy: false,
    };
  } catch {
    return { ok: false, legacy: false };
  }
}

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const toPublic = ({ password: _password, ...user }: StoredUser): User => {
  void _password;
  return user;
};

export function readSession(): User | null {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  const user = readUsers().find((u) => u.id === id);
  if (!user) {

    localStorage.removeItem(SESSION_KEY);
    return null;
  }
  return toPublic(user);
}

const normEmail = (email: string) => email.trim().toLowerCase();

export async function getSession(): Promise<User | null> {
  return readSession();
}

export interface SignUpInput {
  username: string;
  email: string;
  password: string;
}

export async function signUp(input: SignUpInput): Promise<User> {
  await delay();
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }
  const { username, email, password } = parsed.data;
  const users = readUsers();

  if (users.some((u) => normEmail(u.email) === email)) {
    throw new Error("Пользователь с таким email уже зарегистрирован");
  }
  const user: StoredUser = {
    id: crypto.randomUUID(),
    username,
    email,
    password: await hashPassword(password),
  };
  writeUsers([...users, user]);
  localStorage.setItem(SESSION_KEY, user.id);
  return toPublic(user);
}

export interface SignInInput {
  email: string;
  password: string;
}

export async function signIn(input: SignInInput): Promise<User> {
  await delay();
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }
  const { email, password } = parsed.data;
  const users = readUsers();
  const user = users.find((u) => normEmail(u.email) === email);
  if (!user) {
    throw new Error("Неверный email или пароль");
  }
  const { ok, legacy } = await verifyPassword(password, user.password);
  if (!ok) {
    throw new Error("Неверный email или пароль");
  }

  if (legacy) {
    user.password = await hashPassword(password);
    writeUsers(users);
  }
  localStorage.setItem(SESSION_KEY, user.id);
  return toPublic(user);
}

export async function signOut(): Promise<void> {
  await delay(150);
  localStorage.removeItem(SESSION_KEY);
}
