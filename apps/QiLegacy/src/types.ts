export type StepId =
  | "overview"
  | "household"
  | "will"
  | "healthCare"
  | "financialPoa"
  | "hipaa"
  | "trust"
  | "beneficiaries"
  | "finalWishes"
  | "signatures"
  | "export";

export type PersonRoleKey =
  | "executor"
  | "alternateExecutor"
  | "primaryHealthAgent"
  | "alternateHealthAgent"
  | "attorneyInFact"
  | "successorTrustee"
  | "guardian"
  | "primaryHipaaRecipient";

export type PersonRecord = {
  fullName: string;
  relationship: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
};

export type AssetRecord = {
  id: string;
  category: string;
  description: string;
  locationHint: string;
  intendedRecipient: string;
  placeInTrust: boolean;
  notes: string;
};

export type BeneficiaryAccountRecord = {
  id: string;
  institutionName: string;
  accountLabel: string;
  accountType: string;
  primaryBeneficiary: string;
  contingentBeneficiary: string;
  percentageNotes: string;
  reviewedOn: string;
};

export type HouseholdProfile = {
  packetTitle: string;
  jurisdictionState: string;
  principalFullName: string;
  preferredName: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  familyNotes: string;
  dependentNotes: string;
};

export type WillAnswers = {
  primaryBeneficiary: string;
  alternateBeneficiary: string;
  bequestNotes: string;
  taxAndExpenseInstructions: string;
  guardianshipNotes: string;
  funeralReference: string;
};

export type HealthCareAnswers = {
  lifeSupportPreference: string;
  cprPreference: string;
  feedingTubePreference: string;
  comfortCarePreference: string;
  organDonationPreference: string;
  autopsyPreference: string;
  specialMedicalInstructions: string;
};

export type FinancialPoaAnswers = {
  effectiveDate: string;
  powersGranted: string;
  benefitsAuthority: string;
  propertyAuthority: string;
  specialLimits: string;
};

export type HipaaAnswers = {
  releaseScope: string;
  expirationRule: string;
  additionalRecipients: string;
};

export type TrustAnswers = {
  trustEnabled: string;
  trustName: string;
  trustPurpose: string;
  scheduleANotes: string;
  revocationTerms: string;
};

export type FinalWishesAnswers = {
  remainsPreference: string;
  funeralHome: string;
  burialLocation: string;
  memorialMusic: string;
  memorialReadings: string;
  memorialTheme: string;
  personalMessage: string;
  digitalVaultLocation: string;
  digitalExecutorNotes: string;
};

export type SignatureAnswers = {
  witnessCount: string;
  notaryRequired: string;
  storagePlan: string;
  attorneyReviewStatus: string;
  finalChecklist: string;
};

export type PacketState = {
  household: HouseholdProfile;
  people: Record<PersonRoleKey, PersonRecord>;
  assets: AssetRecord[];
  beneficiaryAccounts: BeneficiaryAccountRecord[];
  will: WillAnswers;
  healthCare: HealthCareAnswers;
  financialPoa: FinancialPoaAnswers;
  hipaa: HipaaAnswers;
  trust: TrustAnswers;
  finalWishes: FinalWishesAnswers;
  signatures: SignatureAnswers;
  lastUpdatedAt: string;
};

export type StepDefinition = {
  id: StepId;
  label: string;
  shortLabel: string;
  description: string;
};

export type PrintableDocument = {
  id: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  bullets?: string[];
  checklistItems?: string[];
  signatureLines?: string[];
  footerNote?: string;
};

export type ReadinessSeverity = "required" | "recommended";

export type ReadinessIssue = {
  stepId: StepId;
  label: string;
  detail: string;
  severity: ReadinessSeverity;
};

export type PacketReadiness = {
  isReadyToFinalize: boolean;
  requiredIssues: ReadinessIssue[];
  recommendedIssues: ReadinessIssue[];
};

export type ReviewSection = {
  title: string;
  items: string[];
};
