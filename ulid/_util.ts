// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.

/** Type for a ULID generator function. */
export type ULID = (seedTime?: number) => string;

// These values should NEVER change. If
// they do, we're no longer making ulids!
export const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford's Base32
export const ENCODING_LEN = ENCODING.length;
export const TIME_MAX = Math.pow(2, 48) - 1;
export const TIME_LEN = 10;
export const RANDOM_LEN = 16;

function replaceCharAt(str: string, index: number, char: string) {
  return str.substring(0, index) + char + str.substring(index + 1);
}

export function encodeTime(now: number, len: number = TIME_LEN): string {
  if (!Number.isInteger(now) || now < 0 || now > TIME_MAX) {
    throw new Error("Time must be a positive integer less than " + TIME_MAX);
  }
  let str = "";
  for (; len > 0; len--) {
    const mod = now % ENCODING_LEN;
    str = ENCODING[mod] + str;
    now = (now - mod) / ENCODING_LEN;
  }
  return str;
}

export function encodeRandom(len: number): string {
  let str = "";
  const randomBytes = crypto.getRandomValues(new Uint8Array(len));
  for (let i = 0; i < len; i++) {
    str += ENCODING[randomBytes[i] % ENCODING_LEN];
  }
  return str;
}

export function incrementBase32(str: string): string {
  let index = str.length;
  let char;
  let charIndex;
  const maxCharIndex = ENCODING_LEN - 1;
  while (--index >= 0) {
    char = str[index];
    charIndex = ENCODING.indexOf(char);
    if (charIndex === -1) {
      throw new Error("incorrectly encoded string");
    }
    if (charIndex === maxCharIndex) {
      str = replaceCharAt(str, index, ENCODING[0]);
      continue;
    }
    return replaceCharAt(str, index, ENCODING[charIndex + 1]);
  }
  throw new Error("cannot increment this string");
}

/** Generates a monotonically increasing ULID. */
export function monotonicFactory(encodeRand = encodeRandom): ULID {
  let lastTime = 0;
  let lastRandom: string;
  return function ulid(seedTime: number = Date.now()): string {
    if (seedTime <= lastTime) {
      const incrementedRandom = (lastRandom = incrementBase32(lastRandom));
      return encodeTime(lastTime, TIME_LEN) + incrementedRandom;
    }
    lastTime = seedTime;
    const newRandom = (lastRandom = encodeRand(RANDOM_LEN));
    return encodeTime(seedTime, TIME_LEN) + newRandom;
  };
}
