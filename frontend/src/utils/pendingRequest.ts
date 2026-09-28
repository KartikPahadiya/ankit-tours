/**
 * Saves a half-finished request across the login redirect.
 *
 * When a guest presses "Request", we send them to /login first.
 * Whatever they had filled in is stored here (sessionStorage), and
 * the page restores it when they come back — so they only need to
 * press the button once more instead of retyping everything.
 */

const KEY = "pendingRequest";

export type PendingRequest =
  | {
      type: "custom-plan";
      travelDays: number;
      safariType: string;
      safariDate: string;
      safariShift: string;
      hotelCategory: string;
      pickup: boolean;
      village: boolean;
      photography: boolean;
      food: boolean;
    }
  | {
      type: "stay";
      roomId: number | null;
      checkIn: string;
      checkOut: string;
      rooms: number;
    }
  | {
      type: "package";
      packageId: number | null;
      date: string;
      guests: number;
    };

export function savePendingRequest(
  value: PendingRequest
): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode) — login redirect still works.
  }
}

export function consumePendingRequest():
  | PendingRequest
  | null {
  try {
    const raw = sessionStorage.getItem(KEY);

    if (!raw) return null;

    sessionStorage.removeItem(KEY);

    return JSON.parse(raw) as PendingRequest;
  } catch {
    return null;
  }
}
