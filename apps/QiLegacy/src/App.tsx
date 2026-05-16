import { startTransition, useEffect, useRef, useState } from "react";
import { emptyPacket, steps } from "./data/blueprint";
import {
  buildActivePreview,
  buildJurisdictionReviewChecklist,
  buildPacketReadiness,
  buildPrintableDocuments,
  buildReviewSections,
  calculateSectionCompletion,
} from "./lib/documents";
import {
  downloadPacketBackup,
  importPacketBackup,
  loadPacket,
  savePacket,
} from "./lib/storage";
import type {
  AssetRecord,
  BeneficiaryAccountRecord,
  PacketState,
  PersonRecord,
  PersonRoleKey,
  ReadinessIssue,
  StepDefinition,
  StepId,
} from "./types";

type ChoiceOption = {
  label: string;
  value: string;
};

type NoticeState = {
  tone: "info" | "success" | "error";
  text: string;
};

const roleLabels: Record<PersonRoleKey, string> = {
  executor: "Executor / Personal Representative",
  alternateExecutor: "Alternate Executor",
  primaryHealthAgent: "Primary Health Care Agent",
  alternateHealthAgent: "Alternate Health Care Agent",
  attorneyInFact: "Attorney-in-Fact",
  successorTrustee: "Successor Trustee",
  guardian: "Guardian for Minor Dependents",
  primaryHipaaRecipient: "Primary HIPAA Recipient",
};

const remainsOptions: ChoiceOption[] = [
  { label: "Select remains instructions", value: "" },
  { label: "Burial", value: "Burial" },
  { label: "Cremation", value: "Cremation" },
  { label: "Donation to science", value: "Donation to science" },
  { label: "Green burial", value: "Green burial" },
  { label: "Custom written instructions", value: "Custom written instructions" },
];

const lifeSupportOptions: ChoiceOption[] = [
  { label: "Select life support preference", value: "" },
  {
    label: "Continue only if meaningful recovery is likely",
    value: "Continue only if meaningful recovery to an interactive quality of life is likely.",
  },
  {
    label: "Short-term trial, then comfort care if no improvement",
    value: "Allow a short-term trial of life support, then shift to comfort-focused care if recovery is not occurring.",
  },
  {
    label: "Comfort-focused care only",
    value: "Prefer comfort-focused care and decline prolonged life-sustaining treatment when recovery is unlikely.",
  },
  {
    label: "Follow agent and physician guidance with written limits",
    value: "Allow the health-care agent and treating physician to apply written limits based on the medical situation.",
  },
];

const cprOptions: ChoiceOption[] = [
  { label: "Select CPR preference", value: "" },
  { label: "Attempt CPR unless physician advises otherwise", value: "Attempt CPR unless the treating physician advises otherwise." },
  { label: "Do not resuscitate / DNR", value: "Do not attempt resuscitation (DNR)." },
  { label: "Case-by-case with agent guidance", value: "Use case-by-case guidance from the health-care agent and physician." },
];

const feedingTubeOptions: ChoiceOption[] = [
  { label: "Select feeding tube preference", value: "" },
  { label: "Allow short-term only", value: "Allow feeding tubes only for short-term stabilization or recovery." },
  { label: "Allow if recovery is likely", value: "Allow feeding tubes when recovery to an acceptable quality of life is likely." },
  { label: "Decline artificial feeding", value: "Decline artificial feeding when recovery is unlikely." },
  { label: "Agent decides with physician", value: "Allow the health-care agent to decide with the physician based on the situation." },
];

const organDonationOptions: ChoiceOption[] = [
  { label: "Select organ donation preference", value: "" },
  { label: "Donate any medically suitable organs", value: "Donate any medically suitable organs and tissue." },
  { label: "Donate limited organs or tissue only", value: "Donate only the organs or tissue specifically approved by the principal or family." },
  { label: "Do not donate organs or tissue", value: "Do not donate organs or tissue." },
  { label: "Family decides at time of death", value: "Allow the family and health-care agent to decide at the time of death." },
];

const autopsyOptions: ChoiceOption[] = [
  { label: "Select autopsy preference", value: "" },
  { label: "Allow if medically or legally necessary", value: "Allow an autopsy when medically or legally necessary." },
  { label: "Allow with family approval", value: "Allow an autopsy only with family or agent approval unless required by law." },
  { label: "Decline autopsy unless required by law", value: "Decline an autopsy unless required by law." },
];

const trustStatusOptions: ChoiceOption[] = [
  { label: "Select trust status", value: "" },
  { label: "Optional but recommended", value: "Optional but recommended when probate avoidance matters." },
  { label: "Yes, plan to use a living trust", value: "Yes, the estate plan should include a revocable living trust." },
  { label: "No, not part of this packet", value: "No, a living trust is not part of this packet at this time." },
];

const witnessCountOptions: ChoiceOption[] = [
  { label: "Select witness count", value: "" },
  { label: "1 witness", value: "1" },
  { label: "2 witnesses", value: "2" },
  { label: "3 witnesses", value: "3" },
  { label: "Check state rules first", value: "Confirm by state before signing" },
];

