import type { PacketState, PrintableDocument, StepId } from "../types";

function orBlank(value: string, fallback = "[Pending]"): string {
  return value.trim() || fallback;
}

function personLabel(
  packet: PacketState,
  key:
    | "executor"
    | "alternateExecutor"
    | "primaryHealthAgent"
    | "alternateHealthAgent"
    | "attorneyInFact"
    | "successorTrustee"
    | "guardian"
    | "primaryHipaaRecipient",
): string {
  const person = packet.people[key];
  return orBlank(person.fullName);
}

function principal(packet: PacketState): string {
  return orBlank(packet.household.principalFullName);
}

function assetSummary(packet: PacketState): string[] {
  const active = packet.assets.filter(
    (asset) => asset.description.trim() || asset.intendedRecipient.trim(),
  );

  if (!active.length) {
    return ["No asset schedule has been completed yet."];
  }

  return active.map((asset) => {
    const category = orBlank(asset.category, "Uncategorized asset");
    const description = orBlank(asset.description);
    const recipient = orBlank(asset.intendedRecipient, "To be assigned");
    const trustFlag = asset.placeInTrust ? "Trust transfer flagged" : "Direct distribution";
    return `${category}: ${description}. Recipient: ${recipient}. ${trustFlag}.`;
  });
}

function beneficiarySummary(packet: PacketState): string[] {
  const active = packet.beneficiaryAccounts.filter(
    (entry) =>
      entry.institutionName.trim() ||
      entry.accountLabel.trim() ||
      entry.primaryBeneficiary.trim(),
  );

  if (!active.length) {
    return ["No beneficiary accounts have been listed yet."];
  }

  return active.map((entry) => {
    return `${orBlank(entry.institutionName)} - ${orBlank(entry.accountLabel)} (${orBlank(
      entry.accountType,
      "Account",
    )}). Primary: ${orBlank(entry.primaryBeneficiary)}. Contingent: ${orBlank(
      entry.contingentBeneficiary,
      "Not listed",
    )}.`;
  });
}

