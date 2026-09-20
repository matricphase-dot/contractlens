import type { Contract } from "./types";
import * as fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), ".data", "contracts.json");

let contractsCache: Contract[] | null = null;

async function ensureDataFile() {
  try {
    await fs.mkdir(path.join(process.cwd(), ".data"), { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, "[]", "utf-8");
    }
  } catch {}
}

export async function getContracts(): Promise<Contract[]> {
  if (contractsCache) return contractsCache;
  await ensureDataFile();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    contractsCache = JSON.parse(raw);
  } catch {
    contractsCache = [];
  }
  return contractsCache || [];
}

export async function saveContracts(contracts: Contract[]) {
  contractsCache = contracts;
  await ensureDataFile();
  // Don't save fullText to keep file small
  const slim = contracts.map(c => ({ ...c, fullText: c.fullText.slice(0, 5000) }));
  await fs.writeFile(DATA_FILE, JSON.stringify(slim, null, 2), "utf-8");
}

export async function addContract(contract: Contract) {
  const contracts = await getContracts();
  contracts.push(contract);
  await saveContracts(contracts);
}

export async function updateContract(id: string, updates: Partial<Contract>) {
  const contracts = await getContracts();
  const idx = contracts.findIndex(c => c.id === id);
  if (idx >= 0) {
    contracts[idx] = { ...contracts[idx], ...updates };
    await saveContracts(contracts);
  }
}

export async function deleteContract(id: string) {
  const contracts = await getContracts();
  const filtered = contracts.filter(c => c.id !== id);
  await saveContracts(filtered);
}

export async function getContract(id: string): Promise<Contract | undefined> {
  const contracts = await getContracts();
  return contracts.find(c => c.id === id);
}


