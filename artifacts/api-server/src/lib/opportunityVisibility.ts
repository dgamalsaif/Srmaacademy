import { coordinatorPortalSettingsTable, db } from "@workspace/db";
import { inArray } from "drizzle-orm";
import { validateHiddenFields } from "./opportunityVisibilityFields";
export { validateHiddenFields } from "./opportunityVisibilityFields";

const keyFor = (id: number) => `opportunity_display:${id}`;

export async function getOpportunityVisibility(ids: number[], reader: Pick<typeof db, "select"> = db): Promise<Map<number, string[]>> {
  if (!ids.length) return new Map<number, string[]>();
  const records: Array<{ key: string; value: Record<string, unknown> }> = await reader.select().from(coordinatorPortalSettingsTable)
    .where(inArray(coordinatorPortalSettingsTable.key, ids.map(keyFor)));
  return new Map(records.map(record => [
    Number(record.key.slice("opportunity_display:".length)),
    validateHiddenFields(record.value.hiddenFields ?? []),
  ]));
}

export async function saveOpportunityVisibility(tx: Pick<typeof db, "insert">, id: number, hiddenFields: string[]) {
  await tx.insert(coordinatorPortalSettingsTable).values({ key: keyFor(id), value: { hiddenFields } })
    .onConflictDoUpdate({
      target: coordinatorPortalSettingsTable.key,
      set: { value: { hiddenFields }, updatedAt: new Date() },
    });
}