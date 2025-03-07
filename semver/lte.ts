// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import type { SemVer } from "./types.ts";
import { compare } from "./compare.ts";

/** Less than or equal to comparison */
export function lte(
  s0: SemVer,
  s1: SemVer,
): boolean {
  return compare(s0, s1) <= 0;
}
