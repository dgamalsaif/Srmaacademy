import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanRegistrationFields, holdsSeat, SEAT_MARKER, seatChange, SeatAllocationError } from "./registrationSeats";

const program = { firstAuthorSeats: 1, firstAuthorSeatsLeft: 0, coAuthorSeats: 14, coAuthorSeatsLeft: 3, seatsLeft: 3, status: "open", category: "active" };
for (const authorRole of ["first_author", "co_author"]) {
  test(`${authorRole}: reject returns one seat; reject twice and then delete do not return extra seats`, () => {
    const current = { authorRole, customFields: {} };
    const released = seatChange(program, current, "rejected")!;
    assert.equal(released.seatsLeft, 4);
    assert.equal(released.firstAuthorSeatsLeft, authorRole === "first_author" ? 1 : 0);
    const rejected = { ...current, customFields: { [SEAT_MARKER]: "released" } };
    assert.equal(seatChange({ ...program, ...released }, rejected, "rejected"), null);
    assert.equal(seatChange({ ...program, ...released }, rejected, "deleted"), null);
    const reserved = seatChange({ ...program, ...released }, rejected, "approved")!;
    assert.equal(reserved.seatsLeft, 3);
    assert.equal(seatChange({ ...program, ...reserved }, { ...current, customFields: { [SEAT_MARKER]: "held" } }, "approved"), null);
  });
  test(`${authorRole}: deletion returns a held seat, not an already released seat`, () => {
    assert.equal(seatChange(program, { authorRole }, "deleted")?.seatsLeft, 4);
    assert.equal(seatChange(program, { authorRole, customFields: { [SEAT_MARKER]: "released" } }, "deleted"), null);
  });
}
test("released requests cannot re-enter full/closed/inactive opportunities or take a different author seat", () => {
  const rejected = { authorRole: "first_author", customFields: { [SEAT_MARKER]: "released" } };
  assert.throws(() => seatChange(program, rejected, "approved"), SeatAllocationError);
  for (const patch of [{ status: "seats_full", seatsLeft: 0 }, { status: "closed" }, { category: "completed" }]) {
    assert.throws(() => seatChange({ ...program, firstAuthorSeatsLeft: 1, ...patch }, rejected, "pending"), SeatAllocationError);
  }
});
test("release reopens full active opportunities only; does not reopen closed/inactive ones", () => {
  assert.equal(seatChange({ ...program, seatsLeft: 0, coAuthorSeatsLeft: 0, status: "seats_full" }, { authorRole: "co_author" }, "rejected")?.status, "open");
  assert.equal(seatChange({ ...program, status: "closed" }, { authorRole: "co_author" }, "rejected")?.status, "closed");
  assert.equal(seatChange({ ...program, status: "seats_full", category: "completed" }, { authorRole: "co_author" }, "rejected")?.status, "seats_full");
});
test("legacy rejected holds are reconciled once; caller cannot set reservation metadata", () => {
  assert.equal(holdsSeat({ authorRole: "co_author" }), true);
  assert.equal(holdsSeat({ authorRole: "co_author", customFields: { [SEAT_MARKER]: "released" } }), false);
  assert.deepEqual(cleanRegistrationFields({ [SEAT_MARKER]: "released", academicDegree: "MD" }), { academicDegree: "MD" });
});