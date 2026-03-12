/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as prerequisiteChecker from "../prerequisiteChecker.js";
import type * as programs from "../programs.js";
import type * as queries from "../queries.js";
import type * as recommendations from "../recommendations.js";
import type * as students from "../students.js";
import type * as uploadPrograms from "../uploadPrograms.js";
import type * as uplooadInstitutions from "../uplooadInstitutions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  prerequisiteChecker: typeof prerequisiteChecker;
  programs: typeof programs;
  queries: typeof queries;
  recommendations: typeof recommendations;
  students: typeof students;
  uploadPrograms: typeof uploadPrograms;
  uplooadInstitutions: typeof uplooadInstitutions;
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
