import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { server } from "../../server";
import api from "../../utils/axios";
import { AiOutlineSend } from "react-icons/ai";
import TimeAgo from "timeago-react";
import { TfiGallery } from "react-icons/tfi";
import Loader from "../UI/Loader";
import { RxCross1 } from "react-icons/rx";
import CreateLoader from "../UI/createLoader";
import { socket } from "../../utils/socket";

const Inbox = () => {
  const { id } = useParams();

  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user?.token);
  const me = user?._id;
  const [seller, setSeller] = useState(null);

  const onlineUsers = useSelector((state) => state.socket.onlineUsers);

  const navigate = useNavigate();

  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [imgLoading, setImgLoading] = useState(false);
  const [loadingShop, setLoadingShop] = useState(true);

  const scrollRef = useRef(null);

  // Socket connection & new message listener
  useEffect(() => {
    const handleNewMessage = (msg) => {
      if (msg.conversationId === currentChat?._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [currentChat?._id]);

  // Load current conversation
  useEffect(() => {
    if (!id) return;

    const fetchConversation = async () => {
      try {
        const res = await api.get(`${server}/conversation/get-conversation/${id}`);
        setCurrentChat(res.data.conversation);
      } catch (err) {
        console.error("Failed to load conversation:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
  }, [id, token]);

  const shopId = useMemo(() => currentChat?.members?.find((id) => id !== me), [currentChat, me]);

  useEffect(() => {
    if (!shopId) return;

    const fetchShop = async () => {
      try {
        const { data } = await api.get(`${server}/shop/get-shop-info/${shopId}`);
        setSeller(data.shop);
      } catch (err) {
        console.error("Failed to load shop:", err);
      } finally {
        setLoadingShop(false);
      }
    };
    fetchShop();
  }, [shopId]);

  // Load messages
  useEffect(() => {
    if (!currentChat?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`${server}/messages/get-all-messages/${currentChat._id}`);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    fetchMessages();
  }, [currentChat?._id, token]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send text message
  const sendMessageHandler = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat?._id) return;

    const messageData = {
      sender: user._id,
      text: newMessage.trim(),
      conversationId: currentChat._id,
    };

    const optimisticMsg = {
      _id: `temp-${Date.now()}`,
      sender: user._id,
      text: newMessage.trim(),
      createdAt: new Date().toISOString(),
      conversation: currentChat._id,
      images: null,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");

    try {
      const res = await api.post(`${server}/messages/create-new-message`, messageData);
      setMessages((prev) => prev.map((msg) => (msg._id.startsWith("temp-") ? res.data.message : msg)));
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((msg) => !msg._id.startsWith("temp-")));
      alert("Failed to send message. Please try again.");
    }
  };

  // Image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        sendImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Send Uploaded Image
  const sendImage = async (base64Image) => {
    setImgLoading(true);

    const optimisticImg = {
      _id: `temp-img-${Date.now()}`,
      sender: user._id,
      text: null,
      images: { url: base64Image },
      createdAt: new Date().toISOString(),
      conversation: currentChat._id,
    };

    setMessages((prev) => [...prev, optimisticImg]);

    try {
      const res = await api.post(
        `${server}/messages/create-new-message`,
        {
          sender: user._id,
          images: base64Image,
          conversationId: currentChat._id,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMessages((prev) => prev.map((msg) => (msg._id === optimisticImg._id ? res.data.message : msg)));
    } catch (error) {
      console.error("Failed to send image:", error);
      setMessages((prev) => prev.filter((msg) => msg._id !== optimisticImg._id));
      alert("Failed to send image");
    } finally {
      setImgLoading(false);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  const isChatOnline = onlineUsers.includes(currentChat?.members?.find((id) => id !== me)?.toString());

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50">
      {/* Header*/}
      <div className="sticky top-0 h-14 bg-slate-500 z-50 flex items-center justify-between px-3 py-1">
        <div className="flex items-center gap-3">
          {loadingShop ? (
            <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
          ) : (
            <>
              <img src={seller?.avatar?.url} alt="avatar" className="w-10 h-10 rounded-full border border-black object-cover" />
              <div>
                <h1 className="text-base font-semibold text-white">{seller?.shopName || "Shop"}</h1>
                <p className="text-sm text-gray-200">{isChatOnline ? "Active Now" : "Offline"}</p>
              </div>
            </>
          )}
        </div>
        <RxCross1
          size={26}
          className="absolute top-4 right-4 z-10 cursor-pointer text-white bg-black/50 rounded-full p-1 hover:bg-black/70 transition"
          onClick={handleClose}
        />
      </div>

      {/* Messages container */}
      <div className="flex-1 pt-4 pb-24 px-3 md:px-5 overflow-y-auto  bg-gray-50 scrollbar-hide">
        {isLoading ? (
          <div className="h-[calc(100vh-56px)]  flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message._id} className={`flex flex-col my-2 ${message.sender === me ? "items-end" : "items-start"}`}>
                <div className="flex items-end gap-2 max-w-[80%]">
                  {message.images?.length > 0 && message.images[0]?.url && (
                    <img
                      src={message.images[0].url}
                      alt="sent image"
                      className="w-[150px] h-[150px] object-contain rounded-[10px] mr-2 border border-gray-200"
                      style={{ maxWidth: "100%", maxHeight: "100%" }}
                    />
                  )}

                  {message.text && (
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-full ${
                        message.sender === me ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}
                </div>

                <span className="text-xs text-gray-500 mt-1 px-2">
                  <TimeAgo datetime={message.createdAt} />
                </span>
              </div>
            ))}

            {imgLoading && (
              <div className="flex justify-end pr-4 mt-2">
                <Loader />
              </div>
            )}

            <div ref={scrollRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 safe-input">
        <form onSubmit={sendMessageHandler} className="p-3 flex items-center gap-3">
          <label htmlFor="image-upload" className="cursor-pointer">
            <TfiGallery size={26} className="text-blue-600" />
            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={imgLoading} />
          </label>

          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-3 border rounded-lg resize-none focus:outline-none focus:border-blue-500 max-h-[120px]"
            rows={1}
          />

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full transition-colors ${
              newMessage.trim() ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <AiOutlineSend size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Inbox;
