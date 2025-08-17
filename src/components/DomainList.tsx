import { useLocalApi } from "../hooks/useLocalApi";
import type { Domain } from "../interfaces/domain";
import { AsyncState } from "./ui/AsyncState";

export const DomainList = () => {
  const { data, isLoading, error, isFetching } =
    useLocalApi<Domain[]>("/api/domain.json");

  const domains: Domain[] = Array.isArray(data) ? data : [];

  // Get all unique keys from all domains for table headers
  const allKeys = Array.from(
    domains.reduce((set, d) => {
      Object.keys(d).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );

  return (
    <div className="p-4 overflow-x-auto">
      <AsyncState
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        empty={!domains.length}
        loadingText="Loading domains..."
        errorText="Failed to load domains:"
        emptyText="No domains found."
      >
        <table className="min-w-full border text-xs">
          <thead>
            <tr>
              {allKeys.map((key) => (
                <th
                  key={key}
                  className="border px-2 py-1 bg-gray-100 text-left whitespace-nowrap"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {domains.map((d, i) => {
              const rec = d as unknown as Record<string, unknown>;
              return (
                <tr key={d.id || i}>
                  {allKeys.map((key) => (
                    <td
                      key={key}
                      className="border px-2 py-1 whitespace-nowrap"
                    >
                      {rec[key] === undefined ||
                      rec[key] === null ||
                      rec[key] === ""
                        ? "-"
                        : String(rec[key])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </AsyncState>
    </div>
  );
};
