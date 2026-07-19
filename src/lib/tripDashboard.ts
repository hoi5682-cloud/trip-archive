import { parseCsv } from "./csv";

export type SheetRow = Record<string, string>;

export async function fetchRecords(url: string): Promise<SheetRow[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  const text = await res.text();
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  const [header, ...body] = rows;
  return body
    .filter((r) => r.some((cell) => cell.trim() !== ""))
    .map((r) => {
      const record: SheetRow = {};
      header.forEach((key, i) => {
        record[key.trim()] = (r[i] ?? "").trim();
      });
      return record;
    });
}

export function parseAmount(raw: string): number {
  const digits = raw.replace(/[^0-9-]/g, "");
  const n = parseInt(digits, 10);
  return Number.isNaN(n) ? 0 : n;
}

export function summarizeBudget(rows: SheetRow[]): {
  totalPlanned: number;
  totalActual: number;
  remaining: number;
  percentUsed: number;
  byCategory: { category: string; planned: number; actual: number }[];
} {
  const byCategory = rows.map((r) => ({
    category: r["항목"] ?? "",
    planned: parseAmount(r["예산"] ?? ""),
    actual: parseAmount(r["실사용"] ?? ""),
  }));
  const totalPlanned = byCategory.reduce((sum, r) => sum + r.planned, 0);
  const totalActual = byCategory.reduce((sum, r) => sum + r.actual, 0);
  const remaining = totalPlanned - totalActual;
  const percentUsed = totalPlanned === 0 ? 0 : Math.round((totalActual / totalPlanned) * 100);
  return { totalPlanned, totalActual, remaining, percentUsed, byCategory };
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function findTodayAndNext(
  rows: SheetRow[],
  now: Date
): { today: SheetRow[]; next: SheetRow | null } {
  const todayKey = toDateKey(now);
  const sorted = [...rows].sort((a, b) => {
    const aKey = `${a["날짜"] ?? ""} ${a["시간"] ?? ""}`;
    const bKey = `${b["날짜"] ?? ""} ${b["시간"] ?? ""}`;
    return aKey.localeCompare(bKey);
  });

  const today = sorted.filter((r) => r["날짜"] === todayKey);

  const nowKey = `${todayKey} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const next =
    sorted.find((r) => `${r["날짜"] ?? ""} ${r["시간"] ?? ""}` >= nowKey) ?? null;

  return { today, next };
}

export function summarizeChecklist(rows: SheetRow[]): {
  done: number;
  total: number;
  byCategory: { category: string; done: number; total: number }[];
} {
  const isDone = (r: SheetRow) => (r["완료"] ?? "").trim().toUpperCase() === "TRUE";
  const done = rows.filter(isDone).length;
  const total = rows.length;

  const categories = new Map<string, { done: number; total: number }>();
  for (const r of rows) {
    const category = r["구분"] ?? "";
    const entry = categories.get(category) ?? { done: 0, total: 0 };
    entry.total += 1;
    if (isDone(r)) entry.done += 1;
    categories.set(category, entry);
  }

  return {
    done,
    total,
    byCategory: Array.from(categories.entries()).map(([category, v]) => ({ category, ...v })),
  };
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: { className?: string; text?: string } = {}
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (opts.className) node.className = opts.className;
  if (opts.text !== undefined) node.textContent = opts.text;
  return node;
}

function renderError(container: HTMLElement, message: string) {
  container.replaceChildren(el("p", { className: "td-error", text: message }));
}

function renderToday(container: HTMLElement, rows: SheetRow[], now: Date) {
  const { today, next } = findTodayAndNext(rows, now);
  const frag = document.createDocumentFragment();

  const todayBlock = el("div", { className: "td-today-list" });
  if (today.length === 0) {
    todayBlock.append(el("p", { className: "td-muted", text: "오늘 예정된 일정이 없어요" }));
  } else {
    today.forEach((r) => {
      const item = el("div", { className: "td-item" });
      item.append(
        el("span", { className: "td-time", text: r["시간"] ?? "" }),
        el("span", { className: "td-title", text: r["제목"] ?? "" }),
        ...(r["장소"] ? [el("span", { className: "td-place", text: r["장소"] })] : [])
      );
      todayBlock.append(item);
    });
  }
  frag.append(el("h3", { text: "오늘 일정" }), todayBlock);

  if (next && !today.includes(next)) {
    const nextBlock = el("div", { className: "td-item td-next" });
    nextBlock.append(
      el("span", { className: "td-time", text: `${next["날짜"] ?? ""} ${next["시간"] ?? ""}` }),
      el("span", { className: "td-title", text: next["제목"] ?? "" })
    );
    frag.append(el("h3", { text: "다음 일정" }), nextBlock);
  }

  container.replaceChildren(frag);
}

function renderBudget(container: HTMLElement, rows: SheetRow[]) {
  const summary = summarizeBudget(rows);
  const frag = document.createDocumentFragment();

  frag.append(el("h3", { text: "예산 요약" }));

  const bar = el("div", { className: "td-bar" });
  const fill = el("div", { className: "td-bar-fill" });
  fill.style.width = `${Math.min(summary.percentUsed, 100)}%`;
  bar.append(fill);
  frag.append(bar);

  frag.append(
    el("p", {
      className: "td-budget-line",
      text: `${summary.totalActual.toLocaleString()}원 사용 / ${summary.totalPlanned.toLocaleString()}원 예산 (잔여 ${summary.remaining.toLocaleString()}원)`,
    })
  );

  container.replaceChildren(frag);
}

function renderItineraryFull(container: HTMLElement, rows: SheetRow[]) {
  if (rows.length === 0) {
    container.replaceChildren(el("p", { className: "td-muted", text: "동선 데이터가 없어요" }));
    return;
  }
  const list = el("div", { className: "td-full-list" });
  rows.forEach((r) => {
    const item = el("div", { className: "td-item" });
    item.append(
      el("span", { className: "td-time", text: `${r["날짜"] ?? ""} ${r["시간"] ?? ""}` }),
      el("span", { className: "td-title", text: r["제목"] ?? "" }),
      ...(r["장소"] ? [el("span", { className: "td-place", text: r["장소"] })] : [])
    );
    list.append(item);
  });
  container.replaceChildren(list);
}

function renderChecklistFull(container: HTMLElement, rows: SheetRow[]) {
  const summary = summarizeChecklist(rows);
  const frag = document.createDocumentFragment();
  frag.append(
    el("p", { className: "td-budget-line", text: `${summary.done} / ${summary.total} 완료` })
  );
  summary.byCategory.forEach((c) => {
    frag.append(el("p", { className: "td-muted", text: `${c.category}: ${c.done}/${c.total}` }));
  });
  container.replaceChildren(frag);
}

export async function mountTripDashboard(root: HTMLElement): Promise<void> {
  const { itineraryUrl, budgetUrl, checklistUrl } = root.dataset;
  const now = new Date();

  const todayEl = root.querySelector<HTMLElement>("#td-today");
  const budgetEl = root.querySelector<HTMLElement>("#td-budget");
  const itineraryFullEl = root.querySelector<HTMLElement>("#td-itinerary-full");
  const checklistFullEl = root.querySelector<HTMLElement>("#td-checklist-full");

  const [itineraryResult, budgetResult, checklistResult] = await Promise.allSettled([
    itineraryUrl ? fetchRecords(itineraryUrl) : Promise.resolve(null),
    budgetUrl ? fetchRecords(budgetUrl) : Promise.resolve(null),
    checklistUrl ? fetchRecords(checklistUrl) : Promise.resolve(null),
  ]);

  if (todayEl) {
    if (itineraryResult.status === "fulfilled" && itineraryResult.value) {
      renderToday(todayEl, itineraryResult.value, now);
    } else if (itineraryResult.status === "rejected") {
      renderError(todayEl, "일정을 불러오지 못했어요");
    } else {
      todayEl.replaceChildren();
    }
  }

  if (budgetEl) {
    if (budgetResult.status === "fulfilled" && budgetResult.value) {
      renderBudget(budgetEl, budgetResult.value);
    } else if (budgetResult.status === "rejected") {
      renderError(budgetEl, "예산을 불러오지 못했어요");
    } else {
      budgetEl.replaceChildren();
    }
  }

  if (itineraryFullEl) {
    if (itineraryResult.status === "fulfilled" && itineraryResult.value) {
      renderItineraryFull(itineraryFullEl, itineraryResult.value);
    } else if (itineraryResult.status === "rejected") {
      renderError(itineraryFullEl, "동선을 불러오지 못했어요");
    }
  }

  if (checklistFullEl) {
    if (checklistResult.status === "fulfilled" && checklistResult.value) {
      renderChecklistFull(checklistFullEl, checklistResult.value);
    } else if (checklistResult.status === "rejected") {
      renderError(checklistFullEl, "체크리스트를 불러오지 못했어요");
    }
  }
}
