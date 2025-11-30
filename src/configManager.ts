import { parseEnvFile, resolveEnvPath } from "./envParser";
import type { ConfigManagerOptions, GetOptions } from "./types";
import * as path from "node:path";

type ScopeName = string | undefined;
type ScopeCache = Record<string, string>;

/**
 * ConfigManager
 *
 * - Singleton by default (ConfigManager.getInstance / config export)
 * - Scoped config files: ./config/config.<scope>
 * - Scope resolution:
 *    1. options.scope (per call)
 *    2. override set via config.load(scope)
 *    3. process.env[scopeEnvVarName]  (default: SCOPE)
 *    4. defaultScope (default: "dev")
 *
 * - Value resolution order (once scope is resolved):
 *    1. process.env with prefix (if configured)
 *    2. process.env without prefix
 *    3. config file for resolved scope
 *    4. defaultScope file (if different)
 *    5. (no root file; everything vive en ./config/config.*)
 */
export class ConfigManager {
  private static instance: ConfigManager | null = null;

  private readonly configDir: string;
  private readonly defaultScope: string;
  private readonly envPrefix?: string;
  private readonly strict: boolean;
  private readonly scopeEnvVarName: string;

  /**
   * Scope override set via config.load(scope).
   * If undefined, scope is resolved from env var / defaultScope.
   */
  private overrideScope?: string;

  private readonly cache = new Map<ScopeName, ScopeCache>();

  private constructor(options: ConfigManagerOptions = {}) {
    // Por defecto, usamos ./config como directorio raíz
    this.configDir = options.configDir ?? path.resolve(process.cwd(), "config");
    this.defaultScope = options.defaultScope ?? "dev";
    this.envPrefix = options.envPrefix;
    this.strict = options.strict ?? true;
    // Por defecto, buscamos SCOPE como variable de entorno
    this.scopeEnvVarName = options.scopeEnvVarName ?? "SCOPE";
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

  /**
   * Set or clear the current override scope.
   *
   * If you call:
   *   config.load("qa")  → uses ./config/config.qa by default
   *   config.load()      → back to env/default-based resolution
   */
  load(scope?: string): void {
    this.overrideScope = scope;
    this.clearCache();
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
   * Resolve the effective scope for a given call.
   *
   * Priority:
   *  1. explicitScope (options.scope)
   *  2. overrideScope set by load()
   *  3. process.env[scopeEnvVarName]  (e.g. SCOPE)
   *  4. defaultScope (e.g. "dev")
   */
  private resolveScope(explicitScope?: string): string {
    if (explicitScope !== undefined) {
      return explicitScope;
    }

    if (this.overrideScope !== undefined) {
      return this.overrideScope;
    }

    const envScope = this.scopeEnvVarName ? process.env[this.scopeEnvVarName] : undefined;

    if (envScope && envScope.length > 0) {
      return envScope;
    }

    return this.defaultScope;
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

    // 3. current scope file
    if (scope !== undefined) {
      const scoped = this.ensureScopeLoaded(scope);
      if (scoped[key] !== undefined) return scoped[key];
    }

    // 4. fallback to defaultScope file (if different)
    if (this.defaultScope && this.defaultScope !== scope) {
      const def = this.ensureScopeLoaded(this.defaultScope);
      if (def[key] !== undefined) return def[key];
    }

    // 5. no root file; si no está, devolvemos undefined
    return undefined;
  }

  private handleMissing<T>(key: string, scope: string | undefined, options: GetOptions<T>): T {
    if ("default" in options) {
      return options.default as T;
    }
    if (this.strict) {
      throw new Error(`Config key "${key}" not found (scope="${scope ?? "unknown"}")`);
    }
    return undefined as unknown as T;
  }

  // ---------- PUBLIC API: TYPE-SPECIFIC GETTERS ----------

  /**
   * Get configuration as string.
   */
  getString(key: string, options: GetOptions<string> = {}): string {
    const scope = this.resolveScope(options.scope);
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
    const scope = this.resolveScope(options.scope);
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
    const scope = this.resolveScope(options.scope);
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
    const scope = this.resolveScope(options.scope);
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
