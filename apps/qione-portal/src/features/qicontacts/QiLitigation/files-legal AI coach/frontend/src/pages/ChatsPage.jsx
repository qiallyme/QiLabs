import React from "react";
import ChatWindow from "../components/Chats/ChatWindow";
import SavedChats from "../components/Chats/SavedChats";

const ChatsPage = () => (
  <section>
    <h2>Chats</h2>
    <ChatWindow />
    <SavedChats />
  </section>
);

export default ChatsPage;