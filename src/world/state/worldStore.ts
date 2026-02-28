import type { OffriOverlayState, RoomId, TransitionState } from "@/world/types";

export type WorldUiState = {
  currentRoom: RoomId;
  targetRoom: RoomId;
  transition: TransitionState | null;
  introSeen: boolean;
  introLocked: boolean;
  audioEnabled: boolean;
  showOffriOverlay: boolean;
  offri: OffriOverlayState;
  selectedOfferingId: string | null;
};

export type WorldUiAction =
  | { type: "SET_CURRENT_ROOM"; room: RoomId }
  | { type: "SET_TARGET_ROOM"; room: RoomId }
  | { type: "START_TRANSITION"; transition: TransitionState }
  | { type: "END_TRANSITION" }
  | { type: "SET_INTRO_SEEN"; seen: boolean }
  | { type: "SET_INTRO_LOCKED"; locked: boolean }
  | { type: "SET_AUDIO"; enabled: boolean }
  | { type: "TOGGLE_AUDIO" }
  | { type: "SET_OFFRI_OVERLAY"; open: boolean }
  | { type: "SET_OFFRI_STEP"; step: 1 | 2 | 3 | 4 | 5 }
  | {
      type: "SET_OFFRI_MEDIA";
      mediaType: "image" | "video" | "audio" | "text" | "pdf" | "link" | null;
    }
  | { type: "SET_OFFRI_SUBMITTING"; submitting: boolean }
  | { type: "SET_OFFRI_SUBMITTED"; submitted: boolean }
  | { type: "SET_SELECTED_OFFERING"; offeringId: string | null }
  | { type: "RESET_OFFRI" };

const INTRO_STORAGE_KEY = "cava_world_intro_seen_v1";
const AUDIO_STORAGE_KEY = "cava_world_audio_enabled_v1";

const readBoolean = (key: string, fallback: boolean) => {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (raw === "1") return true;
  if (raw === "0") return false;
  return fallback;
};

export const createInitialWorldUiState = (initialRoom: RoomId): WorldUiState => {
  const introSeen = readBoolean(INTRO_STORAGE_KEY, false);
  const audioEnabled = readBoolean(AUDIO_STORAGE_KEY, true);

  return {
    currentRoom: initialRoom,
    targetRoom: initialRoom,
    transition: null,
    introSeen,
    introLocked: !introSeen,
    audioEnabled,
    showOffriOverlay: initialRoom === "offri_room",
    offri: {
      isOpen: initialRoom === "offri_room",
      step: 1,
      mediaType: null,
      submitting: false,
      submitted: false,
    },
    selectedOfferingId: null,
  };
};

export const persistIntroSeen = (seen: boolean) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INTRO_STORAGE_KEY, seen ? "1" : "0");
};

export const persistAudioEnabled = (enabled: boolean) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUDIO_STORAGE_KEY, enabled ? "1" : "0");
};

export const worldUiReducer = (state: WorldUiState, action: WorldUiAction): WorldUiState => {
  switch (action.type) {
    case "SET_CURRENT_ROOM": {
      const enteringOffri = action.room === "offri_room";
      return {
        ...state,
        currentRoom: action.room,
        showOffriOverlay: enteringOffri,
        offri: enteringOffri
          ? { ...state.offri, isOpen: true }
          : { ...state.offri, isOpen: false },
      };
    }
    case "SET_TARGET_ROOM":
      return { ...state, targetRoom: action.room };
    case "START_TRANSITION":
      return { ...state, transition: action.transition, targetRoom: action.transition.to };
    case "END_TRANSITION":
      return { ...state, transition: null };
    case "SET_INTRO_SEEN":
      return { ...state, introSeen: action.seen };
    case "SET_INTRO_LOCKED":
      return { ...state, introLocked: action.locked };
    case "SET_AUDIO":
      return { ...state, audioEnabled: action.enabled };
    case "TOGGLE_AUDIO":
      return { ...state, audioEnabled: !state.audioEnabled };
    case "SET_OFFRI_OVERLAY":
      return {
        ...state,
        showOffriOverlay: action.open,
        offri: { ...state.offri, isOpen: action.open },
      };
    case "SET_OFFRI_STEP":
      return { ...state, offri: { ...state.offri, step: action.step } };
    case "SET_OFFRI_MEDIA":
      return { ...state, offri: { ...state.offri, mediaType: action.mediaType } };
    case "SET_OFFRI_SUBMITTING":
      return { ...state, offri: { ...state.offri, submitting: action.submitting } };
    case "SET_OFFRI_SUBMITTED":
      return { ...state, offri: { ...state.offri, submitted: action.submitted } };
    case "SET_SELECTED_OFFERING":
      return { ...state, selectedOfferingId: action.offeringId };
    case "RESET_OFFRI":
      return {
        ...state,
        offri: {
          isOpen: state.currentRoom === "offri_room",
          step: 1,
          mediaType: null,
          submitting: false,
          submitted: false,
        },
      };
    default:
      return state;
  }
};
