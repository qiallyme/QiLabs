import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2Icon } from "../icons/qi-icons";

type FeedbackItem = {
  detail?: string;
  id: string;
  title: string;
};

type FeedbackContextValue = {
  notify: (title: string, detail?: string) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FeedbackItem[]>([]);

  const value = useMemo<FeedbackContextValue>(
    () => ({
      notify: (title, detail) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setItems((current) => [...current, { detail, id, title }]);
      },
    }),
    [],
  );

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setItems((current) => current.slice(1));
    }, 2600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [items]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[70] grid w-full max-w-sm gap-2">
        {items.map((item) => (
          <div
            className="panel pointer-events-auto flex items-start gap-3 p-4 text-sm text-body shadow-card-hover"
            key={item.id}
          >
            <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <div>
              <div className="font-semibold text-heading">{item.title}</div>
              {item.detail ? <div className="mt-1 text-xs leading-5 text-muted">{item.detail}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error("useFeedback must be used inside FeedbackProvider.");
  }

  return context;
}
