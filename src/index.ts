// src/index.ts

import { ConfigManager } from "./configManager";

export * from "./types";
export { ConfigManager } from "./configManager";

/**
 * Default singleton instance.
 *
 * Usage:
 *   import { config } from "your-lib";
 *   const port = config.getNumber("PORT");
 */
export const config = ConfigManager.getInstance();
