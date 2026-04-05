import React from "react";

const ChatWindow = () => (
  <div>
    <h3>Chat with Legal AI Coach</h3>
    {/* Chat interface will go here */}
    <div className="chat-area">
      <div className="message">Hi! How can I help you with your case today?</div>
    </div>
    <form>
      <input type="text" placeholder="Type your message..." />
      <button type="submit">Send</button>
    </form>
  </div>
);

export default ChatWindow;