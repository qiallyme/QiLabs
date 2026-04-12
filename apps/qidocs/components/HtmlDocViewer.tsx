import React, { Suspense, lazy } from "react";

// Lazy-load templates to prevent build hang / heavy initial bundle
const Invoice = lazy(() => import("../templates/Invoice"));
const Letter = lazy(() => import("../templates/Letter"));
const Receipt = lazy(() => import("../templates/Receipt"));
const Resume = lazy(() => import("../templates/Resume"));
const Book = lazy(() => import("../templates/Book"));

// Template prop types
import type { InvoiceProps } from "../templates/Invoice";
import type { LetterProps } from "../templates/Letter";
import type { ReceiptProps } from "../templates/Receipt";
import type { ResumeProps } from "../templates/Resume";
import type { BookProps } from "../templates/Book";

export type TemplateType = "invoice" | "letter" | "receipt" | "resume" | "book";

interface HtmlDocViewerProps {
  template: TemplateType;
  data: InvoiceProps | LetterProps | ReceiptProps | ResumeProps | BookProps;
}

export function HtmlDocViewer({ template, data }: HtmlDocViewerProps) {
  // Type-safe template rendering
  const renderTemplate = () => {
    switch (template) {
      case "invoice":
        return <Invoice {...(data as InvoiceProps)} />;
      case "letter":
        return <Letter {...(data as LetterProps)} />;
      case "receipt":
        return <Receipt {...(data as ReceiptProps)} />;
      case "resume":
        return <Resume {...(data as ResumeProps)} />;
      case "book":
        return <Book {...(data as BookProps)} />;
      default:
        return <div>Unknown template: {template}</div>;
    }
  };

  return (
    <div className="qidocs-viewer">
      <Suspense fallback={<div>Loading document...</div>}>
        {renderTemplate()}
      </Suspense>
    </div>
  );
}
