import { EMPTY_RESUME } from "./resumeDefaults";

export const DRAFT_STORAGE_PREFIX = "resumeDraft";
const AUTH_USER_KEY = "careerpilot_user";

function getStoredUserId() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?._id || user?.id || null;
  } catch (error) {
    console.error("Failed to read authenticated user for resume draft", error);
    return null;
  }
}

export function getDraftStorageKey(userId = getStoredUserId()) {
  return userId ? `${DRAFT_STORAGE_PREFIX}_${userId}` : null;
}

export function loadDraft(userId) {
  try {
    const key = getDraftStorageKey(userId);
    if (!key) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to load resume draft", error);
    return null;
  }
}

export function saveDraft(data, userId) {
  try {
    const key = getDraftStorageKey(userId);
    if (!key) return false;
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Failed to save resume draft", error);
    return false;
  }
}

export function clearDraft(userId) {
  try {
    const key = getDraftStorageKey(userId);
    if (key) localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to clear resume draft", error);
  }
}

export function mergeWithDefaults(draft) {
  if (!draft) return EMPTY_RESUME;
  return {
    ...EMPTY_RESUME,
    ...draft,
    personal: { ...EMPTY_RESUME.personal, ...draft.personal },
  };
}
