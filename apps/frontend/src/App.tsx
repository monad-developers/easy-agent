import React from "react";
import { Button } from "@easyagent/ui/components/button";
import TextareaAutosize from "react-textarea-autosize";
import clsx from "clsx";
import { UIMessage } from "@ai-sdk/ui-utils";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function App() {
  const messages:UIMessage[] = [
    { id: "1", role: "user", content: "Hello!",parts:[] },
    {
      id: "2",
      role: "assistant",
      content: "Hello! How can I assist you today?",
      parts:[]
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 min-h-screen">
      {/* Message display area */}
      <div className="flex-1 p-8 container flex flex-col mx-auto">
        <MessageList messages={messages} />
      </div>

      {/* Input area */}
      <div className="w-full flex max-w-3xl mx-auto mb-4 border border-gray-300 rounded-xl flex-col p-4">
        <form className="flex flex-col w-full">
          <TextareaAutosize
            className="resize-none border-none focus:outline-none shadow-none mb-6"
            placeholder="Type your message..."
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}
function MessageList({
  messages,
}: React.PropsWithoutRef<{ messages: UIMessage[] }>) {
  return (
    <>
      {messages.map((msg, index) => (
        <div key={index} className="max-w-3xl mx-auto w-full mb-2">
          <div
            className={clsx("rounded-xl p-2 px-3 w-fit", {
              "bg-black text-white float-right": msg.role === "user",
              "": msg.role === "assistant",
            })}
          >
            {msg.content}
          </div>
        </div>
      ))}
    </>
  );
}
