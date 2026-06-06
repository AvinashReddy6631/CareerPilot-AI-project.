import { EMPTY_RESUME } from "./resumeDefaults";

export const DRAFT_STORAGE_KEY = "careerpilot_resume_draft";

export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDraft(data) {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
}

export function mergeWithDefaults(draft) {
  if (!draft) return EMPTY_RESUME;
  return {
    ...EMPTY_RESUME,
    ...draft,
    personal: { ...EMPTY_RESUME.personal, ...draft.personal },
  };
}
