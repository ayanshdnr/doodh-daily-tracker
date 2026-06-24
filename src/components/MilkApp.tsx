import { useEffect, useMemo, useState } from "react";
import { Milk, Calendar, FileSpreadsheet, FileText, IndianRupee, Mail, Settings as SettingsIcon, LogOut, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  getEmail, setEmail, clearEmail, getRate, setRate,
  getEntries, setEntry, todayKey, getMonthData, formatDateHindi,
  QTY_OPTIONS,
} from "@/lib/milk-storage";
import { exportMonthExcel, exportMonthPDF } from "@/lib/milk-export";

const HINDI_MONTHS = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];

export default function MilkApp() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmailState] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setEmailState(getEmail());
  }, []);

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Milk className="w-10 h-10 text-primary animate-pulse" /></div>;
  }

  if (!email) {
    return <EmailGate onDone={(e) => setEmailState(e)} />;
  }

  return <Dashboard email={email} onLogout={() => { clearEmail(); setEmailState(null); }} />;
}

function EmailGate({ onDone }: { onDone: (e: string) => void }) {
  const [value, setValue] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      toast.error("कृपया सही ईमेल आईडी डालें");
      return;
    }
    setEmail(v);
    onDone(v);
    toast.success("स्वागत है!");
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--gradient-surface)" }}>
      <Card className="w-full max-w-md shadow-[var(--shadow-card)] border-border/60">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
            <Milk className="w-9 h-9 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">दूध डायरी</CardTitle>
          <p className="text-sm text-muted-foreground">रोज़ाना दूध का हिसाब — ऑफलाइन</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4" /> अपनी ईमेल आईडी डालें</Label>
              <Input id="email" type="email" inputMode="email" autoComplete="email" placeholder="aapka@email.com" value={value} onChange={(e) => setValue(e.target.value)} required className="h-12 text-base" />
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold">आगे बढ़ें</Button>
            <p className="text-xs text-center text-muted-foreground">आपका सारा डेटा सिर्फ़ इसी मोबाइल में रहेगा।</p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Dashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month0, setMonth0] = useState(now.getMonth());
  const [tick, setTick] = useState(0); // refresh trigger
  const today = todayKey();

  const entries = useMemo(() => { void tick; return getEntries(); }, [tick]);
  const rate = useMemo(() => { void tick; return getRate(); }, [tick]);
  const todayQty = entries[today] ?? 0;

  const monthData = useMemo(() => { void tick; return getMonthData(year, month0); }, [year, month0, tick]);

  function addToday(addQty: number) {
    const next = Math.min(20, Math.round((todayQty + addQty) * 100) / 100);
    setEntry(today, next);
    setTick((t) => t + 1);
    toast.success(`+${addQty} L जोड़ा · कुल ${next} L`);
  }
  function subtractToday(subQty: number) {
    const next = Math.max(0, Math.round((todayQty - subQty) * 100) / 100);
    setEntry(today, next);
    setTick((t) => t + 1);
    toast.success(`−${subQty} L घटाया · कुल ${next} L`);
  }
  function resetToday() {
    setEntry(today, 0);
    setTick((t) => t + 1);
    toast.success("आज का हिसाब रीसेट किया");
  }

  function saveDate(date: string, qty: number) {
    setEntry(date, qty);
    setTick((t) => t + 1);
  }


  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--gradient-surface)" }}>
      <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Milk className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">दूध डायरी</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">{email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout} aria-label="लॉगआउट"><LogOut className="w-5 h-5" /></Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid grid-cols-4 w-full h-12">
            <TabsTrigger value="today">आज</TabsTrigger>
            <TabsTrigger value="history">महीना</TabsTrigger>
            <TabsTrigger value="report">रिपोर्ट</TabsTrigger>
            <TabsTrigger value="settings"><SettingsIcon className="w-4 h-4" /></TabsTrigger>
          </TabsList>

          {/* TODAY */}
          <TabsContent value="today" className="space-y-4 mt-5">
            <Card className="shadow-[var(--shadow-soft)] border-border/60 overflow-hidden">
              <div className="px-5 py-4 text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                <p className="text-xs opacity-90 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> आज की तारीख</p>
                <p className="text-xl font-bold mt-0.5">{formatDateHindi(today)}</p>
              </div>
              <CardContent className="pt-5 space-y-4">
                <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 text-center">
                  <p className="text-xs text-muted-foreground">आज कुल दूध</p>
                  <p className="text-4xl font-bold text-primary mt-1">{todayQty} <span className="text-lg font-medium">लीटर</span></p>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-3 block">मात्रा जोड़ें (एक से ज़्यादा बार दबा सकते हैं)</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0.25, 0.5, 0.75, 1].map((q) => (
                      <button
                        key={q}
                        onClick={() => addToday(q)}
                        className="h-20 rounded-xl border-2 border-border bg-card hover:border-primary/60 active:scale-95 transition-all flex flex-col items-center justify-center"
                      >
                        <span className="text-xs text-muted-foreground">+</span>
                        <span className="text-lg font-bold leading-none">{q}</span>
                        <span className="text-[10px] mt-1 text-muted-foreground">लीटर</span>
                      </button>
                    ))}
                  </div>
                  <Label className="text-sm font-medium mb-2 mt-4 block text-destructive">गलती से ज़्यादा हो गया तो घटाएँ</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0.25, 0.5, 0.75, 1].map((q) => (
                      <button
                        key={`sub-${q}`}
                        onClick={() => subtractToday(q)}
                        className="h-16 rounded-xl border-2 border-destructive/30 bg-destructive/5 hover:border-destructive/60 active:scale-95 transition-all flex flex-col items-center justify-center text-destructive"
                      >
                        <span className="text-xs">−</span>
                        <span className="text-lg font-bold leading-none">{q}</span>
                        <span className="text-[10px] mt-1">लीटर</span>
                      </button>
                    ))}
                  </div>
                  <Button onClick={resetToday} variant="outline" className="w-full mt-3 h-11">
                    रीसेट करें (0 / दूध नहीं आया)
                  </Button>
                </div>
                <div className="flex items-center justify-between bg-muted rounded-xl px-4 py-3">
                  <span className="text-sm text-muted-foreground">आज का खर्च</span>
                  <span className="font-bold text-lg flex items-center"><IndianRupee className="w-4 h-4" />{(todayQty * rate).toFixed(2)}</span>
                </div>

              </CardContent>
            </Card>

            <SummaryCards data={monthData} year={year} month0={month0} />
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="history" className="space-y-4 mt-5">
            <MonthSelector year={year} month0={month0} setYear={setYear} setMonth0={setMonth0} />
            <Card className="border-border/60">
              <CardContent className="p-0 divide-y divide-border">
                {monthData.rows.map((r) => (
                  <DayRow key={r.date} date={r.date} qty={r.qty} rate={rate} onChange={(q) => saveDate(r.date, q)} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* REPORT */}
          <TabsContent value="report" className="space-y-4 mt-5">
            <MonthSelector year={year} month0={month0} setYear={setYear} setMonth0={setMonth0} />
            <SummaryCards data={monthData} year={year} month0={month0} large />
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => exportMonthPDF(year, month0)} className="h-14 text-base" variant="default">
                <FileText className="w-5 h-5" /> PDF
              </Button>
              <Button onClick={() => exportMonthExcel(year, month0)} className="h-14 text-base" variant="secondary">
                <FileSpreadsheet className="w-5 h-5" /> Excel
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">जिस दिन दूध नहीं आया, रिपोर्ट में उस दिन 0 दिखेगा।</p>
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings" className="space-y-4 mt-5">
            <RateSettings rate={rate} onSaved={() => setTick((t) => t + 1)} />
            <Card className="border-border/60">
              <CardHeader><CardTitle className="text-base">आपकी ईमेल</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{email}</p>
                <Button variant="outline" className="mt-3 w-full" onClick={onLogout}>
                  <LogOut className="w-4 h-4" /> लॉगआउट
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function SummaryCards({ data, year, month0, large }: { data: ReturnType<typeof getMonthData>; year: number; month0: number; large?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">{HINDI_MONTHS[month0]} {year} का हिसाब</p>
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="दिन" value={`${data.daysCount}`} icon={<CheckCircle2 className="w-4 h-4" />} large={large} />
        <StatCard label="कुल लीटर" value={`${data.totalQty}`} icon={<Milk className="w-4 h-4" />} large={large} />
        <StatCard label="कुल ₹" value={data.totalAmount.toFixed(0)} icon={<IndianRupee className="w-4 h-4" />} large={large} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, large }: { label: string; value: string; icon: React.ReactNode; large?: boolean }) {
  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)]">
      <CardContent className={large ? "p-4" : "p-3"}>
        <div className="text-muted-foreground flex items-center gap-1 text-[11px]">{icon}{label}</div>
        <div className={`font-bold text-foreground mt-1 ${large ? "text-2xl" : "text-lg"}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function MonthSelector({ year, month0, setYear, setMonth0 }: { year: number; month0: number; setYear: (n: number) => void; setMonth0: (n: number) => void }) {
  const years = [year - 1, year, year + 1].filter((y, i, a) => a.indexOf(y) === i);
  const baseYear = new Date().getFullYear();
  const yearList = Array.from({ length: 5 }, (_, i) => baseYear - 2 + i);
  void years;
  return (
    <div className="grid grid-cols-2 gap-2">
      <Select value={String(month0)} onValueChange={(v) => setMonth0(Number(v))}>
        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
        <SelectContent>
          {HINDI_MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
        <SelectContent>
          {yearList.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function DayRow({ date, qty, rate, onChange }: { date: string; qty: number; rate: number; onChange: (q: number) => void }) {
  const [open, setOpen] = useState(false);
  const isToday = date === todayKey();
  return (
    <div className="px-4 py-3">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          {qty > 0 ? <CheckCircle2 className="w-5 h-5 text-[var(--success)]" /> : <Circle className="w-5 h-5 text-muted-foreground/40" />}
          <div className="text-left">
            <div className="font-medium text-sm">{formatDateHindi(date)} {isToday && <span className="ml-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">आज</span>}</div>
            <div className="text-xs text-muted-foreground">{qty > 0 ? `${qty} L · ₹${(qty * rate).toFixed(2)}` : "दूध नहीं आया"}</div>
          </div>
        </div>
        <span className="text-xs text-primary font-medium">{open ? "बंद" : "बदलें"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          <div className="text-xs text-muted-foreground">कुल: <span className="font-semibold text-foreground">{qty} L</span></div>
          <div className="grid grid-cols-4 gap-1.5">
            {[0.25, 0.5, 0.75, 1].map((q) => (
              <button
                key={q}
                onClick={() => onChange(Math.min(20, Math.round((qty + q) * 100) / 100))}
                className="h-11 rounded-lg border-2 border-border bg-card text-sm font-semibold active:scale-95"
              >
                +{q}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[0.25, 0.5, 0.75, 1].map((q) => (
              <button
                key={`sub-${q}`}
                onClick={() => onChange(Math.max(0, Math.round((qty - q) * 100) / 100))}
                className="h-11 rounded-lg border-2 border-destructive/30 bg-destructive/5 text-destructive text-sm font-semibold active:scale-95"
              >
                −{q}
              </button>
            ))}
          </div>
          <button
            onClick={() => { onChange(0); setOpen(false); }}
            className="w-full h-10 rounded-lg border-2 border-destructive/30 text-destructive text-sm font-medium"
          >
            रीसेट (0)
          </button>
        </div>
      )}

    </div>
  );
}

function RateSettings({ rate, onSaved }: { rate: number; onSaved: () => void }) {
  const [value, setValue] = useState(String(rate));
  function save() {
    const n = Number(value);
    if (!n || n <= 0) { toast.error("सही रेट डालें"); return; }
    setRate(n);
    onSaved();
    toast.success("रेट सेव हो गया");
  }
  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-base">दूध का रेट</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Label htmlFor="rate">प्रति लीटर (₹)</Label>
        <div className="flex gap-2">
          <Input id="rate" type="number" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className="h-12 text-base" />
          <Button onClick={save} className="h-12 px-6">सेव</Button>
        </div>
        <p className="text-xs text-muted-foreground">रेट बदलने पर पुराने दिनों का हिसाब नए रेट से दिखेगा।</p>
      </CardContent>
    </Card>
  );
}
