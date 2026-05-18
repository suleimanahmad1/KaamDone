/** Build GET /tasks query params from dashboard filters. */
export function buildTaskQueryParams({ search, statusFilter, priorityFilter, sortBy }) {
  const params = {};
  if (search?.trim()) params.search = search.trim();
  if (statusFilter) params.status = statusFilter;
  if (priorityFilter) params.priority = priorityFilter;
  if (sortBy) params.sortBy = sortBy;
  return params;
}
