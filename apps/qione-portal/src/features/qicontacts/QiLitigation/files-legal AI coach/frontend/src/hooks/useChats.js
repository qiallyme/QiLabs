import { useState } from "react";

export default function useChats(initialChats = []) {
  const [chats, setChats] = useState(initialChats);

  const saveChat = (chat) => setChats([...chats, chat]);
  const removeChat = (index) =>
    setChats(chats.filter((_, idx) => idx !== index));

  return { chats, saveChat, removeChat };
}