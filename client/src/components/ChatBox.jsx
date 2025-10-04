import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import Message from "./Message";
import toast from "react-hot-toast";

const ChatBox = () => {
  const containerRef = useRef(null);

  const { selectedChat, user, axios, token, setUser } = useAppContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);

  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!user) return toast("Login to send message");
      setLoading(true);
      const promptCopy = prompt;
      setPrompt("");
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: prompt,
          timestamp: Date.now(),
          isImage: false,
        },
      ]);

      const { data } = await axios.post(
        `/api/message/${mode}`,
        { chatId: selectedChat._id, prompt, isPublished },
        { headers: { Authorization: token } }
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.reply]);
        // decrease credits
        if (mode === "image") {
          setUser((prev) => ({ ...prev, credits: prev.credits - 2 }));
        } else {
          setUser((prev) => ({ ...prev, credits: prev.credits - 1 }));
        }
      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPrompt("");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="fixed inset-0 flex flex-col md:relative md:flex-1 md:h-screen">
      {/* Main Container with proper spacing */}
      <div className="flex-1 flex flex-col h-full overflow-hidden pt-14 md:pt-0 p-3 md:p-10">
        {/* Chat Messages - Scrollable Area */}
        <div ref={containerRef} className="flex-1 overflow-y-auto mb-3 md:mb-5">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-primary px-4">
              <div className="flex items-center gap-3">
                <img
                  src={assets.logo}
                  alt="QuickGPT Logo"
                  className="w-12 h-12 md:w-16 md:h-16"
                />
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold dark:text-white text-gray-800">
                    MaxAI
                  </h1>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    Intelligent AI Assistant
                  </p>
                </div>
              </div>
              <p className="mt-5 text-2xl sm:text-4xl md:text-6xl text-center text-gray-400 dark:text-white">
                Ask me anything.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}

          {/* Three Dots Loading  */}
          {loading && (
            <div className="loader flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            </div>
          )}
        </div>

        {/* Input Section - Fixed at bottom */}
        <div className="flex-shrink-0">
          {mode === "image" && (
            <label className="inline-flex items-center gap-2 mb-2 text-sm mx-auto justify-center w-full">
              <p className="text-xs">Publish Generated Image to Community</p>
              <input
                type="checkbox"
                className="cursor-pointer"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
            </label>
          )}

          {/* Prompt Input Box */}
          <form
            onSubmit={onSubmit}
            className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-2 md:p-3 pl-3 md:pl-4 mx-auto flex gap-2 md:gap-4 items-center">
            <select
              onChange={(e) => setMode(e.target.value)}
              value={mode}
              className="text-xs md:text-sm pl-2 md:pl-3 pr-1 md:pr-2 outline-none bg-transparent">
              <option className="dark:bg-purple-900" value="text">
                Text
              </option>
              <option className="dark:bg-purple-900" value="image">
                Image
              </option>
            </select>
            <input
              onChange={(e) => setPrompt(e.target.value)}
              value={prompt}
              type="text"
              placeholder="Type your prompt here..."
              className="flex-1 w-full text-xs md:text-sm outline-none bg-transparent"
              required
            />
            <button disabled={loading} type="submit">
              <img
                src={loading ? assets.stop_icon : assets.send_icon}
                className="w-6 md:w-8 cursor-pointer"
                alt=""
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
