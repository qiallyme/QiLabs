import { emptyPacket } from "../data/blueprint";
import type { PacketState } from "../types";

const STORAGE_KEY = "qilegacy-estate-packet-v1";

function hydratePacket(parsed: Partial<PacketState>): PacketState {
  return {
    ...emptyPacket,
    ...parsed,
    household: { ...emptyPacket.household, ...parsed.household },
    people: { ...emptyPacket.people, ...parsed.people },
    will: { ...emptyPacket.will, ...parsed.will },
    healthCare: { ...emptyPacket.healthCare, ...parsed.healthCare },
    financialPoa: { ...emptyPacket.financialPoa, ...parsed.financialPoa },
    hipaa: { ...emptyPacket.hipaa, ...parsed.hipaa },
    trust: { ...emptyPacket.trust, ...parsed.trust },
    finalWishes: { ...emptyPacket.finalWishes, ...parsed.finalWishes },
    signatures: { ...emptyPacket.signatures, ...parsed.signatures },
    assets: parsed.assets?.length ? parsed.assets : emptyPacket.assets,
    beneficiaryAccounts: parsed.beneficiaryAccounts?.length
      ? parsed.beneficiaryAccounts
      : emptyPacket.beneficiaryAccounts,
  };
}

export function loadPacket(): PacketState {
  if (typeof window === "undefined") {
    return emptyPacket;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return emptyPacket;
  }

  try {
    const parsed = JSON.parse(raw) as PacketState;
    return hydratePacket(parsed);
  } catch {
    return emptyPacket;
  }
}

export function savePacket(packet: PacketState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(packet));
}

export function downloadPacketBackup(packet: PacketState): void {
  const blob = new Blob([JSON.stringify(packet, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "qilegacy-estate-packet.json";
  link.click();
  URL.revokeObjectURL(url);
}

export async function importPacketBackup(file: File): Promise<PacketState> {
  const raw = await file.text();

  try {
    const parsed = JSON.parse(raw) as Partial<PacketState>;
    return hydratePacket(parsed);
  } catch {
    throw new Error("This JSON backup could not be read.");
  }
}
