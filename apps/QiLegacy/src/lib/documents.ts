import type {
  PacketReadiness,
  PacketState,
  PrintableDocument,
  ReadinessIssue,
  ReviewSection,
  StepId,
} from "../types";

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function orBlank(value: string, fallback = "[Pending]"): string {
  return hasText(value) ? value.trim() : fallback;
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
  return orBlank(packet.people[key].fullName);
}

function principal(packet: PacketState): string {
  return orBlank(packet.household.principalFullName);
}

function formatIssue(issue: ReadinessIssue): string {
  return `${issue.label}: ${issue.detail}`;
}

function addIssue(
  issues: ReadinessIssue[],
  condition: boolean,
  issue: ReadinessIssue,
): void {
  if (condition) {
    issues.push(issue);
  }
}

function assetSummary(packet: PacketState): string[] {
  const active = packet.assets.filter(
    (asset) => hasText(asset.description) || hasText(asset.intendedRecipient),
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
      hasText(entry.institutionName) ||
      hasText(entry.accountLabel) ||
      hasText(entry.primaryBeneficiary),
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

function buildSignatureLines(packet: PacketState): string[] {
  const witnessCount = Number.parseInt(packet.signatures.witnessCount, 10);
  const normalizedWitnessCount = Number.isFinite(witnessCount) && witnessCount > 0
    ? Math.min(witnessCount, 4)
    : 2;

  const lines = [
    `${principal(packet)} signature: ______________________________________`,
    "Date signed: ______________________________________",
  ];

  for (let index = 0; index < normalizedWitnessCount; index += 1) {
    lines.push(`Witness ${index + 1} signature: ______________________________________`);
    lines.push(`Witness ${index + 1} printed name: ___________________________________`);
  }

  lines.push("Notary acknowledgment / seal: ___________________________________");
  return lines;
}

export function buildPacketReadiness(packet: PacketState): PacketReadiness {
  const requiredIssues: ReadinessIssue[] = [];
  const recommendedIssues: ReadinessIssue[] = [];

  addIssue(requiredIssues, !hasText(packet.household.principalFullName), {
    stepId: "household",
    label: "Principal full legal name",
    detail: "Add the exact legal name of the person whose estate packet is being prepared.",
    severity: "required",
  });
  addIssue(requiredIssues, !hasText(packet.household.jurisdictionState), {
    stepId: "household",
    label: "Jurisdiction state",
    detail: "Choose the state whose execution rules the packet must follow.",
    severity: "required",
  });
  addIssue(requiredIssues, !hasText(packet.household.addressLine1), {
    stepId: "household",
    label: "Street address",
    detail: "Add the principal address used for the packet and future attorney review.",
    severity: "required",
  });
  addIssue(requiredIssues, !hasText(packet.household.city) || !hasText(packet.household.state), {
    stepId: "household",
    label: "City and state",
    detail: "Complete the jurisdictional address details before final export.",
    severity: "required",
  });
  addIssue(requiredIssues, !hasText(packet.household.postalCode), {
    stepId: "household",
    label: "Postal code",
    detail: "Finish the principal mailing address.",
    severity: "required",
  });
  addIssue(requiredIssues, !hasText(packet.people.executor.fullName), {
    stepId: "household",
    label: "Executor / personal representative",
    detail: "Name the primary person who handles the estate.",
    severity: "required",
  });
  addIssue(requiredIssues, !hasText(packet.will.primaryBeneficiary), {
    stepId: "will",
    label: "Primary beneficiary",
    detail: "The will should not be finalized without a named primary beneficiary or estate plan direction.",
    severity: "required",
  });
  addIssue(requiredIssues, !hasText(packet.people.primaryHealthAgent.fullName), {
    stepId: "healthCare",
    label: "Primary health care agent",
    detail: "Name the main health-care proxy before finalizing the directive.",
    severity: "required",
  });
  addIssue(requiredIssues, !hasText(packet.healthCare.lifeSupportPreference), {
    stepId: "healthCare",
    label: "Life support preference",
    detail: "Choose a structured directive instead of leaving this open-ended.",
    severity: "required",
  });
  addIssue(requiredIssues, !hasText(packet.healthCare.cprPreference), {
    stepId: "healthCare",
    label: "CPR / resuscitation preference",
    detail: "Record a resuscitation preference before export.",
    severity: "required",
  });
  addIssue(requiredIssues, !hasText(packet.people.attorneyInFact.fullName), {
    stepId: "financialPoa",
    label: "Attorney-in-fact",
    detail: "Name the financial decision-maker for the power of attorney.",
    severity: "required",
  });
  addIssue(requiredIssues, !hasText(packet.people.primaryHipaaRecipient.fullName), {
    stepId: "hipaa",
    label: "Primary HIPAA recipient",
    detail: "Choose who may receive medical-information disclosures.",
    severity: "required",
  });
  addIssue(requiredIssues, !hasText(packet.finalWishes.remainsPreference), {
    stepId: "finalWishes",
    label: "Disposition of remains",
    detail: "Capture burial, cremation, donation, or other final remains instructions.",
    severity: "required",
  });
  addIssue(requiredIssues, !hasText(packet.signatures.notaryRequired), {
    stepId: "signatures",
    label: "Notary plan",
    detail: "State how notarization will be handled before execution.",
    severity: "required",
  });
  addIssue(requiredIssues, !hasText(packet.signatures.storagePlan), {
    stepId: "signatures",
    label: "Signed-copy storage plan",
    detail: "Define where the executed originals and backups will live.",
    severity: "required",
  });

  addIssue(recommendedIssues, !hasText(packet.will.alternateBeneficiary), {
    stepId: "will",
    label: "Alternate beneficiary",
    detail: "Add a backup beneficiary path if the primary beneficiary cannot inherit.",
    severity: "recommended",
  });
  addIssue(recommendedIssues, !hasText(packet.people.alternateExecutor.fullName), {
    stepId: "household",
    label: "Alternate executor",
    detail: "A backup estate representative reduces handoff risk.",
    severity: "recommended",
  });
  addIssue(recommendedIssues, !hasText(packet.people.alternateHealthAgent.fullName), {
    stepId: "healthCare",
    label: "Alternate health care agent",
    detail: "Add a backup medical proxy in case the primary agent is unavailable.",
    severity: "recommended",
  });
  addIssue(recommendedIssues, !hasText(packet.people.successorTrustee.fullName), {
    stepId: "trust",
    label: "Successor trustee",
    detail: "Name the person who would step in if the trust is used.",
    severity: "recommended",
  });
  addIssue(
    recommendedIssues,
    hasText(packet.household.dependentNotes) && !hasText(packet.people.guardian.fullName),
    {
      stepId: "household",
      label: "Guardian for dependents",
      detail: "You recorded dependent notes but did not name a guardian.",
      severity: "recommended",
    },
  );
  addIssue(
    recommendedIssues,
    !packet.assets.some((asset) => hasText(asset.description)),
    {
      stepId: "beneficiaries",
      label: "Asset inventory",
      detail: "List at least the major assets that drive trust funding or specific bequests.",
      severity: "recommended",
    },
  );
  addIssue(
    recommendedIssues,
    !packet.beneficiaryAccounts.some((entry) => hasText(entry.institutionName)),
    {
      stepId: "beneficiaries",
      label: "Beneficiary account review",
      detail: "Track retirement, bank, or insurance accounts that pass outside the will.",
      severity: "recommended",
    },
  );
  addIssue(recommendedIssues, !hasText(packet.healthCare.organDonationPreference), {
    stepId: "healthCare",
    label: "Organ donation preference",
    detail: "This is commonly reviewed with the health-care directive.",
    severity: "recommended",
  });
  addIssue(recommendedIssues, !hasText(packet.finalWishes.funeralHome), {
    stepId: "finalWishes",
    label: "Preferred funeral home",
    detail: "Capture the preferred provider if one is already known.",
    severity: "recommended",
  });
  addIssue(recommendedIssues, !hasText(packet.signatures.attorneyReviewStatus), {
    stepId: "signatures",
    label: "Attorney review status",
    detail: "Mark whether a lawyer has reviewed the packet for the selected state.",
    severity: "recommended",
  });

  return {
    isReadyToFinalize: requiredIssues.length === 0,
    requiredIssues,
    recommendedIssues,
  };
}

export function buildJurisdictionReviewChecklist(packet: PacketState): string[] {
  const stateLabel = orBlank(packet.household.jurisdictionState, "the selected state");

  return [
    `Confirm ${stateLabel} witness requirements for wills, advance directives, and powers of attorney.`,
    `Confirm whether ${stateLabel} expects notarization, self-proving affidavits, or separate notary blocks for each document.`,
    `Confirm whether witnesses in ${stateLabel} must be disinterested, non-beneficiaries, or unrelated to the health-care agent.`,
    `Confirm whether the health-care directive language should be revised to match ${stateLabel} statutory forms or notice text.`,
    `Confirm where the signed originals, scanned copies, and emergency copies should be stored after execution.`,
  ];
}

export function buildReviewSections(packet: PacketState): ReviewSection[] {
  return [
    {
      title: "Identity and jurisdiction",
      items: [
        `Principal: ${principal(packet)}`,
        `Jurisdiction state: ${orBlank(packet.household.jurisdictionState)}`,
        `Address: ${orBlank(packet.household.addressLine1)}, ${orBlank(packet.household.city)}, ${orBlank(
          packet.household.state,
        )} ${orBlank(packet.household.postalCode)}`,
      ],
    },
    {
      title: "Decision-makers",
      items: [
        `Executor: ${personLabel(packet, "executor")}`,
        `Health care agent: ${personLabel(packet, "primaryHealthAgent")}`,
        `Attorney-in-fact: ${personLabel(packet, "attorneyInFact")}`,
        `HIPAA recipient: ${personLabel(packet, "primaryHipaaRecipient")}`,
      ],
    },
    {
      title: "Medical and final-wishes directives",
      items: [
        `Life support: ${orBlank(packet.healthCare.lifeSupportPreference)}`,
        `CPR / resuscitation: ${orBlank(packet.healthCare.cprPreference)}`,
        `Organ donation: ${orBlank(packet.healthCare.organDonationPreference, "Not yet selected")}`,
        `Disposition of remains: ${orBlank(packet.finalWishes.remainsPreference)}`,
        `Digital vault: ${orBlank(packet.finalWishes.digitalVaultLocation, "Not yet recorded")}`,
      ],
    },
    {
      title: "Execution handoff",
      items: [
        `Witness count: ${orBlank(packet.signatures.witnessCount)}`,
        `Notary plan: ${orBlank(packet.signatures.notaryRequired)}`,
        `Storage plan: ${orBlank(packet.signatures.storagePlan)}`,
        `Attorney review status: ${orBlank(packet.signatures.attorneyReviewStatus, "Not yet noted")}`,
      ],
    },
  ];
}

export function buildPrintableDocuments(packet: PacketState): PrintableDocument[] {
  const readiness = buildPacketReadiness(packet);
  const principalName = principal(packet);
  const hometown = [packet.household.city, packet.household.state]
    .filter(hasText)
    .join(", ");
  const requiredReadinessLines = readiness.requiredIssues.length
    ? readiness.requiredIssues.map(formatIssue)
    : ["No required blockers are currently flagged."]
  const reviewChecklist = buildJurisdictionReviewChecklist(packet);

  return [
    {
      id: "cover-sheet",
      title: packet.household.packetTitle || "Estate Planning Packet",
      subtitle: "QiLegacy Questionnaire Output",
      paragraphs: [
        `Prepared for ${principalName}${hometown ? ` of ${hometown}` : ""}.`,
        readiness.isReadyToFinalize
          ? "Required questionnaire blockers have been cleared. This packet is ready for attorney and state-law execution review."
          : `This packet still has ${readiness.requiredIssues.length} required item(s) to resolve before it should be treated as a final signing packet.`,
        `Last updated: ${orBlank(packet.lastUpdatedAt, "Not yet saved")}.`,
      ],
      bullets: [
        "Last Will and Testament",
        "Readiness Review and State-Law Checklist",
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
      id: "readiness-summary",
      title: "Readiness Review and State-Law Checklist",
      subtitle: "Review Before Execution",
      paragraphs: [
        readiness.isReadyToFinalize
          ? "No required blockers are currently flagged in the questionnaire."
          : "Resolve the required blockers below before relying on this packet as the final signing set.",
        `Jurisdiction selected: ${orBlank(packet.household.jurisdictionState)}.`,
        "Even after the questionnaire is complete, this packet still needs attorney and state-specific execution review before signing.",
      ],
      checklistItems: requiredReadinessLines,
      bullets: [
        ...reviewChecklist,
        ...readiness.recommendedIssues.map((issue) => `Follow-up: ${formatIssue(issue)}`),
      ],
      footerNote: "Use this page as the print-time red-line review sheet.",
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
      signatureLines: buildSignatureLines(packet),
      footerNote: "Collect signatures only after confirming state-specific execution rules.",
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
    export: "readiness-summary",
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
      ].filter(hasText).length,
      3,
    ],
    will: [
      [
        packet.will.primaryBeneficiary,
        packet.people.executor.fullName,
        packet.will.taxAndExpenseInstructions,
      ].filter(hasText).length,
      3,
    ],
    healthCare: [
      [
        packet.people.primaryHealthAgent.fullName,
        packet.healthCare.lifeSupportPreference,
        packet.healthCare.cprPreference,
      ].filter(hasText).length,
      3,
    ],
    financialPoa: [
      [
        packet.people.attorneyInFact.fullName,
        packet.financialPoa.effectiveDate,
        packet.financialPoa.powersGranted,
      ].filter(hasText).length,
      3,
    ],
    hipaa: [
      [
        packet.people.primaryHipaaRecipient.fullName,
        packet.hipaa.releaseScope,
        packet.hipaa.expirationRule,
      ].filter(hasText).length,
      3,
    ],
    trust: [
      [
        packet.people.successorTrustee.fullName,
        packet.trust.trustEnabled,
        packet.trust.trustPurpose,
      ].filter(hasText).length,
      3,
    ],
    beneficiaries: [
      [
        packet.assets.some((asset) => hasText(asset.description)) ? "1" : "",
        packet.beneficiaryAccounts.some((entry) => hasText(entry.institutionName)) ? "1" : "",
        packet.will.alternateBeneficiary,
      ].filter(hasText).length,
      3,
    ],
    finalWishes: [
      [
        packet.finalWishes.remainsPreference,
        packet.finalWishes.personalMessage,
        packet.finalWishes.digitalVaultLocation,
      ].filter(hasText).length,
      3,
    ],
    signatures: [
      [
        packet.signatures.witnessCount,
        packet.signatures.notaryRequired,
        packet.signatures.storagePlan,
      ].filter(hasText).length,
      3,
    ],
    export: [buildPacketReadiness(packet).isReadyToFinalize ? 1 : 0, 1],
  };

  return Object.fromEntries(
    Object.entries(counts).map(([key, [filled, total]]) => [
      key,
      Math.round((filled / total) * 100),
    ]),
  ) as Record<StepId, number>;
}
