export const SEAT_MARKER = "__seatReservation";
export class SeatAllocationError extends Error { readonly status = 409; }
type Program = {
  firstAuthorSeats: number; firstAuthorSeatsLeft: number;
  coAuthorSeats: number; coAuthorSeatsLeft: number;
  seatsLeft: number; status: string; category: string;
};
type Registration = { authorRole: string; customFields?: Record<string, string> | null };

// Legacy rejected records still hold a seat until explicitly reconciled.
export function holdsSeat(registration: Registration) {
  return registration.customFields?.[SEAT_MARKER] !== "released";
}

export function seatChange(program: Program, registration: Registration, target: string) {
  const needed = target !== "rejected" && target !== "deleted";
  if (needed === holdsSeat(registration)) return null;
  const first = registration.authorRole === "first_author";
  if (needed && (program.status !== "open" || program.category !== "active" ||
      program.seatsLeft < 1 || (first ? program.firstAuthorSeatsLeft : program.coAuthorSeatsLeft) < 1)) {
    throw new SeatAllocationError("لا يوجد مقعد متاح لإعادة قبول هذا الطالب. بقي الطلب مرفوضاً دون تغيير.");
  }
  const delta = needed ? -1 : 1;
  const firstAuthorSeatsLeft = Math.min(program.firstAuthorSeats, program.firstAuthorSeatsLeft + (first ? delta : 0));
  const coAuthorSeatsLeft = Math.min(program.coAuthorSeats, program.coAuthorSeatsLeft + (first ? 0 : delta));
  const seatsLeft = firstAuthorSeatsLeft + coAuthorSeatsLeft;
  return {
    firstAuthorSeatsLeft, coAuthorSeatsLeft, seatsLeft,
    status: seatsLeft === 0 && program.status === "open" ? "seats_full"
      : seatsLeft > 0 && program.status === "seats_full" && program.category === "active" ? "open" : program.status,
    updatedAt: new Date(),
  };
}

export function cleanRegistrationFields(value: Record<string, string> = {}) {
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== SEAT_MARKER));
}