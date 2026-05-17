import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import { server } from "../../server";
import { FcSms } from "react-icons/fc";
import Loader from "../UI/Loader";
import { socket } from "../../utils/socket";

const UserInbox = () => {
  const user = useSelector((state) => state.user.user);
  const onlineUsers = useSelector((state) => state.socket.onlineUsers);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Socket listens for new Message
  useEffect(() => {
    socket.on("newMessage", (msg) => {
      setConversations((prev) =>
        prev.map((convo) =>
          convo._id === msg.conversationId
            ? {
                ...convo,
                lastMessagePreview: msg.text || "Photo",
                updatedAt: msg.createdAt || new Date(),
              }
            : convo,
        ),
      );
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  // Fetch conversations
  useEffect(() => {
    if (!user?._id) return;

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`${server}/conversation/get-all-conversation-user/${user._id}`);

        const sorted = (data.conversations || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setConversations(sorted);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user?._id]);

  // Check if another user (shop/seller) is online using socket array
  const isOnline = (conversation) => {
    const otherUserId = conversation.members.find((id) => id !== user?._id);
    const result = onlineUsers.includes(otherUserId?.toString());
    return result;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3 max-w-screen-4xl mx-auto">
          <FcSms className="text-blue-600" size={28} strokeWidth={2.2} />
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Messages</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-2 py-4 md:px-3 max-w-screen-4xl">
        {loading ? (
          <div className="flex items-center justify-center h-[63vh] md:h-[71vh]">
            <Loader />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500">
            <FcSms size={72} className="mb-6 opacity-30" strokeWidth={1.5} />
            <h2 className="text-xl font-medium text-gray-700 mb-2">Your inbox is empty</h2>
            <p className="text-gray-500 max-w-md text-center">
              When you message a shop or receive a reply, conversations will appear here.
            </p>
          </div>
        ) : (
          <div className=" space-y-2 md:space-y-3">
            {conversations
              .filter((convo) => convo.lastMessagePreview && convo.lastMessagePreview.trim() !== "")
              .map((convo) => (
                <ConversationItem key={convo._id} conversation={convo} currentUserId={user._id} isOnline={isOnline(convo)} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ConversationItem = ({ conversation, currentUserId, isOnline }) => {
  const [shop, setShop] = useState(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const navigate = useNavigate();

  const shopId = useMemo(() => conversation?.members?.find((id) => id !== currentUserId), [conversation, currentUserId]);

  useEffect(() => {
    if (!shopId) return;

    const fetchShop = async () => {
      try {
        const { data } = await api.get(`${server}/shop/get-shop-info/${shopId}`);
        setShop(data.shop);
      } catch (err) {
        console.error("Failed to load shop:", err);
      } finally {
        setLoadingShop(false);
      }
    };
    fetchShop();
  }, [shopId]);

  const lastMssg = conversation.lastMessagePreview || "No messages yet...";
  const isFromMe = conversation.lastMessagePreview?.startsWith("You:");

  const handleOpenMessage = () => {
    navigate(`/profile/inbox/${conversation._id}`, {
      state: {
        conversation,
        seller: shop,
        online: isOnline,
      },
    });
  };

  return (
    <div
      onClick={handleOpenMessage}
      className={`
        flex  items-center gap-3 p-3 md:p-4 rounded-xl cursor-pointer transition-all
        hover:bg-gray-100 active:bg-gray-200 border border-gray-200
      `}
    >
      <div className="relative flex-shrink-0">
        {loadingShop ? (
          <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
        ) : (
          <>
            <img
              src={shop?.avatar?.url}
              alt={shop?.shopName}
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
              onError={(e) => (e.target.src = "/default-avatar.png")}
            />
            <div
              className={`
                absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white
                ${isOnline ? "bg-green-500" : "bg-gray-400"}
              `}
            />
          </>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h3 className="font-medium text-gray-900 truncate">{loadingShop ? "Loading..." : shop?.shopName || "Unknown Shop"}</h3>

          <span className="text-xs text-gray-500">
            {new Date(conversation.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <p className="text-sm text-gray-600 truncate mt-0.5">
          {isFromMe ? "You: " : ""}
          {lastMssg.length > 38 ? lastMssg.slice(0, 35) + "..." : lastMssg}
        </p>
      </div>
    </div>
  );
};

export default UserInbox;
