# qimessage-supabase-react

/

├── src/

│ ├── app/

│ │ ├── providers/

│ │ │ └── AppProviders.tsx

│ │ ├── router/

│ │ │ ├── AppRouter.tsx

│ │ │ ├── ProtectedRoute.tsx

│ │ │ └── routes.tsx

│ │ ├── layout/

│ │ │ ├── AppShell.tsx

│ │ │ ├── SidebarLayout.tsx

│ │ │ └── AuthLayout.tsx

│ │ └── store/

│ │ └── ui-store.ts

│ │

│ ├── pages/

│ │ ├── auth/

│ │ │ ├── LoginPage.tsx

│ │ │ └── ConfirmPage.tsx

│ │ ├── chat/

│ │ │ ├── ChatHomePage.tsx

│ │ │ └── ChatRoomPage.tsx

│ │ ├── settings/

│ │ │ └── SettingsPage.tsx

│ │ └── NotFoundPage.tsx

│ │

│ ├── features/

│ │ └── chat/

│ │ ├── components/

│ │ │ ├── ChatShell.tsx

│ │ │ ├── ChatSidebar.tsx

│ │ │ ├── MessageList.tsx

│ │ │ ├── MessageBubble.tsx

│ │ │ ├── MessageInput.tsx

│ │ │ ├── TypingIndicator.tsx

│ │ │ └── OnlineBadge.tsx

│ │ ├── hooks/

│ │ │ ├── useChatMessages.ts

│ │ │ ├── useChatList.ts

│ │ │ ├── useChatPresence.ts

│ │ │ ├── useTypingPresence.ts

│ │ │ └── useUploadMedia.ts

│ │ ├── lib/

│ │ │ ├── queries.ts

│ │ │ ├── mutations.ts

│ │ │ ├── subscriptions.ts

│ │ │ └── mappers.ts

│ │ ├── types.ts

│ │ └── index.ts

│ │

│ ├── lib/

│ │ ├── supabase/

│ │ │ ├── client.ts

│ │ │ ├── auth.ts

│ │ │ └── storage.ts

│ │ ├── pwa/

│ │ │ ├── registerSW.ts

│ │ │ └── installPrompt.ts

│ │ ├── utils.ts

│ │ ├── formatters.ts

│ │ └── constants.ts

│ │

│ ├── types/

│ │ └── database.types.ts

│ │

│ ├── main.tsx

│ ├── App.tsx

│ └── vite-env.d.ts

│

├── public/

│ ├── pwa-192x192.png

│ ├── pwa-512x512.png

│ ├── apple-touch-icon.png

│ └── favicon.ico

│

├── supabase/

│ ├── migrations/

│ ├── seed.sql

│ └── config.toml

│

├── vite.config.ts

├── tsconfig.json

├── package.json

└── .env
