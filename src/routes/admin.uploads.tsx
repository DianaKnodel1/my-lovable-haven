import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/uploads")({
  component: AdminUploadsPage,
});

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminData } from "@/contexts/AdminDataContext";
import { useNavigate } from "@/lib/router-compat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TASK_STATUS_CONFIG, statusBadgeClass, type TaskAssignmentStatus } from "@/lib/status";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton, PageHeaderSkeleton } from "@/components/SkeletonLoaders";
import { FileText, Image as ImageIcon, Download, Search, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubmissionWithFiles {
  id: string;
  assignment_id: string;
  notes: string | null;
  file_urls: string[];
  submitted_at: string;
}

function AdminUploadsPage() {
  const { assignments, templates, getProfileForUser, loading: adminLoading } = useAdminData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<SubmissionWithFiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data, error } = await supabase
        .from("task_submissions")
        .select("id, assignment_id, notes, file_urls, submitted_at")
        .order("submitted_at", { ascending: false })
        .range(0, 4999);
      if (cancel) return;
      if (error) {
        toast({ title: "Fehler", description: error.message, variant: "destructive" });
      }
      setSubmissions(((data ?? []) as SubmissionWithFiles[]).filter((s) => (s.file_urls ?? []).length > 0));
      setLoading(false);
    })();
    return () => { cancel = true; };
  }, [toast]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return submissions
      .map((sub) => {
        const asg = assignments.find((a) => a.id === sub.assignment_id);
        const tpl = asg ? templates.find((t) => t.id === asg.task_template_id) : undefined;
        const profile = asg ? getProfileForUser(asg.user_id) : undefined;
        return { sub, asg, tpl, profile };
      })
      .filter((r) => !!r.asg)
      .filter((r) => statusFilter === "all" ? true : r.asg!.status === statusFilter)
      .filter((r) => {
        if (!term) return true;
        return (
          r.profile?.full_name?.toLowerCase().includes(term) ||
          r.tpl?.title?.toLowerCase().includes(term) ||
          r.asg?.id?.toLowerCase().includes(term)
        );
      });
  }, [submissions, assignments, templates, getProfileForUser, search, statusFilter]);

  const totalFiles = rows.reduce((acc, r) => acc + (r.sub.file_urls?.length ?? 0), 0);

  const openFile = async (path: string) => {
    const { data, error } = await supabase.storage.from("task-submissions").createSignedUrl(path, 600);
    if (error || !data?.signedUrl) {
      toast({ title: "Datei nicht verfügbar", description: error?.message, variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  if (loading || adminLoading) {
    return <div className="p-5 space-y-4"><PageHeaderSkeleton /><TableSkeleton rows={4} cols={5} /></div>;
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-heading font-bold text-foreground">Upload-Übersicht</h1>
          <p className="text-xs text-muted-foreground">{rows.length} Einreichungen · {totalFiles} Dateien</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Mitarbeiter, Aufgabe…" className="h-8 pl-7 text-xs w-56" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="eingereicht">Eingereicht</SelectItem>
              <SelectItem value="in_pruefung">In Prüfung</SelectItem>
              <SelectItem value="genehmigt">Genehmigt</SelectItem>
              <SelectItem value="abgelehnt">Abgelehnt</SelectItem>
              <SelectItem value="nachbesserung">Nachbesserung</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Upload} title="Noch keine Uploads" description="Sobald Mitarbeiter Dateien einreichen, erscheinen sie hier." />
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Mitarbeiter</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Aufgabe</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Eingereicht</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Dateien</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(({ sub, asg, tpl, profile }) => {
                const cfg = TASK_STATUS_CONFIG[asg!.status as TaskAssignmentStatus];
                return (
                  <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{profile?.full_name ?? "Unbekannt"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{tpl?.title ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={statusBadgeClass(cfg?.color ?? "bg-muted text-muted-foreground")}>
                        {cfg?.label ?? asg!.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                      {new Date(sub.submitted_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(sub.file_urls ?? []).map((path, i) => {
                          const name = path.split("/").pop() ?? `Datei ${i + 1}`;
                          const isImg = /\.(png|jpe?g|gif|webp)$/i.test(name);
                          return (
                            <button
                              key={i}
                              onClick={() => openFile(path)}
                              title={name}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/40 hover:bg-muted text-xs border border-border max-w-[200px]"
                            >
                              {isImg ? <ImageIcon className="h-3 w-3 shrink-0 text-primary" /> : <FileText className="h-3 w-3 shrink-0 text-primary" />}
                              <span className="truncate">{name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => navigate(`/admin/assignments/${asg!.id}`)}
                      >
                        Öffnen
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
