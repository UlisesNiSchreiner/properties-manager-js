export interface ConfigManagerOptions {
  /**
   * Base directory where config files are located.
   * Defaults to "<process.cwd()>/config".
   */
  configDir?: string;

  /**
   * Default scope, e.g. "dev", "prod".
   * Used when no scope is resolved from:
   *   1. override via load()
   *   2. environment variable
   * Defaults to "dev".
   */
  defaultScope?: string;

  /**
   * Optional prefix for process.env lookup.
   * Example: "MYAPP_" → will check "MYAPP_PORT" before "PORT".
   */
  envPrefix?: string;

  /**
   * Name of the environment variable used to infer the current scope.
   * Defaults to "SCOPE".
   *
   * Example:
   *   scopeEnvVarName = "SCOPE"
   *   process.env.SCOPE = "qa" → uses ./config/config.qa
   */
  scopeEnvVarName?: string;

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
   *
   * Resolution order when calling a getter:
   *   1. options.scope
   *   2. override set via config.load(...)
   *   3. process.env[scopeEnvVarName]
   *   4. defaultScope
   */
  scope?: string;

  /**
   * Default value if the key is missing or cannot be parsed.
   * When provided, the getter will never throw for missing/invalid value,
   * it will return the default instead.
   */
  default?: T;
}
