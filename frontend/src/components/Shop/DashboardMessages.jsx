import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import { server } from "../../server";
import { FcSms } from "react-icons/fc";
import Loader from "../UI/Loader";
import SmallLoader from "../UI/SmallLoader";
import { socket } from "../../utils/socket";

const DashboardMessages = () => {
  const seller = useSelector((state) => state.shop.seller);
  const sellerToken = useSelector((state) => state.shop.sellerToken);
  const onlineUsers = useSelector((state) => state.socket.onlineUsers);

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (!seller?._id) return;

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`${server}/conversation/get-all-conversation-seller/${seller._id}`, {
          withCredentials: true,
        });

        const sorted = (data.conversations || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setConversations(sorted);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [seller?._id]);

  const isOnline = (conversation) => {
    const otherUserId = conversation.members.find((id) => id !== seller?._id);
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
      <div className="flex-1 overflow-y-auto scrollbar-hide py-4 max-w-screen-4xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center bg-gray-50 h-[75vh] ">
            <Loader />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500">
            <FcSms size={72} className="mb-6 opacity-30" strokeWidth={1.5} />
            <h2 className="text-xl font-medium text-gray-700 mb-2">Your inbox is empty</h2>
            <p className="text-gray-500 max-w-md text-center">Messages from buyers will appear here.</p>
          </div>
        ) : (
          <>
            {/* Filter only conversations with actual messages */}
            {conversations.filter((convo) => convo.lastMessagePreview && convo.lastMessagePreview.trim() !== "").length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <FcSms size={72} className="mb-6 opacity-30" strokeWidth={1.5} />
                <h2 className="text-xl font-medium text-gray-700 mb-2">No messages yet</h2>
                <p className="text-gray-500 max-w-md text-center">Conversations will appear here once a buyer sends a message.</p>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {conversations
                  .filter((convo) => convo.lastMessagePreview && convo.lastMessagePreview.trim() !== "")
                  .map((conversation) => (
                    <MessageList
                      key={conversation._id}
                      conversation={conversation}
                      currentSellerId={seller._id}
                      online={isOnline(conversation)}
                    />
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// MessageList
const MessageList = ({ conversation, currentSellerId, online }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userId = useMemo(() => conversation?.members?.find((id) => id !== currentSellerId), [conversation, currentSellerId]);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const { data } = await api.get(`${server}/user/user-info/${userId}`);
        setUser(data.user);
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const lastMssg = conversation.lastMessagePreview || "No messages yet...";
  const isFromMe = conversation.lastMessagePreview?.startsWith("You:");

  const handleOpenMessage = () => {
    navigate(`/dashboard/messages/${conversation._id}`, {
      state: {
        conversation,
        user,
        online,
      },
    });
  };

  return (
    <div
      onClick={handleOpenMessage}
      className={`
        flex items-center gap-3 p-3 md:p-4 rounded-xl cursor-pointer transition-all
        hover:bg-gray-100 active:bg-gray-200 border border-gray-200
      `}
    >
      <div className="relative flex-shrink-0">
        {loading ? (
          <SmallLoader />
        ) : (
          <>
            <img
              src={user?.avatar?.url}
              alt={user?.firstName}
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
              onError={(e) => (e.target.src = "/default-avatar.png")}
            />
            <div
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                online ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </>
        )}
      </div>

      <div className="pl-3 flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h1 className="text-base font-medium">{loading ? "Loading..." : user?.firstName || "Customer"}</h1>
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

export default DashboardMessages;
