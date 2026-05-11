import type {
  PacketState,
  PersonRecord,
  StepDefinition,
} from "../types";

function createPersonRecord(): PersonRecord {
  return {
    fullName: "",
    relationship: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    email: "",
  };
}

export const steps: StepDefinition[] = [
  {
    id: "overview",
    label: "Overview",
    shortLabel: "Overview",
    description: "Packet progress, source scope, and the live document-kit preview."
  },
  {
    id: "household",
    label: "Household",
    shortLabel: "Household",
    description: "Principal identity, address, dependents, and key appointed people."
  },
  {
    id: "will",
    label: "Will",
    shortLabel: "Will",
    description: "Executor, alternate beneficiary, distribution notes, and guardianship intent."
  },
  {
    id: "healthCare",
    label: "Health Care",
    shortLabel: "Health",
    description: "Living will decisions, medical proxy instructions, and end-of-life preferences."
  },
  {
    id: "financialPoa",
    label: "Financial POA",
    shortLabel: "POA",
    description: "Attorney-in-fact powers, limits, and financial-management authority."
  },
  {
    id: "hipaa",
    label: "HIPAA",
    shortLabel: "HIPAA",
    description: "Medical-information release scope, recipients, and expiration."
  },
  {
    id: "trust",
    label: "Trust",
    shortLabel: "Trust",
    description: "Optional revocable trust terms, successor trustee, and trust-property notes."
  },
  {
    id: "beneficiaries",
    label: "Beneficiaries",
    shortLabel: "Beneficiaries",
    description: "Outside-the-will account designations, asset inventory, and transfer intent."
  },
  {
    id: "finalWishes",
    label: "Final Wishes",
    shortLabel: "Wishes",
    description: "Remains, memorial preferences, personal notes, and digital-estate instructions."
  },
  {
    id: "signatures",
    label: "Signatures",
    shortLabel: "Signatures",
    description: "Witnesses, notary expectations, storage plan, and final execution checklist."
  },
  {
    id: "export",
    label: "Export Kit",
    shortLabel: "Export",
    description: "Printable packet, JSON backup, and handoff notes for legal review."
  },
];

export const emptyPacket: PacketState = {
  household: {
    packetTitle: "Estate Planning Packet",
    jurisdictionState: "",
    principalFullName: "",
    preferredName: "",
    dateOfBirth: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    familyNotes: "",
    dependentNotes: "",
  },
  people: {
    executor: createPersonRecord(),
    alternateExecutor: createPersonRecord(),
    primaryHealthAgent: createPersonRecord(),
    alternateHealthAgent: createPersonRecord(),
    attorneyInFact: createPersonRecord(),
    successorTrustee: createPersonRecord(),
    guardian: createPersonRecord(),
    primaryHipaaRecipient: createPersonRecord(),
  },
  assets: [
    {
      id: "asset-home",
      category: "Real Property",
      description: "",
      locationHint: "",
      intendedRecipient: "",
      placeInTrust: true,
      notes: "",
    },
  ],
  beneficiaryAccounts: [
    {
      id: "beneficiary-401k",
      institutionName: "",
      accountLabel: "",
      accountType: "Retirement",
      primaryBeneficiary: "",
      contingentBeneficiary: "",
      percentageNotes: "",
      reviewedOn: "",
    },
  ],
  will: {
    primaryBeneficiary: "",
    alternateBeneficiary: "",
    bequestNotes: "",
    taxAndExpenseInstructions: "All debts, taxes, and final expenses should be paid before distribution.",
    guardianshipNotes: "",
    funeralReference: "",
  },
  healthCare: {
    lifeSupportPreference: "",
    cprPreference: "",
    feedingTubePreference: "",
    comfortCarePreference: "",
    organDonationPreference: "",
    autopsyPreference: "",
    specialMedicalInstructions: "",
  },
  financialPoa: {
    effectiveDate: "Immediately upon signing",
    powersGranted:
      "Manage bank accounts, investments, taxes, insurance, property transactions, and advisor engagement.",
    benefitsAuthority: "Social Security, Medicare, and other public or private benefits as needed.",
    propertyAuthority: "Buy, sell, lease, transfer, and maintain real and personal property.",
    specialLimits: "",
  },
  hipaa: {
    releaseScope: "Medical history, treatment details, provider discussions, and billing information.",
    expirationRule: "Remains effective until revoked in writing or until death.",
    additionalRecipients: "",
  },
  trust: {
    trustEnabled: "Optional but recommended when probate avoidance matters.",
    trustName: "",
    trustPurpose: "Hold titled assets privately and allow successor administration after incapacity or death.",
    scheduleANotes: "",
    revocationTerms: "Grantor may amend or revoke the trust at any time during life.",
  },
  finalWishes: {
    remainsPreference: "",
    funeralHome: "",
    burialLocation: "",
    memorialMusic: "",
    memorialReadings: "",
    memorialTheme: "",
    personalMessage: "",
    digitalVaultLocation: "",
    digitalExecutorNotes: "",
  },
  signatures: {
    witnessCount: "2",
    notaryRequired: "Review by state before execution",
    storagePlan: "Keep one signed copy at home, one with the primary agent, and one in secure cloud storage.",
    attorneyReviewStatus: "",
    finalChecklist: "Confirm state-specific execution rules, witness order, and notarization before signing.",
  },
  lastUpdatedAt: "",
};
