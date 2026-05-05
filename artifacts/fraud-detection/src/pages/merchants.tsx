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
import { useListMerchants, useAddMerchant, useBlockMerchant, useUnblockMerchant, getListMerchantsQueryKey } from "@workspace/api-client-react";
import { Store, Ban, ShieldCheck, Search, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type MerchantForm = { name: string; category: string; country: string };
type BlockForm = { reason: string };

const CATEGORIES = ["E-Commerce", "Electronics", "Finance", "Retail", "Gambling", "ATM/Cash", "Streaming", "Travel", "Food", "Cryptocurrency", "Healthcare", "Other"];
const COUNTRIES = [
  { code: "US", name: "United States" }, { code: "GB", name: "United Kingdom" },
  { code: "NG", name: "Nigeria ⚠" }, { code: "RO", name: "Romania ⚠" },
  { code: "UA", name: "Ukraine ⚠" }, { code: "BR", name: "Brazil ⚠" },
  { code: "SG", name: "Singapore" }, { code: "DE", name: "Germany" },
  { code: "FR", name: "France" }, { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" }, { code: "JP", name: "Japan" },
];

export default function MerchantsManager() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [blockTargetId, setBlockTargetId] = useState<string | null>(null);
  const [merchantCategory, setMerchantCategory] = useState("");
  const [merchantCountry, setMerchantCountry] = useState("");

  const { data: merchants, isLoading } = useListMerchants({ page, limit: 20, search: search || undefined });
  const queryClient = useQueryClient();
  const addMerchant = useAddMerchant();
  const blockMerchant = useBlockMerchant();
  const unblockMerchant = useUnblockMerchant();

  const addForm = useForm<MerchantForm>();
  const blockForm = useForm<BlockForm>();

  const handleAddSubmit = (values: MerchantForm) => {
    addMerchant.mutate(
      { data: { name: values.name, category: values.category, country: values.country } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMerchantsQueryKey() });
          setAddOpen(false);
          addForm.reset();
          setMerchantCategory("");
          setMerchantCountry("");
        },
      }
    );
  };

  const handleBlockSubmit = (values: BlockForm) => {
    if (!blockTargetId) return;
    blockMerchant.mutate(
      { id: blockTargetId, data: { reason: values.reason } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMerchantsQueryKey() });
          setBlockTargetId(null);
          blockForm.reset();
        },
      }
    );
  };

  const handleUnblock = (id: string) => {
    unblockMerchant.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMerchantsQueryKey() }),
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Merchant Control</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">ENTITY BLACKLISTS & MONITORING</p>
        </div>
        <Button onClick={() => { addForm.reset(); setMerchantCategory(""); setMerchantCountry(""); setAddOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Merchant
        </Button>
      </div>

      <Card className="border-border/40 bg-card/50 backdrop-blur flex-1">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              Monitored Merchants ({merchants?.total ?? 0})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search merchants…" className="pl-8 bg-background border-border/60" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="font-mono text-xs">NAME</TableHead>
                  <TableHead className="font-mono text-xs">CATEGORY</TableHead>
                  <TableHead className="font-mono text-xs">COUNTRY</TableHead>
                  <TableHead className="font-mono text-xs">STATUS</TableHead>
                  <TableHead className="font-mono text-xs text-right">FRAUD RATE</TableHead>
                  <TableHead className="font-mono text-xs text-right">TOTAL TXS</TableHead>
                  <TableHead className="font-mono text-xs text-right w-[110px]">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array(8).fill(0).map((_, i) => (
                      <TableRow key={i} className="border-border/40">
                        {Array(7).fill(0).map((__, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
                      </TableRow>
                    ))
                  : merchants?.data.map((m) => (
                      <TableRow key={m.id} className={`border-border/40 ${m.status === "blocked" ? "bg-destructive/5" : ""}`}>
                        <TableCell>
                          <div className="font-medium text-sm">{m.name}</div>
                          {m.blockedReason && <div className="text-[10px] text-destructive mt-0.5 font-mono">{m.blockedReason}</div>}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{m.category}</TableCell>
                        <TableCell className="text-sm font-mono">{m.country}</TableCell>
                        <TableCell>
                          <Badge variant={m.status === "blocked" ? "destructive" : m.status === "flagged" ? "secondary" : "outline"} className="uppercase text-[10px]">
                            {m.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          <span className={m.fraudRate > 5 ? "text-destructive" : m.fraudRate > 2 ? "text-amber-500" : "text-emerald-500"}>
                            {(m.fraudRate * 100).toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{m.totalTransactions.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          {m.status !== "blocked" ? (
                            <Button size="sm" variant="destructive" className="h-8 w-full text-[11px]" onClick={() => { setBlockTargetId(m.id); blockForm.reset(); }}>
                              <Ban className="w-3 h-3 mr-1" />Block
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="h-8 w-full text-[11px]" onClick={() => handleUnblock(m.id)} disabled={unblockMerchant.isPending}>
                              <ShieldCheck className="w-3 h-3 mr-1" />Unblock
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                }
              </TableBody>
            </Table>
          </div>
          {merchants && merchants.totalPages > 1 && (
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page === merchants.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Add Merchant Dialog ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[480px] bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Store className="w-5 h-5 text-primary" /> Add Merchant</DialogTitle>
            <DialogDescription>Register a new merchant for fraud monitoring and transaction tracking.</DialogDescription>
          </DialogHeader>
          <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-muted-foreground">Merchant Name *</Label>
              <Input {...addForm.register("name", { required: true })} placeholder="e.g. GlobalShop Ltd" className="bg-background border-border/60" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-muted-foreground">Category *</Label>
                <Select value={merchantCategory} onValueChange={(v) => { setMerchantCategory(v); addForm.setValue("category", v); }}>
                  <SelectTrigger className="bg-background border-border/60">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-muted-foreground">Country *</Label>
                <Select value={merchantCountry} onValueChange={(v) => { setMerchantCountry(v); addForm.setValue("country", v); }}>
                  <SelectTrigger className="bg-background border-border/60">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code} className="font-mono">{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addMerchant.isPending || !merchantCategory || !merchantCountry}>
                {addMerchant.isPending ? (
                  <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />Adding…</span>
                ) : "Add Merchant"}
              </Button>
            </DialogFooter>
            {addMerchant.isError && (
              <p className="text-xs text-destructive font-mono bg-destructive/10 p-2 rounded">{(addMerchant.error as Error)?.message}</p>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Block Merchant Dialog ── */}
      <Dialog open={!!blockTargetId} onOpenChange={(open) => !open && setBlockTargetId(null)}>
        <DialogContent className="sm:max-w-[420px] bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><Ban className="w-5 h-5" /> Block Merchant</DialogTitle>
            <DialogDescription>Provide a reason for blocking. All future transactions at this merchant will be rejected.</DialogDescription>
          </DialogHeader>
          <form onSubmit={blockForm.handleSubmit(handleBlockSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-muted-foreground">Block Reason *</Label>
              <Textarea {...blockForm.register("reason", { required: true })} placeholder="e.g. High fraud rate > 30%, associated with fraud ring…" className="bg-background border-border/60 resize-none" rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBlockTargetId(null)}>Cancel</Button>
              <Button type="submit" variant="destructive" disabled={blockMerchant.isPending}>
                {blockMerchant.isPending ? "Blocking…" : "Confirm Block"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
