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
import { useListSARs, useCreateSAR, useSubmitSAR, getListSARsQueryKey } from "@workspace/api-client-react";
import { FileText, Plus, Send } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type SARForm = {
  caseId: string;
  subjectName: string;
  subjectType: string;
  reportingOfficer: string;
  filingInstitution: string;
  suspiciousActivityType: string;
  description: string;
  amountInvolved: string;
  startDate: string;
  endDate: string;
};

const ACTIVITY_TYPES = [
  "Account Takeover / Wire Fraud",
  "Card Not Present Fraud",
  "Money Laundering",
  "Structuring / Smurfing",
  "Identity Theft",
  "Ponzi / Investment Fraud",
  "Cyber Fraud",
  "Mortgage Fraud",
  "Trade-Based Money Laundering",
  "Other Suspicious Activity",
];

export default function SARPortal() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [subjectType, setSubjectType] = useState("");
  const [activityType, setActivityType] = useState("");

  const { data: sars, isLoading } = useListSARs({ page, limit: 20 });
  const queryClient = useQueryClient();
  const createSAR = useCreateSAR();
  const submitSAR = useSubmitSAR();

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<SARForm>({
    defaultValues: { filingInstitution: "First National Security Bank" },
  });

  const handleOpen = () => {
    reset({ filingInstitution: "First National Security Bank" });
    setSubjectType("");
    setActivityType("");
    setCreateOpen(true);
  };

  const onSubmit = (values: SARForm) => {
    createSAR.mutate(
      {
        data: {
          caseId: values.caseId,
          subjectName: values.subjectName,
          subjectType: values.subjectType as "individual" | "business",
          reportingOfficer: values.reportingOfficer,
          filingInstitution: values.filingInstitution,
          suspiciousActivityType: values.suspiciousActivityType,
          description: values.description,
          amountInvolved: parseFloat(values.amountInvolved),
          startDate: new Date(values.startDate).toISOString(),
          endDate: new Date(values.endDate).toISOString(),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSARsQueryKey() });
          setCreateOpen(false);
          reset();
        },
      }
    );
  };

  const handleSubmitSAR = (id: string) => {
    submitSAR.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListSARsQueryKey() }),
    });
  };

  const statusVariant = (status: string) => {
    if (status === "draft") return "outline";
    if (status === "submitted") return "secondary";
    if (status === "accepted") return "default";
    return "destructive";
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SAR Filing Portal</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">SUSPICIOUS ACTIVITY REPORTS</p>
        </div>
        <Button onClick={handleOpen}>
          <Plus className="mr-2 h-4 w-4" /> New SAR Draft
        </Button>
      </div>

      <Card className="border-border/40 bg-card/50 backdrop-blur flex-1">
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            SAR Filings ({sars?.total ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="font-mono text-xs w-[140px]">SAR NUMBER</TableHead>
                  <TableHead className="font-mono text-xs">SUBJECT</TableHead>
                  <TableHead className="font-mono text-xs">ACTIVITY TYPE</TableHead>
                  <TableHead className="font-mono text-xs">REPORTING OFFICER</TableHead>
                  <TableHead className="font-mono text-xs">STATUS</TableHead>
                  <TableHead className="font-mono text-xs text-right">AMOUNT</TableHead>
                  <TableHead className="font-mono text-xs text-right w-[120px]">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array(5).fill(0).map((_, i) => (
                      <TableRow key={i} className="border-border/40">
                        {Array(7).fill(0).map((__, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
                      </TableRow>
                    ))
                  : sars?.data.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        No SAR filings — click <strong>New SAR Draft</strong> to create one.
                      </TableCell>
                    </TableRow>
                  )
                  : sars?.data.map((sar) => (
                      <TableRow key={sar.id} className="border-border/40 hover:bg-accent/10 transition-colors">
                        <TableCell className="font-mono text-xs text-primary">{sar.sarNumber}</TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{sar.subjectName}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-mono">{sar.subjectType}</div>
                        </TableCell>
                        <TableCell className="text-sm max-w-[180px] truncate">{sar.suspiciousActivityType}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{sar.reportingOfficer}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(sar.status)} className={`uppercase text-[10px] ${sar.status === "accepted" ? "bg-emerald-500 text-white" : ""}`}>
                            {sar.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">${sar.amountInvolved.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          {sar.status === "draft" && (
                            <Button size="sm" variant="outline" className="h-8 w-full" onClick={() => handleSubmitSAR(sar.id)} disabled={submitSAR.isPending}>
                              <Send className="w-3 h-3 mr-1.5" />Submit
                            </Button>
                          )}
                          {sar.status !== "draft" && (
                            <span className="text-[10px] text-muted-foreground font-mono uppercase">{sar.status}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                }
              </TableBody>
            </Table>
          </div>
          {sars && sars.totalPages > 1 && (
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page === sars.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Create SAR Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[640px] bg-card border-border/60 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> New SAR Draft</DialogTitle>
            <DialogDescription>File a Suspicious Activity Report. All fields marked * are required by FinCEN regulations.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-muted-foreground">Subject Name *</Label>
                <Input {...register("subjectName", { required: true })} placeholder="Full legal name" className="bg-background border-border/60" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-muted-foreground">Subject Type *</Label>
                <Select value={subjectType} onValueChange={(v) => { setSubjectType(v); setValue("subjectType", v); }}>
                  <SelectTrigger className="bg-background border-border/60">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-muted-foreground">Suspicious Activity Type *</Label>
              <Select value={activityType} onValueChange={(v) => { setActivityType(v); setValue("suspiciousActivityType", v); }}>
                <SelectTrigger className="bg-background border-border/60">
                  <SelectValue placeholder="Select activity type…" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-muted-foreground">Description of Suspicious Activity *</Label>
              <Textarea {...register("description", { required: true })} placeholder="Describe the nature of the suspicious activity, patterns observed, and supporting evidence…" className="bg-background border-border/60 resize-none" rows={4} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-muted-foreground">Reporting Officer *</Label>
                <Input {...register("reportingOfficer", { required: true })} placeholder="Investigator name" className="bg-background border-border/60" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-muted-foreground">Filing Institution *</Label>
                <Input {...register("filingInstitution", { required: true })} className="bg-background border-border/60" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-muted-foreground">Amount Involved ($) *</Label>
                <Input {...register("amountInvolved", { required: true, min: 0 })} type="number" min={0} step="0.01" placeholder="0.00" className="bg-background border-border/60 font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-muted-foreground">Activity Start *</Label>
                <Input {...register("startDate", { required: true })} type="date" className="bg-background border-border/60 font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-muted-foreground">Activity End *</Label>
                <Input {...register("endDate", { required: true })} type="date" className="bg-background border-border/60 font-mono" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-muted-foreground">Related Case ID (optional)</Label>
              <Input {...register("caseId")} placeholder="Case UUID or number" className="bg-background border-border/60 font-mono text-xs" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createSAR.isPending || !subjectType || !activityType}>
                {createSAR.isPending ? (
                  <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />Saving…</span>
                ) : "Save Draft"}
              </Button>
            </DialogFooter>
            {createSAR.isError && (
              <p className="text-xs text-destructive font-mono bg-destructive/10 p-2 rounded">{(createSAR.error as Error)?.message}</p>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