export function buildPrintableDocuments(packet: PacketState): PrintableDocument[] {
  const principalName = principal(packet);
  const hometown = [packet.household.city, packet.household.state]
    .filter(Boolean)
    .join(", ");

  return [
    {
      id: "cover-sheet",
      title: packet.household.packetTitle || "Estate Planning Packet",
      subtitle: "QiLegacy Questionnaire Output",
      paragraphs: [
        `Prepared for ${principalName}${hometown ? ` of ${hometown}` : ""}.`,
        "This packet is a document-preparation workflow output and should be reviewed for state-specific execution requirements before signing.",
        `Last updated: ${orBlank(packet.lastUpdatedAt, "Not yet saved")}.`,
      ],
      bullets: [
        "Last Will and Testament",
        "Living Will and Health Care Power",
        "Durable Power of Attorney (Financial)",
        "HIPAA Authorization",
        "Revocable Living Trust (Optional)",
        "Beneficiary Designations Summary",
        "Final Wishes Addendum",
        "Master Signature and Storage Notes",
      ],
    },
    {
      id: "will",
      title: "Last Will and Testament",
      subtitle: "Document 1",
      paragraphs: [
        `I, ${principalName}, declare this to be my Last Will and Testament and revoke all prior wills and codicils.`,
        `I appoint ${personLabel(packet, "executor")} as my Personal Representative. If that person cannot serve, I appoint ${personLabel(
          packet,
          "alternateExecutor",
        )}.`,
        `I direct that my estate pass primarily to ${orBlank(packet.will.primaryBeneficiary)}. If that beneficiary does not survive me, I designate ${orBlank(
          packet.will.alternateBeneficiary,
        )}.`,
        orBlank(packet.will.taxAndExpenseInstructions),
        orBlank(packet.will.guardianshipNotes),
      ],
      bullets: assetSummary(packet),
    },
    {
      id: "health-care",
      title: "Living Will and Health Care Power",
      subtitle: "Document 2",
      paragraphs: [
        `Declarant: ${principalName}. Address: ${orBlank(packet.household.addressLine1)} ${packet.household.addressLine2}`.trim(),
        `Primary Health Care Agent: ${personLabel(packet, "primaryHealthAgent")}. Alternate Agent: ${personLabel(
          packet,
          "alternateHealthAgent",
        )}.`,
        `Life support preference: ${orBlank(packet.healthCare.lifeSupportPreference)}.`,
        `CPR and resuscitation: ${orBlank(packet.healthCare.cprPreference)}. Feeding tubes: ${orBlank(
          packet.healthCare.feedingTubePreference,
        )}.`,
        `Comfort-care guidance: ${orBlank(packet.healthCare.comfortCarePreference)}. Organ donation: ${orBlank(
          packet.healthCare.organDonationPreference,
        )}. Autopsy: ${orBlank(packet.healthCare.autopsyPreference)}.`,
        orBlank(packet.healthCare.specialMedicalInstructions, "No additional medical instructions recorded."),
      ],
    },
    {
      id: "financial-poa",
      title: "Durable Power of Attorney (Financial)",
      subtitle: "Document 3",
      paragraphs: [
        `I appoint ${personLabel(packet, "attorneyInFact")} as my Attorney-in-Fact for financial and legal matters.`,
        `Effective date: ${orBlank(packet.financialPoa.effectiveDate)}.`,
        `Powers granted: ${orBlank(packet.financialPoa.powersGranted)}.`,
        `Benefits authority: ${orBlank(packet.financialPoa.benefitsAuthority)}.`,
        `Property authority: ${orBlank(packet.financialPoa.propertyAuthority)}.`,
        orBlank(packet.financialPoa.specialLimits, "No special limits recorded."),
      ],
    },
    {
      id: "hipaa",
      title: "HIPAA Authorization",
      subtitle: "Document 4",
      paragraphs: [
        `Authorized recipient: ${personLabel(packet, "primaryHipaaRecipient")}.`,
        `Release scope: ${orBlank(packet.hipaa.releaseScope)}.`,
        `Expiration rule: ${orBlank(packet.hipaa.expirationRule)}.`,
        `Additional recipients or notes: ${orBlank(packet.hipaa.additionalRecipients, "None listed.")}`,
      ],
    },
    {
      id: "trust",
      title: "Revocable Living Trust Agreement",
      subtitle: "Document 5",
      paragraphs: [
        `Trust status: ${orBlank(packet.trust.trustEnabled)}.`,
        `Trust name: ${orBlank(packet.trust.trustName, "To be named during attorney review")}.`,
        `Grantor: ${principalName}. Successor Trustee: ${personLabel(packet, "successorTrustee")}.`,
        `Trust purpose: ${orBlank(packet.trust.trustPurpose)}.`,
        `Schedule A notes: ${orBlank(packet.trust.scheduleANotes, "No Schedule A notes yet.")}`,
        `Revocation terms: ${orBlank(packet.trust.revocationTerms)}.`,
      ],
      bullets: assetSummary(packet).filter((line) => line.includes("Trust")),
    },
    {
      id: "beneficiaries",
      title: "Beneficiary Designations Summary",
      subtitle: "Document 6",
      paragraphs: [
        `Reviewed for ${principalName}. This summary tracks account-level transfers that may pass outside the will.`,
      ],
      bullets: beneficiarySummary(packet),
    },
    {
      id: "final-wishes",
      title: "Final Wishes Addendum",
      subtitle: "Document 7",
      paragraphs: [
        `Disposition of remains: ${orBlank(packet.finalWishes.remainsPreference)}.`,
        `Preferred funeral home: ${orBlank(packet.finalWishes.funeralHome)}.`,
        `Burial or memorial location: ${orBlank(packet.finalWishes.burialLocation)}.`,
        `Music: ${orBlank(packet.finalWishes.memorialMusic, "Not specified")}. Readings: ${orBlank(
          packet.finalWishes.memorialReadings,
          "Not specified",
        )}. Theme: ${orBlank(packet.finalWishes.memorialTheme, "Not specified")}.`,
        `Personal message: ${orBlank(packet.finalWishes.personalMessage, "No message recorded yet.")}`,
        `Digital vault location: ${orBlank(packet.finalWishes.digitalVaultLocation, "Not recorded")}.`,
        `Digital executor notes: ${orBlank(packet.finalWishes.digitalExecutorNotes, "No digital-estate notes recorded.")}`,
      ],
    },
    {
      id: "signature-record",
      title: "Master Signature and Storage Notes",
      subtitle: "Execution Checklist",
      paragraphs: [
        `Expected witness count: ${orBlank(packet.signatures.witnessCount)}.`,
        `Notary status: ${orBlank(packet.signatures.notaryRequired)}.`,
        `Storage plan: ${orBlank(packet.signatures.storagePlan)}.`,
        `Attorney review status: ${orBlank(packet.signatures.attorneyReviewStatus, "Not yet reviewed.")}`,
        `Execution checklist: ${orBlank(packet.signatures.finalChecklist)}.`,
      ],
    },
  ];
}

