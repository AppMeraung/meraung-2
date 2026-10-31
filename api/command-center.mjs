import { saasProjects } from "../data/saas-projects.mjs";
import { getSession } from "./_lib/auth.mjs";
import { json, methodNotAllowed } from "./_lib/http.mjs";
import { aggregateSnapshots, fetchProjectMetrics, sampleSnapshot, validateRange } from "./_lib/metrics.mjs";
import { isDemoModeAllowed } from "./_lib/runtime.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  if (!getSession(req)) return json(res, 401, { error: "authentication_required" });
  const range = validateRange(req.query?.range);
  const demoRequested = req.query?.demo === "1";
  const demo = demoRequested && isDemoModeAllowed();
  const snapshots = demo
    ? saasProjects.map((project) => sampleSnapshot(project, range))
    : await Promise.all(saasProjects.map((project) => fetchProjectMetrics(project, range)));
  const byProject = Object.fromEntries(snapshots.map((item) => [item.projectId, item]));
  return json(res, 200, {
    mode: demo ? "sample" : "live",
    range,
    generatedAt: new Date().toISOString(),
    aggregate: aggregateSnapshots(snapshots, saasProjects.length),
    projects: saasProjects.map(({ metricsKey, ...project }) => ({ ...project, metrics: byProject[project.id] })),
  });
}
