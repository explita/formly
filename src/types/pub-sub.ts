import { Path } from "./path.js";

export type ChannelEvent<T> =
  | "validate:before"
  | "validate:after"
  | "submit:before"
  | "submit:after"
  | "field:mount"
  | "field:unmount"
  | "schema:ready"
  | "settings:ready"
  | "value:*"
  | `value:${Path<T>}`;
