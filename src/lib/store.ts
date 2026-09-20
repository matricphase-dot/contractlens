import type { Contract } from "./types";

// In-memory store that persists across requests within a lambda instance,
// with filesystem backup for local dev.
const GLOBAL_KEY = "__contractlens_store__" as const;
type Store = { contracts: Contract[] };

function getGlobal(): Store {
  const g = globalThis as any;
  if (!g[GLOBAL_KEY]) g[GLOBAL_KEY] = { contracts: [] } as Store;
  return g[GLOBAL_KEY];
}

// Try to load from filesystem on module init (local dev)
import * as fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), ".data", "contracts.json");
let initialized = false;

async function init() {
  if (initialized) return;
  initialized = true;
  try {
    await fs.mkdir(path.join(process.cwd(), ".data"), { recursive: true });
    try {
      const raw = await fs.readFile(DATA_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        getGlobal().contracts = data;
      }
    } catch {}
  } catch {}
}

async function persist() {
  try {
    await fs.mkdir(path.join(process.cwd(), ".data"), { recursive: true });
    const slim = getGlobal().contracts.map(c => ({ ...c, fullText: c.fullText.slice(0, 5000) }));
    await fs.writeFile(DATA_FILE, JSON.stringify(slim, null, 2), "utf-8");
  } catch {}
}

export async function getContracts(): Promise<Contract[]> {
  await init();
  return getGlobal().contracts;
}

export async function saveContracts(contracts: Contract[]) {
  await init();
  getGlobal().contracts = contracts;
  persist();
}

export async function addContract(contract: Contract) {
  const c = await getContracts();
  c.push(contract);
  await saveContracts(c);
}

export async function updateContract(id: string, updates: Partial<Contract>) {
  const c = await getContracts();
  const idx = c.findIndex(x => x.id === id);
  if (idx >= 0) { c[idx] = { ...c[idx], ...updates }; await saveContracts(c); }
}

export async function deleteContract(id: string) {
  const c = await getContracts();
  await saveContracts(c.filter(x => x.id !== id));
}

export async function getContract(id: string): Promise<Contract | undefined> {
  const c = await getContracts();
  return c.find(x => x.id === id);
}
