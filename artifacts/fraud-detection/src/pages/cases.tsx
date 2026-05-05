import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  useListCases, useCreateCase, useGetCase,
  useUpdateCase, useAddCaseNote,
  getListCasesQueryKey, getGetCaseQueryKey,
} from "@workspace/api-client-react";
import { Briefcase, Plus, Search, FileText } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type CaseForm = {
  title: string;
  description: string;
  fraudType: string;
  priority: string;
  estimatedLoss: string;
  assigneeId: string;
};

const FRAUD_TYPES = [
  "Account Takeover", "Card Not Present", "Card Present", "Identity Theft",
  "Money Laundering", "Friendly Fraud", "Phishing", "Wire Fraud", "Check Fraud",
];

export default function CasesInterface() {
  const [page, setPage] = useState(1);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [casePriority, setCasePriority] = useState("");

  const { data: cases, isLoading: loadingCases } = useListCases({ page, limit: 20 });
  const queryClient = useQueryClient();
  const createCase = useCreateCase();

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CaseForm>();

  const handleOpen = () => {
    reset();
    setCasePriority("");
    setCreateOpen(true);
  };

  const onSubmit = (values: CaseForm) => {
    createCase.mutate(
      {
        data: {
          title: values.title,
          description: values.description,
          fraudType: values.fraudType,
          priority: values.priority as "low" | "medium" | "high" | "urgent",
          estimatedLoss: parseFloat(values.estimatedLoss),
          assigneeId: values.assigneeId || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
          setCreateOpen(false);
          reset();
        },
      }
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Case Management</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">INVESTIGATION WORKSPACE</p>
        </div>
        <Button onClick={handleOpen}>
          <Plus className="mr-2 h-4 w-4" /> Create Case
        </Button>
      </div>

      <Card className="border-border/40 bg-card/50 backdrop-blur flex-1">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              Active Investigations ({cases?.total ?? 0})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search case ID..." className="pl-8 bg-background border-border/60" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="font-mono text-xs w-[130px]">CASE ID</TableHead>
                  <TableHead className="font-mono text-xs">TITLE</TableHead>
                  <TableHead className="font-mono text-xs">FRAUD TYPE</TableHead>
                  <TableHead className="font-mono text-xs">PRIORITY</TableHead>
                  <TableHead className="font-mono text-xs">STATUS</TableHead>
                  <TableHead className="font-mono text-xs text-right">EST. LOSS</TableHead>
                  <TableHead className="font-mono text-xs text-right">UPDATED</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingCases
                  ? Array(5).fill(0).map((_, i) => (
                      <TableRow key={i} className="border-border/40">
                        {Array(7).fill(0).map((__, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
                      </TableRow>
                    ))
                  : cases?.data.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        No cases — click <strong>Create Case</strong> to open one.
                      </TableCell>
                    </TableRow>
                  )
                  : cases?.data.map((c) => (
                      <TableRow key={c.id} className="border-border/40 hover:bg-accent/10 cursor-pointer" onClick={() => setSelectedCaseId(c.id)}>
                        <TableCell className="font-mono text-xs text-primary">{c.caseNumber}</TableCell>
                        <TableCell className="font-medium text-sm">{c.title}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{c.fraudType}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`uppercase text-[10px] ${
                            c.priority === "urgent" ? "border-destructive text-destructive" :
                            c.priority === "high" ? "border-amber-500 text-amber-500" : ""
                          }`}>{c.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={c.status === "open" ? "destructive" : c.status === "in_progress" ? "secondary" : "outline"} className="uppercase text-[10px]">
                            {c.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">${c.estimatedLoss.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground font-mono">
                          {new Date(c.updatedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                }
              </TableBody>
            </Table>
          </div>
          {cases && cases.totalPages > 1 && (
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page === cases.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CaseDetailSheet caseId={selectedCaseId} onClose={() => setSelectedCaseId(null)} />

      {/* ── Create Case Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[580px] bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Open New Case</DialogTitle>
            <DialogDescription>Create a fraud investigation case to track and coordinate the response.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-muted-foreground">Case Title *</Label>
              <Input {...register("title", { required: true })} placeholder="e.g. Large-Scale Card Fraud Ring" className="bg-background border-border/60" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-muted-foreground">Description *</Label>
              <Textarea {...register("description", { required: true })} placeholder="Describe the suspicious activity, scope, and initial findings…" className="bg-background border-border/60 resize-none" rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-muted-foreground">Fraud Type *</Label>
                <Select onValueChange={(v) => setValue("fraudType", v)}>
                  <SelectTrigger className="bg-background border-border/60">
                    <SelectValue placeholder="Select type…" />
                  </SelectTrigger>
                  <SelectContent>
                    {FRAUD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-muted-foreground">Priority *</Label>
                <Select value={casePriority} onValueChange={(v) => { setCasePriority(v); setValue("priority", v); }}>
                  <SelectTrigger className="bg-background border-border/60">
                    <SelectValue placeholder="Select priority…" />
                  </SelectTrigger>
                  <SelectContent>
                    {["urgent", "high", "medium", "low"].map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-muted-foreground">Estimated Loss ($) *</Label>
                <Input {...register("estimatedLoss", { required: true, min: 0 })} type="number" min={0} step="0.01" placeholder="0.00" className="bg-background border-border/60 font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-muted-foreground">Assigned Investigator</Label>
                <Input {...register("assigneeId")} placeholder="Investigator ID (optional)" className="bg-background border-border/60" />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createCase.isPending || !casePriority}>
                {createCase.isPending ? (
                  <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />Opening…</span>
                ) : "Open Case"}
              </Button>
            </DialogFooter>
            {createCase.isError && (
              <p className="text-xs text-destructive font-mono bg-destructive/10 p-2 rounded">
                {(createCase.error as Error)?.message ?? "Failed to create case"}
              </p>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CaseDetailSheet({ caseId, onClose }: { caseId: string | null; onClose: () => void }) {
  const { data: caseDetail, isLoading } = useGetCase(caseId || "", { query: { enabled: !!caseId } });
  const [noteContent, setNoteContent] = useState("");
  const queryClient = useQueryClient();
  const addNote = useAddCaseNote();
  const updateCase = useUpdateCase();

  const handleAddNote = () => {
    if (!caseId || !noteContent.trim()) return;
    addNote.mutate({ id: caseId, data: { content: noteContent, authorId: "current_user", authorName: "Current User" } }, {
      onSuccess: () => {
        setNoteContent("");
        queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
      },
    });
  };

  const handleStatusChange = (status: "in_progress" | "closed" | "escalated") => {
    if (!caseId) return;
    updateCase.mutate({ id: caseId, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
        queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
      },
    });
  };

  return (
    <Sheet open={!!caseId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[420px] sm:w-[560px] border-border/40 overflow-y-auto sm:max-w-xl">
        {isLoading ? (
          <div className="space-y-4 pt-8">
            <Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-32 w-full mt-8" />
          </div>
        ) : caseDetail ? (
          <>
            <SheetHeader className="mb-6">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-bold font-mono">{caseDetail.caseNumber}</SheetTitle>
                <Badge variant={caseDetail.status === "open" ? "destructive" : "secondary"} className="uppercase">{caseDetail.status.replace("_", " ")}</Badge>
              </div>
              <SheetDescription className="text-base text-foreground mt-2">{caseDetail.title}</SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Priority", value: caseDetail.priority },
                  { label: "Est. Loss", value: `$${caseDetail.estimatedLoss.toLocaleString()}` },
                  { label: "Fraud Type", value: caseDetail.fraudType },
                  { label: "Created", value: new Date(caseDetail.createdAt).toLocaleDateString() },
                ].map(({ label, value }) => (
                  <div key={label} className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-mono tracking-wider">{label}</p>
                    <p className="font-medium text-sm capitalize">{value}</p>
                  </div>
                ))}
              </div>

              {caseDetail.description && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Description</h3>
                  <div className="bg-muted/30 p-3 rounded-md text-sm leading-relaxed">{caseDetail.description}</div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Case Notes ({caseDetail.notes.length})</h3>
                {caseDetail.notes.map((note) => (
                  <div key={note.id} className="bg-card border border-border/40 p-3 rounded-md">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-xs">{note.authorName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{note.content}</p>
                  </div>
                ))}
                {caseDetail.notes.length === 0 && <p className="text-sm text-muted-foreground italic">No notes yet.</p>}

                <div className="space-y-2 pt-3 border-t border-border/40">
                  <Textarea placeholder="Add a case note…" value={noteContent} onChange={(e) => setNoteContent(e.target.value)} className="resize-none bg-background border-border/60" rows={3} />
                  <Button onClick={handleAddNote} disabled={!noteContent.trim() || addNote.isPending} size="sm" className="w-full">
                    {addNote.isPending ? "Adding…" : "Add Note"}
                  </Button>
                </div>
              </div>

              {caseDetail.status !== "closed" && (
                <div className="pt-4 border-t border-border/40 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => handleStatusChange("in_progress")} disabled={updateCase.isPending}>
                    Mark In Progress
                  </Button>
                  <Button variant="default" className="flex-1" onClick={() => handleStatusChange("closed")} disabled={updateCase.isPending}>
                    Close Case
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
