import { useMemo, useState } from "react";
import { useLocalApi } from "../hooks/useLocalApi";
import type { Domain } from "../interfaces/domain";
import type { Client } from "../interfaces/client";
import { SidebarLayout } from "../components/layout/SidebarLayout";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../components/ui/dialog";
import { AsyncState } from "../components/ui/AsyncState";
import { BarChart } from "../components/charts/BarChart";
import { DonutChart } from "../components/charts/DonutChart";
import { daysUntil, parseDateMaybe } from "../utils/date.ts";
import { exportToCsv } from "../utils/csv.ts";

export default function Dashboard() {
  const {
    data: domainsData,
    isLoading,
    error,
    isFetching,
  } = useLocalApi<Domain[]>("/api/domain.json");
  const { data: clientsData } = useLocalApi<Client[]>("/api/client.json");

  const domains: Domain[] = useMemo(
    () => (Array.isArray(domainsData) ? domainsData : []),
    [domainsData]
  );
  const clients: Client[] = useMemo(
    () => (Array.isArray(clientsData) ? clientsData : []),
    [clientsData]
  );

  // Filters
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "">("");

  // Pagination + selection (domains)
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Pagination + selection (clients)
  const [clientPage, setClientPage] = useState(1);
  const clientPageSize = 20;
  const [selectedClients, setSelectedClients] = useState<Set<string>>(
    new Set()
  );

  // Row dialog (generic for domain/client)
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<Record<string, unknown> | null>(
    null
  );

  // Map by id can be introduced if cross-linking is needed

  // Domain filtering
  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return domains.filter((d) => {
      const str = JSON.stringify(d).toLowerCase();
      const matchesQ = !q || str.includes(ql);
      const matchesStatus =
        !statusFilter ||
        String(d.status || "").toLowerCase() === statusFilter.toLowerCase();
      return matchesQ && matchesStatus;
    });
  }, [domains, q, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // Client filtering
  const clientFiltered = useMemo(() => {
    if (!q) return clients;
    const ql = q.toLowerCase();
    return clients.filter((c) => JSON.stringify(c).toLowerCase().includes(ql));
  }, [clients, q]);

  const clientTotalPages = Math.max(
    1,
    Math.ceil(clientFiltered.length / clientPageSize)
  );
  const clientPaged = useMemo(() => {
    const start = (clientPage - 1) * clientPageSize;
    return clientFiltered.slice(start, start + clientPageSize);
  }, [clientFiltered, clientPage]);

  const metrics = useMemo(() => {
    const total = filtered.length;
    const hostingYes = filtered.filter(
      (d) => String(d.hosting_type).toLowerCase() === "yes"
    ).length;
    const domainYes = filtered.filter(
      (d) => String(d.domain_type).toLowerCase() === "yes"
    ).length;
    const sslValid = filtered.filter(
      (d) => d.ssldate === true || typeof d.ssldate === "string"
    ).length;
    const soonExpiring = filtered.filter((d) => {
      const days = daysUntil(String(d.domain_expiry || ""));
      return days !== null && days <= 60;
    }).length;

    // 12-month aggregation (Jan..Dec) across years
    const monthCounts = new Array(12).fill(0) as number[];
    filtered.forEach((d) => {
      const dt = parseDateMaybe(String(d.domain_expiry || ""));
      if (!dt) return;
      const m = dt.getMonth(); // 0..11
      monthCounts[m] += 1;
    });
    const monthLabels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthData = monthLabels.map((lbl, idx) => ({
      label: lbl,
      value: monthCounts[idx],
    }));

    const statusMap = new Map<string, number>();
    filtered.forEach((d) => {
      const s = String(d.status || "-");
      statusMap.set(s, (statusMap.get(s) ?? 0) + 1);
    });
    const topStatus = Array.from(statusMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }));

    return {
      total,
      hostingYes,
      domainYes,
      sslValid,
      soonExpiring,
      monthData,
      topStatus,
    };
  }, [filtered]);

  // Selection helpers (domains)
  const toggleSelectAllDomains = (checked: boolean) => {
    if (checked) {
      const next = new Set(selected);
      paged.forEach((d, i) => next.add(String(d.id ?? d.domain ?? i)));
      setSelected(next);
    } else {
      const next = new Set(selected);
      paged.forEach((d, i) => next.delete(String(d.id ?? d.domain ?? i)));
      setSelected(next);
    }
  };
  const toggleRowDomain = (id: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    setSelected(next);
  };

  // Selection helpers (clients)
  const toggleSelectAllClients = (checked: boolean) => {
    if (checked) {
      const next = new Set(selectedClients);
      clientPaged.forEach((c, i) => next.add(String(c.id ?? i)));
      setSelectedClients(next);
    } else {
      const next = new Set(selectedClients);
      clientPaged.forEach((c, i) => next.delete(String(c.id ?? i)));
      setSelectedClients(next);
    }
  };
  const toggleRowClient = (id: string, checked: boolean) => {
    const next = new Set(selectedClients);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedClients(next);
  };

  const sidebar = (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-gray-500 mb-2">Search</div>
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
            setClientPage(1);
          }}
          placeholder="Search domain, org, registrar..."
        />
      </div>
      <div>
        <div className="text-xs text-gray-500 mb-2">Status</div>
        <div className="flex flex-wrap gap-2">
          {[
            "",
            "No issue",
            "Coming Soon",
            "Payment Gateway",
            "Not Working",
            "Domain Registered",
            "Redirection",
          ].map((s) => (
            <button
              key={s || "all"}
              className={`text-xs rounded-full px-3 py-1 border ${
                statusFilter === s
                  ? "bg-gray-900 text-white border-gray-900"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>
      <div className="text-xs text-gray-400">{filtered.length} results</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded border bg-white">
          <div className="text-gray-500">Hosting Yes</div>
          <div className="font-semibold">{metrics.hostingYes}</div>
        </div>
        <div className="p-2 rounded border bg-white">
          <div className="text-gray-500">Domain Yes</div>
          <div className="font-semibold">{metrics.domainYes}</div>
        </div>
        <div className="p-2 rounded border bg-white">
          <div className="text-gray-500">SSL Info</div>
          <div className="font-semibold">{metrics.sslValid}</div>
        </div>
        <div className="p-2 rounded border bg-white">
          <div className="text-gray-500">Expiring ≤60d</div>
          <div className="font-semibold">{metrics.soonExpiring}</div>
        </div>
      </div>
    </div>
  );

  return (
    <SidebarLayout sidebar={sidebar}>
      <AsyncState
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        empty={!domains.length}
        loadingText="Loading dashboard..."
        errorText="Failed to load:"
        emptyText="No data."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="text-sm text-gray-500">Total Records</div>
              <Badge>{metrics.total}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{metrics.total}</div>
              <div className="text-xs text-gray-500 mt-1">Domains in view</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="text-sm text-gray-500">Hosting Enabled</div>
              <Badge variant="success">{metrics.hostingYes}</Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <DonutChart
                value={metrics.hostingYes}
                total={Math.max(1, metrics.total)}
                label="Hosting"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="text-sm text-gray-500">Domain Only</div>
              <Badge variant="outline">{metrics.domainYes}</Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <DonutChart
                value={metrics.domainYes}
                total={Math.max(1, metrics.total)}
                label="Domains"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="text-sm text-gray-500">Expiring Soon</div>
              <Badge variant="warning">{metrics.soonExpiring}</Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <DonutChart
                value={metrics.soonExpiring}
                total={Math.max(1, metrics.total)}
                label="<= 60 days"
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2">
            <CardHeader>
              <div className="font-medium">Expiries by Month</div>
            </CardHeader>
            <CardContent>
              {metrics.monthData.length ? (
                <div className="overflow-x-auto">
                  <BarChart
                    data={metrics.monthData}
                    tooltipLabel="Expiries in"
                  />
                </div>
              ) : (
                <div className="text-sm text-gray-500">No expiry data.</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="font-medium">Top Status</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {metrics.topStatus.map((s) => (
                  <li
                    key={s.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{s.label}</span>
                    <Badge>{s.value}</Badge>
                  </li>
                ))}
                {!metrics.topStatus.length && (
                  <div className="text-sm text-gray-500">No status data.</div>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Domains */}
        <div className="mt-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="font-medium">Domains</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const rows = paged.map((d, i) => ({
                      id: d.id ?? i,
                      domain: d.domain,
                      type: d.type,
                      server: d.server,
                      status: d.status,
                      domain_expiry: d.domain_expiry,
                    }));
                    exportToCsv(
                      "domains.csv",
                      rows as Array<Record<string, unknown>>
                    );
                  }}
                >
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-4 w-8">
                      <Checkbox
                        onChange={(e) =>
                          toggleSelectAllDomains(e.currentTarget.checked)
                        }
                        checked={
                          paged.length > 0 &&
                          paged.every((d, i) =>
                            selected.has(String(d.id ?? d.domain ?? i))
                          )
                        }
                      />
                    </th>
                    <th className="py-2 pr-4">Domain</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Server</th>
                    <th className="py-2 pr-4">Expiry Date</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((d, i) => {
                    const du = daysUntil(String(d.domain_expiry || ""));
                    const badgeVariant =
                      du !== null && du <= 30 ? "warning" : "outline";
                    const id = String(d.id ?? d.domain ?? i);
                    return (
                      <tr
                        key={id}
                        className="border-t hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setDetailData(
                            d as unknown as Record<string, unknown>
                          );
                          setDetailOpen(true);
                        }}
                      >
                        <td
                          className="py-2 pr-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selected.has(id)}
                            onChange={(e) =>
                              toggleRowDomain(id, e.currentTarget.checked)
                            }
                          />
                        </td>
                        <td className="py-2 pr-4 font-medium">
                          {String(d.domain || "-")}
                        </td>
                        <td className="py-2 pr-4">{String(d.type || "-")}</td>
                        <td className="py-2 pr-4">{String(d.server || "-")}</td>
                        <td className="py-2 pr-4">
                          <Badge
                            variant={
                              badgeVariant === "warning" ? "warning" : "outline"
                            }
                          >
                            {String(d.domain_expiry || "-")}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant="outline">
                            {String(d.status || "-")}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailData(
                                d as unknown as Record<string, unknown>
                              );
                              setDetailOpen(true);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-500">
                  Page {page} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row Details Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogHeader
            title={
              typeof detailData?.domain === "string"
                ? `Details: ${String(detailData.domain)}`
                : "Details"
            }
          />
          <DialogContent>
            {detailData && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <tbody>
                    {Object.entries(detailData).map(([k, v]) => (
                      <tr key={k} className="border-t">
                        <td className="py-2 pr-4 font-medium whitespace-nowrap">
                          {k}
                        </td>
                        <td className="py-2 pr-4">{String(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Clients */}
        <div className="mt-8">
          {/* Clients Chart */}
          <Card className="mb-4">
            <CardHeader>
              <div className="font-medium">Clients by Designation</div>
            </CardHeader>
            <CardContent>
              <ClientsChart data={clientFiltered} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="font-medium">Clients</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const rows = clientPaged.map((c, i) => ({
                    id: c.id ?? i,
                    organization: c.organization,
                    name: `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim(),
                    email: c.email,
                    contact: c.contact,
                  }));
                  exportToCsv(
                    "clients.csv",
                    rows as Array<Record<string, unknown>>
                  );
                }}
              >
                Export CSV
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-4 w-8">
                      <Checkbox
                        onChange={(e) =>
                          toggleSelectAllClients(e.currentTarget.checked)
                        }
                        checked={
                          clientPaged.length > 0 &&
                          clientPaged.every((c, i) =>
                            selectedClients.has(String(c.id ?? i))
                          )
                        }
                      />
                    </th>
                    <th className="py-2 pr-4">Organization</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Contact</th>
                    <th className="py-2 pr-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {clientPaged.map((c, i) => {
                    const id = String(c.id ?? i);
                    return (
                      <tr
                        key={id}
                        className="border-t hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setDetailData(
                            c as unknown as Record<string, unknown>
                          );
                          setDetailOpen(true);
                        }}
                      >
                        <td
                          className="py-2 pr-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedClients.has(id)}
                            onChange={(e) =>
                              toggleRowClient(id, e.currentTarget.checked)
                            }
                          />
                        </td>
                        <td className="py-2 pr-4 font-medium">
                          {String(c.organization || "-")}
                        </td>
                        <td className="py-2 pr-4">
                          {`${c.first_name ?? ""} ${
                            c.last_name ?? ""
                          }`.trim() || "-"}
                        </td>
                        <td className="py-2 pr-4">{String(c.email || "-")}</td>
                        <td className="py-2 pr-4">
                          {String(c.contact || "-")}
                        </td>
                        <td className="py-2 pr-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailData(
                                c as unknown as Record<string, unknown>
                              );
                              setDetailOpen(true);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-500">
                  Page {clientPage} of {clientTotalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={clientPage <= 1}
                    onClick={() => setClientPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={clientPage >= clientTotalPages}
                    onClick={() =>
                      setClientPage((p) => Math.min(clientTotalPages, p + 1))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AsyncState>
    </SidebarLayout>
  );
}

// --- Lightweight Clients chart ---
function ClientsChart({ data }: { data: Client[] }) {
  // Group by designation (top 8)
  const buckets = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((c) => {
      const key = (c.designation || "Unknown").toString();
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, value]) => ({ label, value }));
  }, [data]);

  if (!buckets.length)
    return <div className="text-sm text-gray-500">No client data.</div>;
  return <BarChart data={buckets} tooltipLabel="Clients" />;
}