const notaryOptions: ChoiceOption[] = [
  { label: "Select notary plan", value: "" },
  { label: "Notary required for some documents", value: "Review by state before execution" },
  { label: "Notary scheduled for final signing", value: "Notary scheduled for the final signing session." },
  { label: "Attorney will confirm notary needs", value: "Attorney review will confirm which documents need notarization." },
  { label: "Witness-only plan pending state review", value: "Witness-only execution may be possible, pending state review." },
];

function App() {
  const [activeStep, setActiveStep] = useState<StepId>("overview");
  const [packet, setPacket] = useState<PacketState>(() => loadPacket());
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPacket((current) => ({
      ...current,
      lastUpdatedAt: new Date().toLocaleString(),
    }));
  }, []);

  useEffect(() => {
    savePacket(packet);
  }, [packet]);

  const completion = calculateSectionCompletion(packet);
  const readiness = buildPacketReadiness(packet);
  const printableDocuments = buildPrintableDocuments(packet);
  const activePreview = buildActivePreview(packet, activeStep);
  const reviewSections = buildReviewSections(packet);
  const jurisdictionChecklist = buildJurisdictionReviewChecklist(packet);
  const overallCompletion = Math.round(
    Object.values(completion).reduce((sum, value) => sum + value, 0) /
      Object.keys(completion).length,
  );

  function stampPacket(next: PacketState): PacketState {
    return {
      ...next,
      lastUpdatedAt: new Date().toLocaleString(),
    };
  }

  function applyPacketUpdate(updater: (current: PacketState) => PacketState) {
    setPacket((current) => stampPacket(updater(current)));
  }

  function goToStep(stepId: StepId) {
    startTransition(() => setActiveStep(stepId));
  }

  function updateHousehold<K extends keyof PacketState["household"]>(
    key: K,
    value: PacketState["household"][K],
  ) {
    applyPacketUpdate((current) => ({
      ...current,
      household: {
        ...current.household,
        [key]: value,
      },
    }));
  }

  function updateRolePerson(
    role: PersonRoleKey,
    key: keyof PersonRecord,
    value: string,
  ) {
    applyPacketUpdate((current) => ({
      ...current,
      people: {
        ...current.people,
        [role]: {
          ...current.people[role],
          [key]: value,
        },
      },
    }));
  }

  function updateSection<
    SectionKey extends keyof Pick<
      PacketState,
      "will" | "healthCare" | "financialPoa" | "hipaa" | "trust" | "finalWishes" | "signatures"
    >,
    ValueKey extends keyof PacketState[SectionKey],
  >(section: SectionKey, key: ValueKey, value: PacketState[SectionKey][ValueKey]) {
    applyPacketUpdate((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  }

  function updateAsset(id: string, key: keyof AssetRecord, value: string | boolean) {
    applyPacketUpdate((current) => ({
      ...current,
      assets: current.assets.map((asset) =>
        asset.id === id ? { ...asset, [key]: value } : asset,
      ),
    }));
  }

  function addAsset() {
    applyPacketUpdate((current) => ({
      ...current,
      assets: [
        ...current.assets,
        {
          id: `asset-${crypto.randomUUID()}`,
          category: "",
          description: "",
          locationHint: "",
          intendedRecipient: "",
          placeInTrust: false,
          notes: "",
        },
      ],
    }));
  }

  function removeAsset(id: string) {
    applyPacketUpdate((current) => ({
      ...current,
      assets: current.assets.filter((asset) => asset.id !== id),
    }));
  }

  function updateBeneficiary(
    id: string,
    key: keyof BeneficiaryAccountRecord,
    value: string,
  ) {
    applyPacketUpdate((current) => ({
      ...current,
      beneficiaryAccounts: current.beneficiaryAccounts.map((entry) =>
        entry.id === id ? { ...entry, [key]: value } : entry,
      ),
    }));
  }

  function addBeneficiary() {
    applyPacketUpdate((current) => ({
      ...current,
      beneficiaryAccounts: [
        ...current.beneficiaryAccounts,
        {
          id: `beneficiary-${crypto.randomUUID()}`,
          institutionName: "",
          accountLabel: "",
          accountType: "",
          primaryBeneficiary: "",
          contingentBeneficiary: "",
          percentageNotes: "",
          reviewedOn: "",
        },
      ],
    }));
  }

  function removeBeneficiary(id: string) {
    applyPacketUpdate((current) => ({
      ...current,
      beneficiaryAccounts: current.beneficiaryAccounts.filter((entry) => entry.id !== id),
    }));
  }

  function resetPacket() {
    setPacket(stampPacket(emptyPacket));
    setNotice({
      tone: "info",
      text: "The questionnaire was reset. Import a backup if you meant to restore a prior draft.",
    });
    goToStep("overview");
  }

  async function handleImportChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsImporting(true);
    setNotice({
      tone: "info",
      text: `Importing ${file.name}. The restored packet will replace the current in-browser draft.`,
    });

    try {
      const importedPacket = await importPacketBackup(file);
      setPacket(stampPacket(importedPacket));
      setNotice({
        tone: "success",
        text: `Imported ${file.name}. Review the restored packet before final export.`,
      });
      goToStep("export");
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "The backup file could not be imported.",
      });
    } finally {
      setIsImporting(false);
    }
  }

  function triggerImport() {
    importInputRef.current?.click();
  }

  function StepNavItem({ step }: { step: StepDefinition }) {
    const isActive = step.id === activeStep;

    return (
      <button
        className={`step-nav-item${isActive ? " is-active" : ""}`}
        type="button"
        onClick={() => {
          goToStep(step.id);
        }}
      >
        <span className="step-nav-title">{step.label}</span>
        <span className="step-nav-meta">{completion[step.id]}%</span>
        <span className="step-nav-description">{step.description}</span>
      </button>
    );
  }

  function Field({
    label,
    value,
    onChange,
    type = "text",
    placeholder = "",
  }: {
    label: string;
    value: string;
    onChange: (next: string) => void;
    type?: "text" | "date";
    placeholder?: string;
  }) {
    return (
      <label className="field">
        <span>{label}</span>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    );
  }

  function SelectField({
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: string;
    onChange: (next: string) => void;
    options: ChoiceOption[];
  }) {
    return (
      <label className="field">
        <span>{label}</span>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  function TextArea({
    label,
    value,
    onChange,
    placeholder = "",
  }: {
    label: string;
    value: string;
    onChange: (next: string) => void;
    placeholder?: string;
  }) {
    return (
      <label className="field field-textarea">
        <span>{label}</span>
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    );
  }

  function PersonCard({ role }: { role: PersonRoleKey }) {
    const person = packet.people[role];

    return (
      <section className="editor-card">
        <div className="section-heading">
          <div>
            <h3>{roleLabels[role]}</h3>
            <p>Capture the person who fills this role in the final packet.</p>
          </div>
        </div>
        <div className="grid two-up">
          <Field
            label="Full legal name"
            value={person.fullName}
            onChange={(value) => updateRolePerson(role, "fullName", value)}
          />
          <Field
            label="Relationship"
            value={person.relationship}
            onChange={(value) => updateRolePerson(role, "relationship", value)}
          />
          <Field
            label="Address line 1"
            value={person.addressLine1}
            onChange={(value) => updateRolePerson(role, "addressLine1", value)}
          />
          <Field
            label="Address line 2"
            value={person.addressLine2}
            onChange={(value) => updateRolePerson(role, "addressLine2", value)}
          />
          <Field
            label="City"
            value={person.city}
            onChange={(value) => updateRolePerson(role, "city", value)}
          />
          <Field
            label="State"
            value={person.state}
            onChange={(value) => updateRolePerson(role, "state", value)}
          />
          <Field
            label="Postal code"
            value={person.postalCode}
            onChange={(value) => updateRolePerson(role, "postalCode", value)}
          />
          <Field
            label="Phone"
            value={person.phone}
            onChange={(value) => updateRolePerson(role, "phone", value)}
          />
          <Field
            label="Email"
            value={person.email}
            onChange={(value) => updateRolePerson(role, "email", value)}
          />
        </div>
      </section>
    );
  }

  function IssueList({
    title,
    issues,
    emptyText,
  }: {
    title: string;
    issues: ReadinessIssue[];
    emptyText: string;
  }) {
    return (
      <div className="editor-card inset">
        <h3>{title}</h3>
        {issues.length ? (
          <ul className="issue-list">
            {issues.map((issue) => (
              <li key={`${issue.stepId}-${issue.label}`}>
                <button type="button" className="issue-link" onClick={() => goToStep(issue.stepId)}>
                  {issue.label}
                </button>
                <span>{issue.detail}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>{emptyText}</p>
        )}
      </div>
    );
  }

  function renderOverview() {
    return (
      <div className="stack">
        <section className="hero-card">
          <div>
            <p className="eyebrow">Estate Packet Status</p>
            <h1>{packet.household.packetTitle}</h1>
            <p className="hero-copy">
              This app turns the legacy QiLegacy document bundle into a guided,
              editable packet with live preview, red-line review, and printable PDF output.
            </p>
          </div>
          <div className="hero-metrics">
            <div className="metric">
              <span>Packet completion</span>
              <strong>{overallCompletion}%</strong>
            </div>
            <div className="metric">
              <span>Required blockers</span>
              <strong>{readiness.requiredIssues.length}</strong>
            </div>
            <div className="metric">
              <span>Storage mode</span>
              <strong>Client-side autosave</strong>
            </div>
          </div>
        </section>

        <section className="data-warning" aria-label="Draft retention warning">
          <strong>Important:</strong> This draft is saved only in this browser on this device.
          Import the JSON backup if you return later on the same machine, and always save the PDF
          packet plus the JSON backup before switching devices or clearing browser data.
        </section>

        <section
          className={`status-panel${readiness.isReadyToFinalize ? " is-success" : " is-warning"}`}
        >
          <strong>
            {readiness.isReadyToFinalize
              ? "Required export blockers are clear."
              : `${readiness.requiredIssues.length} required item(s) still block final export.`}
          </strong>
          <p>
            {readiness.isReadyToFinalize
              ? "Use the Export Kit step for final review, state-law confirmation, and PDF generation."
              : "Open Export Kit to review the blocker list, state-law checklist, and read-only packet summary."}
          </p>
        </section>

        <section className="grid two-up">
          <div className="editor-card">
            <div className="section-heading">
              <div>
                <h3>Source packet mapped</h3>
                <p>The original directory resolved into these core questionnaire outputs.</p>
              </div>
            </div>
            <ul className="plain-list">
              <li>Last Will and Testament</li>
              <li>Readiness Review and State-Law Checklist</li>
              <li>Living Will and Health Care Power</li>
              <li>Durable Power of Attorney (Financial)</li>
              <li>HIPAA Authorization</li>
              <li>Revocable Living Trust</li>
              <li>Beneficiary Designations Summary</li>
              <li>Final Wishes Addendum</li>
              <li>Signature and storage checklist</li>
            </ul>
          </div>
          <div className="editor-card">
            <div className="section-heading">
              <div>
                <h3>What still needs user answers</h3>
                <p>These are the fields that usually block the final packet.</p>
              </div>
            </div>
            <ul className="plain-list">
              <li>Jurisdiction state and full legal identity details</li>
              <li>Executor, health-care agent, attorney-in-fact, and HIPAA recipient names</li>
              <li>Structured life-support and CPR directives</li>
              <li>Specific asset transfers and outside-the-will account beneficiaries</li>
              <li>Remains instructions, storage plan, and attorney review status</li>
            </ul>
          </div>
        </section>
      </div>
    );
  }

  function renderHousehold() {
    return (
      <div className="stack">
        <section className="editor-card">
          <div className="section-heading">
            <div>
              <h2>Household and Principal</h2>
              <p>Capture the person whose wishes and documents this packet represents.</p>
            </div>
          </div>
          <div className="grid two-up">
            <Field
              label="Packet title"
              value={packet.household.packetTitle}
              onChange={(value) => updateHousehold("packetTitle", value)}
            />
            <Field
              label="Jurisdiction state"
              value={packet.household.jurisdictionState}
              onChange={(value) => updateHousehold("jurisdictionState", value)}
              placeholder="Texas"
            />
            <Field
              label="Full legal name"
              value={packet.household.principalFullName}
              onChange={(value) => updateHousehold("principalFullName", value)}
            />
            <Field
              label="Preferred name"
              value={packet.household.preferredName}
              onChange={(value) => updateHousehold("preferredName", value)}
            />
            <Field
              label="Date of birth"
              type="date"
              value={packet.household.dateOfBirth}
              onChange={(value) => updateHousehold("dateOfBirth", value)}
            />
            <Field
              label="Address line 1"
              value={packet.household.addressLine1}
              onChange={(value) => updateHousehold("addressLine1", value)}
            />
            <Field
              label="Address line 2"
              value={packet.household.addressLine2}
              onChange={(value) => updateHousehold("addressLine2", value)}
            />
            <Field
              label="City"
              value={packet.household.city}
              onChange={(value) => updateHousehold("city", value)}
            />
            <Field
              label="State"
              value={packet.household.state}
              onChange={(value) => updateHousehold("state", value)}
            />
            <Field
              label="Postal code"
              value={packet.household.postalCode}
              onChange={(value) => updateHousehold("postalCode", value)}
            />
          </div>
          <div className="grid two-up">
            <TextArea
              label="Family context notes"
              value={packet.household.familyNotes}
              onChange={(value) => updateHousehold("familyNotes", value)}
              placeholder="Spouse, children, caregiving context, or family concerns."
            />
            <TextArea
              label="Dependents and guardianship notes"
              value={packet.household.dependentNotes}
              onChange={(value) => updateHousehold("dependentNotes", value)}
              placeholder="Minor children, adult dependents, special-care needs, pets, or caregiving obligations."
            />
          </div>
        </section>

        <div className="grid two-up">
          <PersonCard role="executor" />
          <PersonCard role="alternateExecutor" />
          <PersonCard role="guardian" />
          <PersonCard role="primaryHipaaRecipient" />
        </div>
      </div>
    );
  }

  function renderWill() {
    return (
      <div className="stack">
        <section className="editor-card">
          <div className="section-heading">
            <div>
              <h2>Will Instructions</h2>
              <p>Populate the roles and instructions that become the backbone of the Last Will.</p>
            </div>
          </div>
          <div className="grid two-up">
            <Field
              label="Primary beneficiary"
              value={packet.will.primaryBeneficiary}
              onChange={(value) => updateSection("will", "primaryBeneficiary", value)}
            />
            <Field
              label="Alternate beneficiary"
              value={packet.will.alternateBeneficiary}
              onChange={(value) => updateSection("will", "alternateBeneficiary", value)}
            />
          </div>
          <div className="grid two-up">
            <TextArea
              label="Specific bequests or distribution notes"
              value={packet.will.bequestNotes}
              onChange={(value) => updateSection("will", "bequestNotes", value)}
              placeholder="Real property, jewelry, vehicles, sentimental items, charitable gifts, and special instructions."
            />
            <TextArea
              label="Taxes and final expenses"
              value={packet.will.taxAndExpenseInstructions}
              onChange={(value) => updateSection("will", "taxAndExpenseInstructions", value)}
            />
            <TextArea
              label="Guardianship notes"
              value={packet.will.guardianshipNotes}
              onChange={(value) => updateSection("will", "guardianshipNotes", value)}
              placeholder="Who should care for minor dependents, adult dependents, or pets."
            />
            <TextArea
              label="Funeral reference note"
              value={packet.will.funeralReference}
              onChange={(value) => updateSection("will", "funeralReference", value)}
              placeholder="Point the will to the Final Wishes Addendum or identify any formal burial instructions."
            />
          </div>
        </section>
      </div>
    );
  }

  function renderHealthCare() {
    return (
      <div className="stack">
        <div className="grid two-up">
          <PersonCard role="primaryHealthAgent" />
          <PersonCard role="alternateHealthAgent" />
        </div>
        <section className="editor-card">
          <div className="section-heading">
            <div>
              <h2>Living Will Decisions</h2>
              <p>These answers shape the health-care directive and medical proxy instructions.</p>
            </div>
          </div>
          <div className="grid two-up">
            <SelectField
              label="Life support preference"
              value={packet.healthCare.lifeSupportPreference}
              onChange={(value) => updateSection("healthCare", "lifeSupportPreference", value)}
              options={lifeSupportOptions}
            />
            <SelectField
              label="CPR / resuscitation preference"
              value={packet.healthCare.cprPreference}
              onChange={(value) => updateSection("healthCare", "cprPreference", value)}
              options={cprOptions}
            />
            <SelectField
              label="Feeding tube preference"
              value={packet.healthCare.feedingTubePreference}
              onChange={(value) => updateSection("healthCare", "feedingTubePreference", value)}
              options={feedingTubeOptions}
            />
            <TextArea
              label="Comfort care and pain management"
              value={packet.healthCare.comfortCarePreference}
              onChange={(value) => updateSection("healthCare", "comfortCarePreference", value)}
            />
            <SelectField
              label="Organ donation preference"
              value={packet.healthCare.organDonationPreference}
              onChange={(value) => updateSection("healthCare", "organDonationPreference", value)}
              options={organDonationOptions}
            />
            <SelectField
              label="Autopsy preference"
              value={packet.healthCare.autopsyPreference}
              onChange={(value) => updateSection("healthCare", "autopsyPreference", value)}
              options={autopsyOptions}
            />
          </div>
          <TextArea
            label="Additional medical instructions"
            value={packet.healthCare.specialMedicalInstructions}
            onChange={(value) => updateSection("healthCare", "specialMedicalInstructions", value)}
            placeholder="Religious wishes, hospice preferences, preferred care setting, or physician notes to discuss."
          />
        </section>
      </div>
    );
  }

  function renderFinancialPoa() {
    return (
      <div className="stack">
        <PersonCard role="attorneyInFact" />
        <section className="editor-card">
          <div className="section-heading">
            <div>
              <h2>Financial Power of Attorney</h2>
              <p>Define the powers granted and any boundaries for the appointed agent.</p>
            </div>
          </div>
          <div className="grid two-up">
            <Field
              label="Effective date"
              value={packet.financialPoa.effectiveDate}
              onChange={(value) => updateSection("financialPoa", "effectiveDate", value)}
            />
            <TextArea
              label="Powers granted"
              value={packet.financialPoa.powersGranted}
              onChange={(value) => updateSection("financialPoa", "powersGranted", value)}
            />
            <TextArea
              label="Benefits authority"
              value={packet.financialPoa.benefitsAuthority}
              onChange={(value) => updateSection("financialPoa", "benefitsAuthority", value)}
            />
            <TextArea
              label="Property authority"
              value={packet.financialPoa.propertyAuthority}
              onChange={(value) => updateSection("financialPoa", "propertyAuthority", value)}
            />
          </div>
          <TextArea
            label="Special limits or exclusions"
            value={packet.financialPoa.specialLimits}
            onChange={(value) => updateSection("financialPoa", "specialLimits", value)}
            placeholder="Any actions the agent may not take, co-signing requirements, or timing limits."
          />
        </section>
      </div>
    );
  }

  function renderHipaa() {
    return (
      <div className="stack">
        <PersonCard role="primaryHipaaRecipient" />
        <section className="editor-card">
          <div className="section-heading">
            <div>
              <h2>HIPAA Authorization</h2>
              <p>Set the disclosure scope and any extra named recipients.</p>
            </div>
          </div>
          <div className="grid two-up">
            <TextArea
              label="Release scope"
              value={packet.hipaa.releaseScope}
              onChange={(value) => updateSection("hipaa", "releaseScope", value)}
            />
            <TextArea
              label="Expiration rule"
              value={packet.hipaa.expirationRule}
              onChange={(value) => updateSection("hipaa", "expirationRule", value)}
            />
          </div>
          <TextArea
            label="Additional recipients or restrictions"
            value={packet.hipaa.additionalRecipients}
            onChange={(value) => updateSection("hipaa", "additionalRecipients", value)}
            placeholder="Add siblings, spouse, adult children, or provider-specific restrictions as needed."
          />
        </section>
      </div>
    );
  }

  function renderTrust() {
    return (
      <div className="stack">
        <PersonCard role="successorTrustee" />
        <section className="editor-card">
          <div className="section-heading">
            <div>
              <h2>Revocable Living Trust</h2>
              <p>Optional trust language for probate avoidance and successor management.</p>
            </div>
          </div>
          <div className="grid two-up">
            <SelectField
              label="Trust status"
              value={packet.trust.trustEnabled}
              onChange={(value) => updateSection("trust", "trustEnabled", value)}
              options={trustStatusOptions}
            />
            <Field
              label="Trust name"
              value={packet.trust.trustName}
              onChange={(value) => updateSection("trust", "trustName", value)}
            />
            <TextArea
              label="Trust purpose"
              value={packet.trust.trustPurpose}
              onChange={(value) => updateSection("trust", "trustPurpose", value)}
            />
            <TextArea
              label="Revocation terms"
              value={packet.trust.revocationTerms}
              onChange={(value) => updateSection("trust", "revocationTerms", value)}
            />
          </div>
          <TextArea
            label="Schedule A property notes"
            value={packet.trust.scheduleANotes}
            onChange={(value) => updateSection("trust", "scheduleANotes", value)}
            placeholder="Record which assets should be titled into the trust and any follow-up paperwork needed."
          />
        </section>
      </div>
    );
  }

  function renderBeneficiaries() {
    return (
      <div className="stack">
        <section className="editor-card">
          <div className="section-heading">
            <div>
              <h2>Asset Inventory</h2>
              <p>Capture the assets that drive will language, trust funding, and outside-account review.</p>
            </div>
            <button className="secondary-button" type="button" onClick={addAsset}>
              Add asset
            </button>
          </div>
          <div className="stack compact">
            {packet.assets.map((asset) => (
              <div className="record-card" key={asset.id}>
                <div className="record-header">
                  <strong>{asset.description || "New asset"}</strong>
                  <button type="button" className="ghost-button" onClick={() => removeAsset(asset.id)}>
                    Remove
                  </button>
                </div>
                <div className="grid two-up">
                  <Field
                    label="Category"
                    value={asset.category}
                    onChange={(value) => updateAsset(asset.id, "category", value)}
                  />
                  <Field
                    label="Description"
                    value={asset.description}
                    onChange={(value) => updateAsset(asset.id, "description", value)}
                  />
                  <Field
                    label="Location / institution"
                    value={asset.locationHint}
                    onChange={(value) => updateAsset(asset.id, "locationHint", value)}
                  />
                  <Field
                    label="Intended recipient"
                    value={asset.intendedRecipient}
                    onChange={(value) => updateAsset(asset.id, "intendedRecipient", value)}
                  />
                </div>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={asset.placeInTrust}
                    onChange={(event) => updateAsset(asset.id, "placeInTrust", event.target.checked)}
                  />
                  <span>Flag this asset for trust funding or Schedule A review</span>
                </label>
                <TextArea
                  label="Notes"
                  value={asset.notes}
                  onChange={(value) => updateAsset(asset.id, "notes", value)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="editor-card">
          <div className="section-heading">
            <div>
              <h2>Beneficiary Designation Summary</h2>
              <p>Track retirement, bank, insurance, and payable-on-death accounts that pass outside the will.</p>
            </div>
            <button className="secondary-button" type="button" onClick={addBeneficiary}>
              Add account
            </button>
          </div>
          <div className="stack compact">
            {packet.beneficiaryAccounts.map((entry) => (
              <div className="record-card" key={entry.id}>
                <div className="record-header">
                  <strong>{entry.accountLabel || "New beneficiary account"}</strong>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => removeBeneficiary(entry.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="grid two-up">
                  <Field
                    label="Institution"
                    value={entry.institutionName}
                    onChange={(value) => updateBeneficiary(entry.id, "institutionName", value)}
                  />
                  <Field
                    label="Account label"
                    value={entry.accountLabel}
                    onChange={(value) => updateBeneficiary(entry.id, "accountLabel", value)}
                  />
                  <Field
                    label="Account type"
                    value={entry.accountType}
                    onChange={(value) => updateBeneficiary(entry.id, "accountType", value)}
                  />
                  <Field
                    label="Reviewed on"
                    type="date"
                    value={entry.reviewedOn}
                    onChange={(value) => updateBeneficiary(entry.id, "reviewedOn", value)}
                  />
                  <Field
                    label="Primary beneficiary"
                    value={entry.primaryBeneficiary}
                    onChange={(value) => updateBeneficiary(entry.id, "primaryBeneficiary", value)}
                  />
                  <Field
                    label="Contingent beneficiary"
                    value={entry.contingentBeneficiary}
                    onChange={(value) => updateBeneficiary(entry.id, "contingentBeneficiary", value)}
                  />
                </div>
                <TextArea
                  label="Percentage / split notes"
                  value={entry.percentageNotes}
                  onChange={(value) => updateBeneficiary(entry.id, "percentageNotes", value)}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  function renderFinalWishes() {
    return (
      <div className="stack">
        <section className="editor-card">
          <div className="section-heading">
            <div>
              <h2>Final Wishes Addendum</h2>
              <p>Capture the human side of the packet: service, remembrance, and digital-estate guidance.</p>
            </div>
          </div>
          <div className="grid two-up">
            <SelectField
              label="Disposition of remains"
              value={packet.finalWishes.remainsPreference}
              onChange={(value) => updateSection("finalWishes", "remainsPreference", value)}
              options={remainsOptions}
            />
            <Field
              label="Preferred funeral home"
              value={packet.finalWishes.funeralHome}
              onChange={(value) => updateSection("finalWishes", "funeralHome", value)}
            />
            <Field
              label="Burial / memorial location"
              value={packet.finalWishes.burialLocation}
              onChange={(value) => updateSection("finalWishes", "burialLocation", value)}
            />
            <Field
              label="Memorial theme"
              value={packet.finalWishes.memorialTheme}
              onChange={(value) => updateSection("finalWishes", "memorialTheme", value)}
            />
          </div>
          <div className="grid two-up">
            <TextArea
              label="Songs or music"
              value={packet.finalWishes.memorialMusic}
              onChange={(value) => updateSection("finalWishes", "memorialMusic", value)}
            />
            <TextArea
              label="Readings, speakers, or service notes"
              value={packet.finalWishes.memorialReadings}
              onChange={(value) => updateSection("finalWishes", "memorialReadings", value)}
            />
          </div>
          <div className="grid two-up">
            <TextArea
              label="Personal message to loved ones"
              value={packet.finalWishes.personalMessage}
              onChange={(value) => updateSection("finalWishes", "personalMessage", value)}
            />
            <TextArea
              label="Digital vault location"
              value={packet.finalWishes.digitalVaultLocation}
              onChange={(value) => updateSection("finalWishes", "digitalVaultLocation", value)}
              placeholder="Password manager, encrypted drive, safe deposit box, or cloud folder"
            />
          </div>
          <TextArea
            label="Digital executor notes"
            value={packet.finalWishes.digitalExecutorNotes}
            onChange={(value) => updateSection("finalWishes", "digitalExecutorNotes", value)}
            placeholder="Social-media handling, device access, photo archive instructions, shutdown priorities."
          />
        </section>
      </div>
    );
  }

  function renderSignatures() {
    return (
      <div className="stack">
        <section className="editor-card">
          <div className="section-heading">
            <div>
              <h2>Execution and Signature Notes</h2>
              <p>Record the signing workflow so the packet can be completed cleanly.</p>
            </div>
          </div>
          <div className="grid two-up">
            <SelectField
              label="Witness count"
              value={packet.signatures.witnessCount}
              onChange={(value) => updateSection("signatures", "witnessCount", value)}
              options={witnessCountOptions}
            />
            <SelectField
              label="Notary requirement"
              value={packet.signatures.notaryRequired}
              onChange={(value) => updateSection("signatures", "notaryRequired", value)}
              options={notaryOptions}
            />
          </div>
          <div className="grid two-up">
            <TextArea
              label="Storage plan"
              value={packet.signatures.storagePlan}
              onChange={(value) => updateSection("signatures", "storagePlan", value)}
            />
            <TextArea
              label="Attorney review status"
              value={packet.signatures.attorneyReviewStatus}
              onChange={(value) => updateSection("signatures", "attorneyReviewStatus", value)}
              placeholder="Pending state-law review, reviewed by counsel, notarization scheduled, and so on."
            />
          </div>
          <TextArea
            label="Execution checklist"
            value={packet.signatures.finalChecklist}
            onChange={(value) => updateSection("signatures", "finalChecklist", value)}
          />
        </section>
      </div>
    );
  }

  function renderExport() {
    return (
      <div className="stack">
        <section className="editor-card">
          <div className="section-heading">
            <div>
              <h2>Export Kit</h2>
              <p>Run the red-line review here before printing or saving the packet.</p>
            </div>
            <div className="button-row wrap-actions">
              <button
                className="primary-button"
                type="button"
                disabled={!readiness.isReadyToFinalize}
                onClick={() => window.print()}
              >
                Finalize PDF Kit
              </button>
              <button className="secondary-button" type="button" onClick={() => window.print()}>
                Print Draft Review Copy
              </button>
              <button className="secondary-button" type="button" onClick={() => downloadPacketBackup(packet)}>
                Download JSON Backup
              </button>
              <button className="ghost-button" type="button" disabled={isImporting} onClick={triggerImport}>
                Import JSON Backup
              </button>
            </div>
          </div>

          <div
            className={`status-panel${readiness.isReadyToFinalize ? " is-success" : " is-warning"}`}
            aria-label="Export readiness"
          >
            <strong>
              {readiness.isReadyToFinalize
                ? "Required blockers are clear. Final export can proceed."
                : `${readiness.requiredIssues.length} required blocker(s) still need attention.`}
            </strong>
            <p>
              {readiness.isReadyToFinalize
                ? "Use Finalize PDF Kit for the production packet, then keep both the PDF and JSON backup."
                : "Finalize PDF Kit stays disabled until the required blockers below are resolved. Print Draft Review Copy remains available for attorney review."}
            </p>
          </div>

          <div className="data-warning compact" aria-label="Export reminder">
            <strong>Before you leave:</strong> keep both <span>Finalize PDF Kit</span> and
            <span> Download JSON Backup</span> in your final handoff. Browser autosave alone is not a safe final copy.
          </div>

          <div className="export-grid">
            <IssueList
              title="Required blockers"
              issues={readiness.requiredIssues}
              emptyText="No required blockers remain."
            />
            <IssueList
              title="Recommended follow-up"
              issues={readiness.recommendedIssues}
              emptyText="No recommended follow-up items are currently flagged."
            />
          </div>
        </section>

        <section className="grid two-up">
          {reviewSections.map((section) => (
            <div className="editor-card inset" key={section.title}>
              <h3>{section.title}</h3>
              <ul className="plain-list">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="grid two-up">
          <div className="editor-card inset">
            <h3>State-law execution checklist</h3>
            <ul className="plain-list">
              {jurisdictionChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="editor-card inset">
            <h3>Packet contents</h3>
            <ul className="plain-list">
              {printableDocuments.map((doc) => (
                <li key={doc.id}>
                  <strong>{doc.title}</strong>
                  <span>{doc.subtitle}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    );
  }

  function renderStep() {
    switch (activeStep) {
      case "overview":
        return renderOverview();
      case "household":
        return renderHousehold();
      case "will":
        return renderWill();
      case "healthCare":
        return renderHealthCare();
      case "financialPoa":
        return renderFinancialPoa();
      case "hipaa":
        return renderHipaa();
      case "trust":
        return renderTrust();
      case "beneficiaries":
        return renderBeneficiaries();
      case "finalWishes":
        return renderFinalWishes();
      case "signatures":
        return renderSignatures();
      case "export":
        return renderExport();
    }
  }

  return (
    <>
      <input
        ref={importInputRef}
        className="visually-hidden"
        type="file"
        accept=".json,application/json"
        onChange={handleImportChange}
      />

      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand-block">
            <span className="brand-kicker">QiLegacy</span>
            <h1>Estate Kit Builder</h1>
            <p>Questionnaire-driven packet preparation for final wishes and estate documents.</p>
          </div>
          <div className="progress-card">
            <span>Overall completion</span>
            <strong>{overallCompletion}%</strong>
            <div className="progress-bar">
              <div style={{ width: `${overallCompletion}%` }} />
            </div>
            <small>
              {readiness.isReadyToFinalize
                ? "Required blockers are clear. Use Export Kit for final review."
                : `${readiness.requiredIssues.length} required blocker(s) still need attention before final export.`}
            </small>
          </div>
          <nav className="step-nav">
            {steps.map((step) => (
              <StepNavItem key={step.id} step={step} />
            ))}
          </nav>
          <div className="sidebar-footer">
            <button className="ghost-button full-width" type="button" onClick={resetPacket}>
              Reset packet
            </button>
          </div>
        </aside>

        <main className="main-column">
          <header className="topbar">
            <div>
              <p className="eyebrow">{steps.find((step) => step.id === activeStep)?.label}</p>
              <h2>{steps.find((step) => step.id === activeStep)?.description}</h2>
            </div>
            <div className="button-row wrap-actions">
              <button className="ghost-button" type="button" disabled={isImporting} onClick={triggerImport}>
                Import JSON
              </button>
              <button className="secondary-button" type="button" onClick={() => downloadPacketBackup(packet)}>
                Backup JSON
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={() =>
                  readiness.isReadyToFinalize ? window.print() : goToStep("export")
                }
              >
                {readiness.isReadyToFinalize ? "Finalize PDF Kit" : "Resolve Export Issues"}
              </button>
            </div>
          </header>

          {notice ? (
            <section className={`status-panel is-${notice.tone}`} aria-live="polite">
              <strong>
                {notice.tone === "success"
                  ? "Update saved."
                  : notice.tone === "error"
                    ? "Action failed."
                    : "Notice."}
              </strong>
              <p>{notice.text}</p>
            </section>
          ) : null}

          <section className="content-panel">{renderStep()}</section>
        </main>

        <aside className="preview-rail">
          <div className="preview-header">
            <span className="eyebrow">Live packet preview</span>
            <h3>{activePreview.title}</h3>
            <p>{activePreview.subtitle}</p>
          </div>
          <article className="paper-preview">
            {activePreview.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {activePreview.checklistItems?.length ? (
              <ol className="plain-list plain-list-ordered">
                {activePreview.checklistItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            ) : null}
            {activePreview.bullets?.length ? (
              <ul>
                {activePreview.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </article>
        </aside>
      </div>

      <div className="print-root" aria-hidden="true">
        {printableDocuments.map((document, index) => (
          <section className="print-page" key={document.id}>
            <header className="print-header">
              <p>QiLegacy Estate Packet</p>
              <h1>{document.title}</h1>
              <h2>{document.subtitle}</h2>
            </header>
            {document.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {document.checklistItems?.length ? (
              <ol className="print-checklist">
                {document.checklistItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            ) : null}
            {document.bullets?.length ? (
              <ul>
                {document.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
            {document.signatureLines?.length ? (
              <div className="signature-sheet">
                {document.signatureLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}
            <footer className="print-footer">
              <span>{document.footerNote || "State review required before execution."}</span>
              <span>Page {index + 1} of {printableDocuments.length}</span>
            </footer>
          </section>
        ))}
      </div>
    </>
  );
}

export default App;
