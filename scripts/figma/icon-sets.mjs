/**
 * Shared configuration for the Figma icon pipeline.
 *
 * Single source of truth for the Figma file key, the icon sets (and the
 * category frame node-id each set is exported from), and the on-disk layout
 * of node maps and SVG output directories.
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const FILE_KEY = 'M5Pmju2u0V1D44toH41Eoi'

/** Icon set name → category frame node-id in the UI Kit General file. */
export const SETS = {
  general: '3463:407907',
  arrows: '3463:407732',
  users: '3463:408155',
  layout: '3463:407486',
  alerts: '3463:408100',
  shapes: '3463:408128',
  media: '3463:408198',
  images: '3463:408308',
  communication: '3463:408339',
  editor: '3463:408399',
  time: '3463:408505',
  files: '3463:408535',
  maps: '3463:408594',
  weather: '3463:408638',
  education: '3463:407640',
  development: '3463:407673',
  finance: '3463:407826',
  security: '3463:407602',
  charts: '3463:407551',
}

const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url))

/** @param {string} set */
export function iconDir(set) {
  return path.join(REPO_ROOT, 'src', 'runtime', 'assets', 'icons', set)
}

/** @param {string} set */
export function nodeMapPath(set) {
  return path.join(REPO_ROOT, 'scripts', 'figma', `${set}-icons.node-map.json`)
}

/**
 * Expands CLI args into a validated, deduplicated list of set names.
 * `all` expands to every configured set. Returns null when no args given,
 * so callers can print usage instead of silently defaulting.
 *
 * @param {string[]} args
 * @returns {string[] | null} the resolved set names, or null when args is empty
 */
export function resolveSets(args) {
  if (!args.length) return null
  const expanded = args.flatMap(arg => (arg === 'all' ? Object.keys(SETS) : [arg]))
  const unknown = expanded.filter(set => !Object.hasOwn(SETS, set))
  if (unknown.length) {
    throw new Error(
      `Unknown icon set(s): ${unknown.join(', ')}. Valid sets: ${Object.keys(SETS).join(', ')} (or "all").`,
    )
  }
  return [...new Set(expanded)]
}

class FatalHttpError extends Error {}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * fetch() with retries for 429 (honoring Retry-After) and 5xx/network errors.
 * Non-retryable HTTP errors throw immediately.
 *
 * @param {string | URL} url
 * @param {RequestInit} [init]
 * @param {{ attempts?: number, baseDelayMs?: number }} [options]
 * @returns {Promise<Response>} the successful response
 */
export async function fetchWithRetry(url, init = {}, { attempts = 5, baseDelayMs = 2000 } = {}) {
  let lastError
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const res = await fetch(url, init)
      if (res.ok) return res
      if (res.status !== 429 && res.status < 500) {
        const text = await res.text().catch(() => '')
        throw new FatalHttpError(`Request failed (${res.status}): ${text}`)
      }
      lastError = new Error(`Request failed (${res.status}) for ${url}`)
      if (attempt === attempts - 1) break
      const retryAfterSec = Number(res.headers.get('retry-after'))
      const delayMs = Number.isFinite(retryAfterSec) && retryAfterSec > 0
        ? retryAfterSec * 1000
        : baseDelayMs * 2 ** attempt + Math.random() * 1000
      await sleep(delayMs)
    }
    catch (error) {
      if (error instanceof FatalHttpError) throw error
      lastError = error
      if (attempt === attempts - 1) break
      await sleep(baseDelayMs * 2 ** attempt + Math.random() * 1000)
    }
  }
  throw lastError ?? new Error('fetchWithRetry: exhausted retries')
}
