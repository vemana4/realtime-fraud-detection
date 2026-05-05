import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useListRules, useCreateRule, useToggleRule, useDeleteRule, getListRulesQueryKey } from "@workspace/api-client-react";
import { ShieldCheck, Plus, Settings2, Trash2, Edit } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type RuleForm = {
  name: string;
  description: string;
  type: string;
  priority: string;
  action: string;
  conditionsRaw: string;
};

export default function RulesBuilder() {
  const [open, setOpen] = useState(false);
  const [ruleType, setRuleType] = useState("");
  const [ruleAction, setRuleAction] = useState("");

  const { data: rules, isLoading } = useListRules();
  const queryClient = useQueryClient();
  const createRule = useCreateRule();
  const toggleRule = useToggleRule();
  const deleteRule = useDeleteRule();

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<RuleForm>({
    defaultValues: { conditionsRaw: "{}" },
  });

  const handleOpen = () => {
    reset({ conditionsRaw: "{}" });
    setRuleType("");
    setRuleAction("");
    setOpen(true);
  };

  const onSubmit = (values: RuleForm) => {
    let conditions: object = {};
    try { conditions = JSON.parse(values.conditionsRaw); } catch { conditions = {}; }
    createRule.mutate(
      { data: { name: values.name, description: values.description, type: values.type, priority: parseInt(values.priority), action: values.action, conditions } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRulesQueryKey() });
          setOpen(false);
          reset();
        },
      }
    );
  };

  const handleToggle = (id: string, currentEnabled: boolean) => {
    toggleRule.mutate({ id, data: { enabled: !currentEnabled } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListRulesQueryKey() }),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this rule permanently?")) {
      deleteRule.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListRulesQueryKey() }),
      });
    }
  };

  const conditionPlaceholders: Record<string, string> = {
    amount_threshold: '{"threshold": 5000, "currency": "USD"}',
    velocity: '{"maxCount": 10, "windowMinutes": 60}',
    geolocation: '{"countries": ["NG", "RO", "UA"]}',
    device: '{"newDeviceOnly": true}',
    pattern: '{"hours": [1,2,3,4,5], "days": [0,6]}',
    blacklist: '{"listType": "merchants"}',
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rule Engine</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">FRAUD DETECTION POLICIES</p>
        </div>
        <Button onClick={handleOpen}>
          <Plus className="mr-2 h-4 w-4" /> Create Rule
        </Button>
      </div>

      <Card className="border-border/40 bg-card/50 backdrop-blur flex-1">
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            Configured Rules ({rules?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="font-mono text-xs w-[60px]">STATUS</TableHead>
                  <TableHead className="font-mono text-xs w-[130px]">TYPE</TableHead>
                  <TableHead className="font-mono text-xs">NAME & DESCRIPTION</TableHead>
                  <TableHead className="font-mono text-xs">ACTION</TableHead>
                  <TableHead className="font-mono text-xs text-right">TRIGGERS</TableHead>
                  <TableHead className="font-mono text-xs text-right w-[100px]">MANAGE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array(5).fill(0).map((_, i) => (
                      <TableRow key={i} className="border-border/40">
                        <TableCell><Skeleton className="h-6 w-10" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                        <TableCell><div className="space-y-2"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-64" /></div></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  : rules?.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        <ShieldCheck className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        No rules configured — click <strong>Create Rule</strong> to add one.
                      </TableCell>
                    </TableRow>
                  )
                  : rules?.map((rule) => (
                      <TableRow key={rule.id} className={`border-border/40 ${!rule.enabled ? "opacity-50" : ""}`}>
                        <TableCell>
                          <Switch checked={rule.enabled} onCheckedChange={() => handleToggle(rule.id, rule.enabled)} disabled={toggleRule.isPending} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="uppercase text-[10px] font-mono bg-background">{rule.type.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{rule.name}</div>
                          <div className="text-xs text-muted-foreground">{rule.description}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.action === "block" ? "destructive" : rule.action === "flag" ? "secondary" : "default"} className="uppercase text-[10px]">
                            {rule.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{rule.triggeredCount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(rule.id)} disabled={deleteRule.isPending}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                }
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Create Rule Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px] bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Settings2 className="w-5 h-5 text-primary" /> Create Fraud Detection Rule</DialogTitle>
            <DialogDescription>Define a new rule that will be evaluated against every incoming transaction.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-muted-foreground">Rule Name *</Label>
              <Input {...register("name", { required: true })} placeholder="e.g. High Amount Threshold" className="bg-background border-border/60" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-muted-foreground">Description *</Label>
              <Textarea {...register("description", { required: true })} placeholder="What does this rule detect?" className="bg-background border-border/60 resize-none" rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-muted-foreground">Rule Type *</Label>
                <Select value={ruleType} onValueChange={(v) => { setRuleType(v); setValue("type", v); setValue("conditionsRaw", conditionPlaceholders[v] ?? "{}"); }}>
                  <SelectTrigger className="bg-background border-border/60">
                    <SelectValue placeholder="Select type…" />
                  </SelectTrigger>
                  <SelectContent>
                    {["amount_threshold", "velocity", "geolocation", "device", "pattern", "blacklist"].map((t) => (
                      <SelectItem key={t} value={t} className="font-mono text-sm">{t.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-muted-foreground">Action *</Label>
                <Select value={ruleAction} onValueChange={(v) => { setRuleAction(v); setValue("action", v); }}>
                  <SelectTrigger className="bg-background border-border/60">
                    <SelectValue placeholder="Select action…" />
                  </SelectTrigger>
                  <SelectContent>
                    {["block", "flag", "challenge_2fa", "notify"].map((a) => (
                      <SelectItem key={a} value={a} className="font-mono text-sm">{a.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-muted-foreground">Priority (1 = highest) *</Label>
              <Input {...register("priority", { required: true, min: 1 })} type="number" min={1} placeholder="1" className="bg-background border-border/60 font-mono" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-muted-foreground">Conditions (JSON) *</Label>
              <Textarea {...register("conditionsRaw", { required: true })} placeholder='{"threshold": 5000}' className="bg-background border-border/60 font-mono text-xs resize-none" rows={3} />
              <p className="text-[10px] text-muted-foreground font-mono">Auto-filled based on type. Edit as needed.</p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createRule.isPending || !ruleType || !ruleAction}>
                {createRule.isPending ? (
                  <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />Creating…</span>
                ) : "Create Rule"}
              </Button>
            </DialogFooter>
            {createRule.isError && (
              <p className="text-xs text-destructive font-mono bg-destructive/10 p-2 rounded">
                {(createRule.error as Error)?.message ?? "Failed to create rule"}
              </p>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
