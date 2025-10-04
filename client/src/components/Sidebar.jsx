import React, { useState } from "react";
import { useAppContext } from "../context/AppContext.jsx";
import { assets } from "../assets/assets.js";
import toast from "react-hot-toast";

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
  const {
    chats,
    setSelectedChat,
    theme,
    setTheme,
    user,
    navigate,
    createNewChat,
    axios,
    setChats,
    fetchUsersChats,
    setToken,
    token,
  } = useAppContext();
  const [search, setSearch] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    toast.success("Logged out successfully");
  };

  const deleteChat = async (e, chatId) => {
    try {
      e.stopPropagation();
      // Using a custom modal or a different confirmation method is better than window.confirm
      if (!window.confirm("Are you sure you want to delete this chat?")) return;

      const { data } = await axios.post(
        "/api/chat/delete",
        { chatId },
        { headers: { Authorization: token } }
      );
      if (data.success) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        await fetchUsersChats();
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Function to display time like "2 days ago"
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    let counter;
    for (const interval in intervals) {
      counter = Math.floor(diffInSeconds / intervals[interval]);
      if (counter > 0) {
        if (counter === 1) {
          return `${counter} ${interval} ago`;
        } else {
          return `${counter} ${interval}s ago`;
        }
      }
    }
    return "just now";
  };

  return (
    <div
      className={`flex flex-col h-screen min-w-72 p-5 dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30 border-r border-[#80609F]/30 backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-1 ${
        !isMenuOpen && "max-md:-translate-x-full"
      }`}>
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-3 cursor-pointer">
        <img src={assets.logo} alt="QuickGPT Logo" className="w-12 h-12" />
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-gray-800">
            MaxAI
          </h1>
          <p className="text-xs text-[rgb(131,107,246)]">
            Intelligent AI Assistant
          </p>
        </div>
      </div>

      {/* New Chat Button */}
      <button
        onClick={createNewChat}
        className="flex justify-center items-center w-full py-2 mt-10 text-white  bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md cursor-pointer">
        <span className="mr-2 text-xl">+</span> New Chat
      </button>

      {/* Search Conversations */}
      <div className="flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20 rounded-md">
        <img src={assets.search_icon} className="w-4 not-dark:invert" alt="" />
        <input
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
          placeholder="Search conversations"
          className="text-xs placeholder:text-gray-400 outline-none"
        />
      </div>

      {/* Recent Chats */}
      {chats.length > 0 && <p className="mt-4 text-sm">Recent Chats</p>}
      <div className="flex-1 overflow-y-scroll mt-3 text-sm space-y-3">
        {chats
          .filter((chat) =>
            chat.messages[0]
              ? chat.messages[0]?.content
                  .toLowerCase()
                  .includes(search.toLowerCase())
              : chat.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((chat) => (
            <div
              onClick={() => {
                navigate("/");
                setSelectedChat(chat);
                setIsMenuOpen(false);
              }}
              key={chat._id}
              className="p-2 px-4 dark:bg-[#57317C]/10 border border-gray-300 dark:border-[#80609F]/15 rounded-md cursor-pointer flex justify-between group">
              <div>
                <p className="truncate w-full">
                  {chat.messages.length > 0
                    ? chat.messages[0].content.slice(0, 32)
                    : chat.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#B1A6C0]">
                  {formatTimeAgo(chat.updatedAt)}
                </p>
              </div>
              <img
                src={assets.bin_icon}
                className="hidden group-hover:block w-4 cursor-pointer not-dark:invert"
                alt=""
                onClick={(e) =>
                  toast.promise(deleteChat(e, chat._id), {
                    loading: "deleting...",
                  })
                }
              />
            </div>
          ))}
      </div>

      {/* Community Images */}
      <div
        onClick={() => {
          navigate("/community");
          setIsMenuOpen(false);
        }}
        className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all">
        <img
          src={assets.gallery_icon}
          className="w-4.5 not-dark:invert"
          alt=""
        />
        <div className="flex flex-col text-sm">
          <p>Community Images</p>
        </div>
      </div>

      {/* Credit Purchases Option */}
      <div
        onClick={() => {
          navigate("/credits");
          setIsMenuOpen(false);
        }}
        className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all">
        <img src={assets.diamond_icon} className="w-4.5 dark:invert" alt="" />
        <div className="flex flex-col text-sm">
          <p>Credits : {user?.credits}</p>
          <p className="text-xs text-gray-400">Purchase credits to use MaxAI</p>
        </div>
      </div>

      {/* Dark Mode Toggle  */}
      <div className="flex items-center justify-between gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md">
        <div className="flex items-center gap-2 text-sm">
          <img src={assets.theme_icon} className="w-4 not-dark:invert" alt="" />
          <p>Dark Mode</p>
        </div>
        <label className="relative inline-flex cursor-pointer">
          <input
            onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
            type="checkbox"
            className="sr-only peer"
            checked={theme === "dark"}
          />
          <div className="w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-purple-600 transition-all"></div>
          <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
        </label>
      </div>

      {/* User Account */}
      <div className="flex items-center gap-3 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer group">
        <img src={assets.user_icon} className="w-7 rounded-full" alt="" />
        <p className="flex-1 text-sm dark:text-primary truncate">
          {user ? user.name : "Login your account"}
        </p>
        {user && (
          <img
            onClick={logout}
            src={assets.logout_icon}
            className="h-5 cursor-pointer hidden not-dark:invert group-hover:block"
          />
        )}
      </div>

      <img
        onClick={() => setIsMenuOpen(false)}
        src={assets.close_icon}
        className="absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden not-dark:invert"
        alt=""
      />
    </div>
  );
};

export default Sidebar;