export function buildActivePreview(packet: PacketState, activeStep: StepId): PrintableDocument {
  const docs = buildPrintableDocuments(packet);
  const byStep: Record<StepId, string> = {
    overview: "cover-sheet",
    household: "cover-sheet",
    will: "will",
    healthCare: "health-care",
    financialPoa: "financial-poa",
    hipaa: "hipaa",
    trust: "trust",
    beneficiaries: "beneficiaries",
    finalWishes: "final-wishes",
    signatures: "signature-record",
    export: "cover-sheet",
  };

  const doc = docs.find((item) => item.id === byStep[activeStep]);
  return doc ?? docs[0];
}

export function calculateSectionCompletion(packet: PacketState): Record<StepId, number> {
  const counts: Record<StepId, [number, number]> = {
    overview: [1, 1],
    household: [
      [
        packet.household.principalFullName,
        packet.household.jurisdictionState,
        packet.household.addressLine1,
      ].filter(Boolean).length,
      3,
    ],
    will: [
      [
        packet.will.primaryBeneficiary,
        packet.people.executor.fullName,
        packet.will.taxAndExpenseInstructions,
      ].filter(Boolean).length,
      3,
    ],
    healthCare: [
      [
        packet.people.primaryHealthAgent.fullName,
        packet.healthCare.lifeSupportPreference,
        packet.healthCare.cprPreference,
      ].filter(Boolean).length,
      3,
    ],
    financialPoa: [
      [
        packet.people.attorneyInFact.fullName,
        packet.financialPoa.effectiveDate,
        packet.financialPoa.powersGranted,
      ].filter(Boolean).length,
      3,
    ],
    hipaa: [
      [
        packet.people.primaryHipaaRecipient.fullName,
        packet.hipaa.releaseScope,
        packet.hipaa.expirationRule,
      ].filter(Boolean).length,
      3,
    ],
    trust: [
      [
        packet.people.successorTrustee.fullName,
        packet.trust.trustEnabled,
        packet.trust.trustPurpose,
      ].filter(Boolean).length,
      3,
    ],
    beneficiaries: [
      [
        packet.assets.some((asset) => asset.description.trim()) ? "1" : "",
        packet.beneficiaryAccounts.some((entry) => entry.institutionName.trim()) ? "1" : "",
        packet.will.alternateBeneficiary,
      ].filter(Boolean).length,
      3,
    ],
    finalWishes: [
      [
        packet.finalWishes.remainsPreference,
        packet.finalWishes.personalMessage,
        packet.finalWishes.digitalVaultLocation,
      ].filter(Boolean).length,
      3,
    ],
    signatures: [
      [
        packet.signatures.witnessCount,
        packet.signatures.notaryRequired,
        packet.signatures.storagePlan,
      ].filter(Boolean).length,
      3,
    ],
    export: [1, 1],
  };

  return Object.fromEntries(
    Object.entries(counts).map(([key, [filled, total]]) => [
      key,
      Math.round((filled / total) * 100),
    ]),
  ) as Record<StepId, number>;
}
