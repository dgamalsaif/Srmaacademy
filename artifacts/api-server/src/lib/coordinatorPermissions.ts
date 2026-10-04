/** Every coordinator write is denied unless it is explicitly a student add/remove or session action. */
export function isAllowedCoordinatorMutation(method: string, path: string): boolean {
  if (["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase())) return true;
  const normalized = path.replace(/\/+$/, "") || "/";
  return (method === "POST" && [
    "/coordinator/registrations", "/coordinator/login", "/coordinator/logout",
  ].includes(normalized)) ||
    (method === "DELETE" && /^\/registrations\/[1-9]\d*$/.test(normalized));
}