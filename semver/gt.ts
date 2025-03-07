// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import type { SemVer } from "./types.ts";
import { compare } from "./compare.ts";

/** Greater than comparison */
export function gt(
  s0: SemVer,
  s1: SemVer,
): boolean {
  return compare(s0, s1) > 0;
}
