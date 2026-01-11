import { debounce } from "./debounce";

function getDrafts(): Record<string, unknown> {
  const stored = localStorage.getItem("drafts");
  if (!stored) return {};

  try {
    return JSON.parse(stored) || {};
  } catch {
    localStorage.removeItem("drafts"); // corrupted data
    return {};
  }
}

function setDrafts(drafts: Record<string, unknown>): void {
  if (Object.keys(drafts).length === 0) {
    localStorage.removeItem("drafts");
  } else {
    localStorage.setItem("drafts", JSON.stringify(drafts));
  }
}

/**
 * Writes a draft to local storage immediately.
 * This function takes a draft key and a draft value as arguments.
 * It will update the local storage with the new draft value.
 *
 * Note: This function is not debounced and will write to local storage immediately, and don't use it for performance critical code.
 */
export function writeDraftImmediate<T extends unknown>(
  draftKey: string,
  data: T
) {
  const drafts = getDrafts();
  const newDrafts = { ...drafts, [draftKey]: data };
  setDrafts(newDrafts);
}

/**
 * Writes a draft to local storage.
 * This function is debounced to prevent excessive writes to local storage.
 * The function takes a draft key and a draft value as arguments.
 * It will update the local storage with the new draft value.
 *
 * Note: This function is debounced and will write to local storage after a delay of 200ms, good for performance.
 */
export const writeDraft = debounce(writeDraftImmediate, 200);

/**
 * Reads a draft from local storage.
 * This function takes a draft key as an argument and returns the corresponding * draft value.
 * If the draft key does not exist in local storage, the function will return
 * undefined.
 */
export function readDraft(draftKey: string): unknown {
  const drafts = getDrafts();
  return drafts[draftKey];
}

/**
 * Deletes a draft from local storage.
 * This function takes a draft key as an argument and removes the corresponding draft from local storage.
 */
export function deleteDraft(draftKey: string): void {
  const drafts = getDrafts();

  const newDrafts = Object.fromEntries(
    Object.entries(drafts).filter(([key]) => key !== draftKey)
  );

  setDrafts(newDrafts);
}
