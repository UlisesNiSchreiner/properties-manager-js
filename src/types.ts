// src/types.ts

export interface ConfigManagerOptions {
  /**
   * Base directory where .env files are located.
   * Defaults to process.cwd().
   */
  configDir?: string;

  /**
   * Default scope, e.g. "dev", "prod".
   * Used when no scope is provided in the get*() calls.
   */
  defaultScope?: string;

  /**
   * Optional prefix for process.env lookup.
   * Example: "MYAPP_" → will check "MYAPP_PORT" before "PORT".
   */
  envPrefix?: string;

  /**
   * If true, throws if a key is missing and no default is provided.
   * If false, returns undefined (or default if provided).
   * Default: true
   */
  strict?: boolean;
}

/**
 * Extra options for all getters.
 */
export interface GetOptions<T> {
  /**
   * Scope to use (e.g. "dev", "prod").
   * If omitted, defaultScope is used.
   */
  scope?: string;

  /**
   * Default value if the key is missing or cannot be parsed.
   * When provided, the getter will never throw for missing/invalid value,
   * it will return the default instead.
   */
  default?: T;
}
