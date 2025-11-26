// src/configManager.ts

import { parseEnvFile, resolveEnvPath } from "./envParser";
import type { ConfigManagerOptions, GetOptions } from "./types";

type ScopeName = string | undefined;
type ScopeCache = Record<string, string>;

/**
 * ConfigManager
 *
 * - Singleton by default (ConfigManager.getInstance / config export)
 * - Scoped .env files ( .env, .env.dev, .env.prod, etc. )
 * - Cascading resolution:
 *    1. process.env with prefix (if configured)
 *    2. process.env without prefix
 *    3. scoped file (.env.<scope>)
 *    4. defaultScope file (.env.<defaultScope>)
 *    5. root file (.env)
 */
export class ConfigManager {
  private static instance: ConfigManager | null = null;

  private readonly configDir: string;
  private readonly defaultScope?: string;
  private readonly envPrefix?: string;
  private readonly strict: boolean;

  private readonly cache = new Map<ScopeName, ScopeCache>();

  private constructor(options: ConfigManagerOptions = {}) {
    this.configDir = options.configDir ?? process.cwd();
    this.defaultScope = options.defaultScope;
    this.envPrefix = options.envPrefix;
    this.strict = options.strict ?? true;
  }

  /**
   * Explicit initialization of the singleton.
   * If already initialized, returns existing instance.
   */
  static initialize(options: ConfigManagerOptions = {}): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager(options);
    }
    return ConfigManager.instance;
  }

  /**
   * Get the singleton instance (lazy).
   */
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Clear all cached scopes (useful in tests).
   */
  clearCache(): void {
    this.cache.clear();
  }

  // ---------- INTERNAL RESOLUTION ----------

  private ensureScopeLoaded(scope?: string): ScopeCache {
    if (this.cache.has(scope)) {
      return this.cache.get(scope)!;
    }

    const envPath = resolveEnvPath(this.configDir, scope);
    const parsed = parseEnvFile(envPath);
    this.cache.set(scope, parsed);
    return parsed;
  }

  /**
   * Raw resolution without type parsing.
   */
  private resolveRawValue(key: string, scope?: string): string | undefined {
    // 1. process.env with prefix
    if (this.envPrefix) {
      const prefixed = process.env[`${this.envPrefix}${key}`];
      if (prefixed !== undefined) return prefixed;
    }

    // 2. process.env without prefix
    if (process.env[key] !== undefined) {
      return process.env[key];
    }

    // 3. scope
    if (scope !== undefined) {
      const scoped = this.ensureScopeLoaded(scope);
      if (scoped[key] !== undefined) return scoped[key];
    }

    // 4. default scope
    if (this.defaultScope) {
      const def = this.ensureScopeLoaded(this.defaultScope);
      if (def[key] !== undefined) return def[key];
    }

    // 5. root .env
    const root = this.ensureScopeLoaded(undefined);
    return root[key];
  }

  private handleMissing<T>(key: string, scope: string | undefined, options: GetOptions<T>): T {
    if ("default" in options) {
      return options.default as T;
    }
    if (this.strict) {
      throw new Error(`Config key "${key}" not found (scope="${scope ?? "root"}")`);
    }
    return undefined as unknown as T;
  }

  // ---------- PUBLIC API: TYPE-SPECIFIC GETTERS ----------

  /**
   * Get configuration as string.
   */
  getString(key: string, options: GetOptions<string> = {}): string {
    const scope = options.scope ?? this.defaultScope;
    const raw = this.resolveRawValue(key, scope);

    if (raw === undefined || raw === null) {
      return this.handleMissing(key, scope, options);
    }

    return raw;
  }

  /**
   * Get configuration as number (finite).
   */
  getNumber(key: string, options: GetOptions<number> = {}): number {
    const scope = options.scope ?? this.defaultScope;
    const raw = this.resolveRawValue(key, scope);

    if (raw === undefined || raw === null) {
      return this.handleMissing(key, scope, options);
    }

    const n = Number(raw);
    if (!Number.isFinite(n)) {
      if ("default" in options) {
        return options.default as number;
      }
      throw new TypeError(`Config key "${key}" expected a finite number, got "${raw}"`);
    }

    return n;
  }

  /**
   * Get configuration as boolean.
   * Accepted truthy:  "true", "1", "yes", "on"
   * Accepted falsy:   "false", "0", "no", "off"
   */
  getBoolean(key: string, options: GetOptions<boolean> = {}): boolean {
    const scope = options.scope ?? this.defaultScope;
    const raw = this.resolveRawValue(key, scope);

    if (raw === undefined || raw === null) {
      return this.handleMissing(key, scope, options);
    }

    const lc = raw.toLowerCase();

    if (["true", "1", "yes", "on"].includes(lc)) {
      return true;
    }
    if (["false", "0", "no", "off"].includes(lc)) {
      return false;
    }

    if ("default" in options) {
      return options.default as boolean;
    }

    throw new TypeError(`Config key "${key}" expected a boolean, got "${raw}"`);
  }

  /**
   * Get configuration as parsed JSON.
   *
   * Example:
   *  APP_CONFIG={"feature":true,"retries":3}
   *
   *  const cfg = config.getJson<{ feature: boolean; retries: number }>("APP_CONFIG");
   */
  getJson<T = unknown>(key: string, options: GetOptions<T> = {}): T {
    const scope = options.scope ?? this.defaultScope;
    const raw = this.resolveRawValue(key, scope);

    if (raw === undefined || raw === null) {
      return this.handleMissing(key, scope, options);
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      if ("default" in options) {
        return options.default as T;
      }
      throw new TypeError(`Config key "${key}" expected valid JSON, got "${raw}"`);
    }
  }
}
