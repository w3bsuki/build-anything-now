/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as achievements from "../achievements.js";
import type * as cases from "../cases.js";
import type * as clinics from "../clinics.js";
import type * as devSeed from "../devSeed.js";
import type * as donations from "../donations.js";
import type * as notifications from "../notifications.js";
import type * as paymentMethods from "../paymentMethods.js";
import type * as settings from "../settings.js";
import type * as storage from "../storage.js";
import type * as translate from "../translate.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  cases: typeof cases;
  clinics: typeof clinics;
  devSeed: typeof devSeed;
  donations: typeof donations;
  notifications: typeof notifications;
  paymentMethods: typeof paymentMethods;
  settings: typeof settings;
  storage: typeof storage;
  translate: typeof translate;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
