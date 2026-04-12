import { QiRealmId } from "./realms";
import { SystemCode, isValidSystemCode, isValidOrbitCode } from "./utils";


const realmCodes: Record<QiRealmId, number> = {
  QiOne: 1,
  QiClients: 2,
  QiProjects: 3,
  QiArchive: 4,
  QiSystem: 5,
  QiExternal: 6,
} as const;

export interface QiDContext {
  realm: QiRealmId;
  orbitCode: string; // "01".."99"
  systemCode: SystemCode;
  lastSequence: number;
}

/**
 * Generate a QiDecimal ID (QiD) from context
 * @throws {Error} if inputs are invalid
 */
export function generateQiD(ctx: QiDContext): string {
  // Validate inputs
  if (!isValidOrbitCode(ctx.orbitCode)) {
    throw new Error(`Invalid orbit code: ${ctx.orbitCode}. Must be 2 digits.`);
  }
  
  if (!isValidSystemCode(ctx.systemCode)) {
    throw new Error(`Invalid system code: ${ctx.systemCode}. Must be 01-15.`);
  }

  if (ctx.lastSequence < 0) {
    throw new Error(`Invalid sequence: ${ctx.lastSequence}. Must be >= 0.`);
  }

  const r = realmCodes[ctx.realm];
  if (!r) {
    throw new Error(`Invalid realm: ${ctx.realm}`);
  }

  const oo = ctx.orbitCode.padStart(2, "0");
  const ss = ctx.systemCode;
  const nnn = String(ctx.lastSequence + 1).padStart(3, "0");
  
  return `${r}.${oo}.${ss}.${nnn}`;
}

/**
 * Parse a QiD string into its components
 */
export function parseQiD(qid: string): {
  realm: QiRealmId;
  realmCode: number;
  orbitCode: string;
  systemCode: SystemCode;
  sequence: number;
} | null {
  const parts = qid.split(".");
  if (parts.length !== 4) {
    return null;
  }

  const [r, oo, ss, nnn] = parts;
  const realmCode = parseInt(r, 10);
  const sequence = parseInt(nnn, 10);

  // Find realm by code
  const realm = Object.entries(realmCodes).find(
    ([_, code]) => code === realmCode
  )?.[0] as QiRealmId | undefined;

  if (!realm || !isValidSystemCode(ss) || !isValidOrbitCode(oo) || isNaN(sequence)) {
    return null;
  }

  return {
    realm,
    realmCode,
    orbitCode: oo,
    systemCode: ss,
    sequence,
  };
}


