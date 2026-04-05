import { useMemo } from "react";
import Invoice, { InvoiceProps } from "../templates/Invoice";
import Letter, { LetterProps } from "../templates/Letter";
import Receipt, { ReceiptProps } from "../templates/Receipt";
import Resume, { ResumeProps } from "../templates/Resume";
import Book, { BookProps } from "../templates/Book";

export type TemplateType = "invoice" | "letter" | "receipt" | "resume" | "book";

interface HtmlDocViewerProps {
  template: TemplateType;
  data: unknown; // JSON data for the template
}

export function HtmlDocViewer({ template, data }: HtmlDocViewerProps) {
  const TemplateComponent = useMemo(() => {
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
  }, [template, data]);

  return (
    <div className="qidocs-viewer">
      {TemplateComponent}
    </div>
  );
}

