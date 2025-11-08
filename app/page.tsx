"use client"

import { useState, useEffect, useRef } from "react"

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNAUwGYAoBaY5fH7nm623T_L3IDeT9CEs",
  authDomain: "ghostchat-41f83.firebaseapp.com",
  databaseURL: "https://ghostchat-41f83-default-rtdb.firebaseio.com",
  projectId: "ghostchat-41f83",
  storageBucket: "ghostchat-41f83.firebasestorage.app",
  messagingSenderId: "775562588087",
  appId: "1:775562588087:web:06dacf7c4fafad125c0232",
}

// Initialize Firebase (basic setup)
let firebase = null
let database = null
let initialized = false

const initializeFirebase = async () => {
  if (initialized) return
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js")
    const { getDatabase } = await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js")

    firebase = initializeApp(firebaseConfig)
    database = getDatabase(firebase)
    initialized = true
  } catch (error) {
    console.log("[v0] Firebase initialization attempted. Using local storage fallback.")
  }
}

// Avatar options
const AVATARS = ["😀", "😎", "🤖", "👻", "🎃", "🦊", "🐯", "🦁", "🐼", "🦄", "👾", "🎭", "🌟", "⭐", "🔥", "💎"]
// Emoji list for picker
const EMOJIS = ["😀", "😂", "❤️", "👍", "🔥", "😎", "🤔", "😍", "🎉", "🚀", "💯", "✨", "😢", "😡", "🤗", "👏"]

const App = () => {
  // Auth states
  const [currentPage, setCurrentPage] = useState("auth")
  const [authMode, setAuthMode] = useState("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState("user")
  const [theme, setTheme] = useState("dark")
  const [isGuest, setIsGuest] = useState(false)

  // Avatar selection
  const [showAvatarSelect, setShowAvatarSelect] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState("😀")
  const [tempAvatar, setTempAvatar] = useState("😀")

  // Chat states
  const [chats, setChats] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [showDrawer, setShowDrawer] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFAB, setShowFAB] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newChatName, setNewChatName] = useState("")
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // State for managing deleted chats and change password/username
  const [deletedChats, setDeletedChats] = useState([])
  const [showChangeUsername, setShowChangeUsername] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [oldPassword, setOldPassword] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const [selectedUserUsername, setSelectedUserUsername] = useState(null)
  const [selectedChatId, setSelectedChatId] = useState(null)

  const [viewingUserChats, setViewingUserChats] = useState(null)
  const [viewingChatDetails, setViewingChatDetails] = useState(null)
  // const [selectedUserUsername, setSelectedUserUsername] = useState(null) // Redeclared, removed

  // Initialize Firebase on mount
  useEffect(() => {
    initializeFirebase()
    const savedUser = localStorage.getItem("ghostchat_user")
    const sessionToken = localStorage.getItem("ghostchat_session")

    const savedDeletedChats = localStorage.getItem("ghostchat_deleted_chats")
    if (savedDeletedChats) {
      setDeletedChats(JSON.parse(savedDeletedChats))
    }

    if (savedUser && sessionToken) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user.username)
      setUserRole(user.role)
      setSelectedAvatar(user.avatar)
      setIsGuest(user.role === "guest")
      setCurrentPage("lobby")
      loadChats()
    }

    const handleResize = () => {
      const viewportHeight = window.innerHeight
      const keyboardHeight = window.visualViewport?.height || window.innerHeight
      setKeyboardVisible(viewportHeight > keyboardHeight + 50)
    }

    window.addEventListener("resize", handleResize)
    window.visualViewport?.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      window.visualViewport?.removeEventListener("resize", handleResize)
    }
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load all chats
  const loadChats = () => {
    const savedChats = localStorage.getItem("ghostchat_chats")
    if (savedChats) {
      setChats(JSON.parse(savedChats))
    }
  }

  // Load chat messages
  const loadChatMessages = (chatId) => {
    const savedChats = JSON.parse(localStorage.getItem("ghostchat_chats") || "[]")
    const chat = savedChats.find((c) => c.id === chatId)
    if (chat) {
      setMessages(chat.messages || [])
    }
  }

  // Admin login
  const isAdminCredentials = (user, pass) => {
    return user === "Harsh" && pass === "7008"
  }

  const handleChangeUsername = () => {
    if (!newUsername.trim()) {
      alert("Please enter new username")
      return
    }
    const users = JSON.parse(localStorage.getItem("ghostchat_users") || "[]")
    if (users.some((u) => u.username === newUsername)) {
      alert("Username already exists")
      return
    }

    const user = JSON.parse(localStorage.getItem("ghostchat_user"))
    user.username = newUsername
    localStorage.setItem("ghostchat_user", JSON.stringify(user))

    const userIndex = users.findIndex((u) => u.username === currentUser)
    if (userIndex !== -1) {
      users[userIndex].username = newUsername
      localStorage.setItem("ghostchat_users", JSON.stringify(users))
    }

    setCurrentUser(newUsername)
    setNewUsername("")
    setShowChangeUsername(false)
    alert("Username changed successfully!")
  }

  const handleChangePassword = () => {
    if (!oldPassword.trim() || !newPassword.trim()) {
      alert("Please fill all fields")
      return
    }

    const users = JSON.parse(localStorage.getItem("ghostchat_users") || "[]")
    const user = users.find((u) => u.username === currentUser && u.password === oldPassword)

    if (!user) {
      alert("Incorrect old password")
      return
    }

    user.password = newPassword
    localStorage.setItem("ghostchat_users", JSON.stringify(users))
    setOldPassword("")
    setNewPassword("")
    setShowChangePassword(false)
    alert("Password changed successfully!")
  }

  const handleAuth = () => {
    if (authMode === "login") {
      if (!username.trim() || !password.trim()) {
        alert("Please fill all fields")
        return
      }
      const users = JSON.parse(localStorage.getItem("ghostchat_users") || "[]")
      const user = users.find((u) => u.username === username && u.password === password)

      if (user || isAdminCredentials(username, password)) {
        const role = isAdminCredentials(username, password) ? "admin" : user?.role || "user"
        const userData = { username, role, avatar: selectedAvatar }
        const sessionToken = Math.random().toString(36).substr(2, 16)

        localStorage.setItem("ghostchat_user", JSON.stringify(userData))
        localStorage.setItem("ghostchat_session", sessionToken)

        setCurrentUser(username)
        setUserRole(role)
        setIsGuest(false)
        setCurrentPage("lobby")
        loadChats()
      } else {
        alert("Invalid credentials")
      }
    } else if (authMode === "register") {
      if (!username.trim() || !password.trim()) {
        alert("Please fill all fields")
        return
      }
      const users = JSON.parse(localStorage.getItem("ghostchat_users") || "[]")
      if (users.some((u) => u.username === username)) {
        alert("Username already exists")
        return
      }
      users.push({ username, password, role: "user", avatar: selectedAvatar })
      localStorage.setItem("ghostchat_users", JSON.stringify(users))
      alert("Registration successful! Please login.")
      setAuthMode("login")
      setUsername("")
      setPassword("")
    } else if (authMode === "guest") {
      const guestUsername = `Guest_${Math.random().toString(36).substr(2, 9)}`
      const userData = { username: guestUsername, role: "guest", avatar: selectedAvatar }
      const sessionToken = Math.random().toString(36).substr(2, 16)

      localStorage.setItem("ghostchat_user", JSON.stringify(userData))
      localStorage.setItem("ghostchat_session", sessionToken)
      localStorage.setItem("ghostchat_guest_id", guestUsername)
      localStorage.setItem("ghostchat_guest_login_time", new Date().toLocaleString())

      setCurrentUser(guestUsername)
      setUserRole("guest")
      setIsGuest(true)
      setCurrentPage("lobby")
      loadChats()
    }
  }

  const handleLogout = () => {
    if (isGuest) {
      const guestId = localStorage.getItem("ghostchat_guest_id")

      const guestHistory = JSON.parse(localStorage.getItem("ghostchat_guest_history") || "[]")
      const allChats = JSON.parse(localStorage.getItem("ghostchat_chats") || "[]")
      const guestChats = allChats.filter((c) => c.members.includes(guestId) || c.createdBy === guestId)

      const guestUserData = JSON.parse(localStorage.getItem("ghostchat_user"))
      guestHistory.push({
        guestId,
        guestAvatar: guestUserData.avatar,
        loginTime: localStorage.getItem("ghostchat_guest_login_time"),
        chatsCreated: guestChats.filter((c) => c.createdBy === guestId).length,
        chatsJoined: guestChats.filter((c) => c.members.includes(guestId) && c.createdBy !== guestId).length,
        messagesCount: guestChats.reduce((sum, c) => sum + c.messages.filter((m) => m.username === guestId).length, 0),
        deletedAt: new Date().toLocaleString(),
      })
      localStorage.setItem("ghostchat_guest_history", JSON.stringify(guestHistory))

      const guestUsers = JSON.parse(localStorage.getItem("ghostchat_guest_users") || "[]")
      guestUsers.push({
        username: guestId,
        avatar: guestUserData.avatar,
        role: "guest",
        password: "N/A",
        isDeletedGuest: true,
      })
      localStorage.setItem("ghostchat_guest_users", JSON.stringify(guestUsers))

      const updatedChats = allChats.map((chat) => ({
        ...chat,
        members: chat.members.filter((m) => m !== guestId),
      }))

      localStorage.setItem("ghostchat_chats", JSON.stringify(updatedChats))

      localStorage.removeItem("ghostchat_guest_id")
      localStorage.removeItem("ghostchat_guest_login_time")
    }

    localStorage.removeItem("ghostchat_user")
    localStorage.removeItem("ghostchat_session")
    setCurrentUser(null)
    setUserRole("user")
    setIsGuest(false)
    setCurrentPage("auth")
    setChats([])
    setMessages([])
    setCurrentChat(null)
    setUsername("")
    setPassword("")
  }

  // Create new chat
  const createNewChat = () => {
    if (!newChatName.trim()) {
      alert("Please enter chat name")
      return
    }
    const code = Math.random().toString(36).substr(2, 8).toUpperCase()
    const newChat = {
      id: Date.now(),
      name: newChatName,
      code,
      createdBy: currentUser,
      createdAt: new Date().toLocaleString(),
      members: [currentUser],
      messages: [],
    }
    const updatedChats = [...chats, newChat]
    setChats(updatedChats)
    localStorage.setItem("ghostchat_chats", JSON.stringify(updatedChats))
    setCurrentChat(newChat.id)
    setMessages([])
    setShowCreateModal(false)
    setNewChatName("")
    setCurrentPage("chat")
  }

  // Join chat
  const joinChat = () => {
    if (!joinCode.trim()) {
      alert("Please enter chat code")
      return
    }
    const chat = chats.find((c) => c.code.toUpperCase() === joinCode.toUpperCase())
    if (!chat) {
      alert("Chat not found")
      return
    }
    if (!chat.members.includes(currentUser)) {
      chat.members.push(currentUser)
      const updatedChats = chats.map((c) => (c.id === chat.id ? chat : c))
      setChats(updatedChats)
      localStorage.setItem("ghostchat_chats", JSON.stringify(updatedChats))
    }
    setCurrentChat(chat.id)
    loadChatMessages(chat.id)
    setShowJoinModal(false)
    setJoinCode("")
    setCurrentPage("chat")
  }

  // Send message
  const sendMessage = () => {
    if (!messageInput.trim() || !currentChat) return

    const newMessage = {
      id: Date.now(),
      username: currentUser,
      avatar: selectedAvatar,
      text: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)

    const updatedChats = chats.map((chat) => {
      if (chat.id === currentChat) {
        return { ...chat, messages: updatedMessages }
      }
      return chat
    })

    setChats(updatedChats)
    localStorage.setItem("ghostchat_chats", JSON.stringify(updatedChats))
    setMessageInput("")
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result
        const newMessage = {
          id: Date.now(),
          username: currentUser,
          avatar: selectedAvatar,
          text: `[📎 File: ${file.name}]`,
          isFile: true,
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(2),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }

        const updatedMessages = [...messages, newMessage]
        setMessages(updatedMessages)

        const updatedChats = chats.map((chat) => {
          if (chat.id === currentChat) {
            return { ...chat, messages: updatedMessages }
          }
          return chat
        })

        setChats(updatedChats)
        localStorage.setItem("ghostchat_chats", JSON.stringify(updatedChats))
      }
      reader.readAsDataURL(file)
    }
  }

  // Delete chat and save to deleted chats
  const deleteChat = (chatId) => {
    if (confirm("Delete this chat?")) {
      const chatToDelete = chats.find((c) => c.id === chatId)
      if (chatToDelete) {
        const updated = [...deletedChats, { ...chatToDelete, deletedAt: new Date().toLocaleString() }]
        localStorage.setItem("ghostchat_deleted_chats", JSON.stringify(updated))
        setDeletedChats(updated)
      }

      const updatedChats = chats.filter((c) => c.id !== chatId)
      setChats(updatedChats)
      localStorage.setItem("ghostchat_chats", JSON.stringify(updatedChats))

      if (currentChat === chatId) {
        setCurrentChat(null)
        setMessages([])
      }
    }
  }

  // Restore deleted chat
  const restoreDeletedChat = (chatId) => {
    const deletedChat = deletedChats.find((c) => c.id === chatId)
    if (deletedChat) {
      const { deletedAt, ...chatData } = deletedChat
      const updatedChats = [...chats, chatData]
      setChats(updatedChats)
      localStorage.setItem("ghostchat_chats", JSON.stringify(updatedChats))

      const updatedDeleted = deletedChats.filter((c) => c.id !== chatId)
      setDeletedChats(updatedDeleted)
      localStorage.setItem("ghostchat_deleted_chats", JSON.stringify(updatedDeleted))
      alert("Chat restored successfully!")
    }
  }

  // Search chats
  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Render footer
  const renderFooter = () => {
    return (
      <div
        className={`text-center py-4 text-xs opacity-50 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"} border-t`}
      >
        © 2025 GhostChat | Cyber Edition UI v6.2
      </div>
    )
  }

  // Render auth page
  if (currentPage === "auth") {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${theme === "dark" ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-gray-50 to-white"}`}
      >
        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .float { animation: float 3s ease-in-out infinite; }
          .neon-glow { text-shadow: 0 0 10px currentColor; }
          .glow-border { box-shadow: 0 0 20px rgba(6, 182, 212, 0.3), inset 0 0 20px rgba(6, 182, 212, 0.1); }
          .slide-up { animation: slideUp 0.5s ease-out; }
        `}</style>
        <div className="flex-1 flex items-center justify-center w-full px-4">
          <div
            className={`w-full max-w-md p-8 rounded-2xl backdrop-blur-sm ${theme === "dark" ? "bg-gray-800 border-cyan-500 text-white" : "bg-white bg-opacity-80 border-blue-500 text-black"} glow-border transition-all duration-300 slide-up`}
          >
            <h1 className="text-4xl font-bold mb-8 text-center neon-glow float">GhostChat v6.2</h1>

            <div className="space-y-4">
              {authMode !== "guest" && (
                <>
                  <div className="transition-all duration-300">
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 ${theme === "dark" ? "bg-gray-700 border-cyan-400 text-white placeholder-gray-400 focus:border-cyan-300 focus:shadow-lg focus:shadow-cyan-500/30" : "bg-gray-50 border-blue-400 text-black placeholder-gray-600 focus:border-blue-300 focus:shadow-lg focus:shadow-blue-500/30"} focus:outline-none`}
                    />
                  </div>
                  <div className="transition-all duration-300">
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 ${theme === "dark" ? "bg-gray-700 border-cyan-400 text-white placeholder-gray-400 focus:border-cyan-300 focus:shadow-lg focus:shadow-cyan-500/30" : "bg-gray-50 border-blue-400 text-black placeholder-gray-600 focus:border-blue-300 focus:shadow-lg focus:shadow-blue-500/30"} focus:outline-none`}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 mb-4 justify-center">
                <button
                  onClick={() => setShowAvatarSelect(!showAvatarSelect)}
                  className={`px-6 py-3 rounded-lg text-3xl font-bold transition-all duration-300 ${theme === "dark" ? "bg-purple-600 hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/30" : "bg-purple-400 hover:bg-purple-500"}`}
                >
                  {selectedAvatar}
                </button>
              </div>

              {showAvatarSelect && (
                <div className="grid grid-cols-4 gap-2 p-4 bg-gray-700 rounded-lg mb-4 transition-all duration-300">
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => {
                        setSelectedAvatar(avatar)
                        setShowAvatarSelect(false)
                      }}
                      className="text-3xl p-3 hover:bg-gray-600 rounded-lg transition-all duration-300 hover:scale-110"
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handleAuth}
                className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-300 ${theme === "dark" ? "bg-cyan-500 hover:bg-cyan-600 text-gray-900 hover:shadow-lg hover:shadow-cyan-500/30" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
              >
                {authMode === "login" ? "Login" : authMode === "register" ? "Register" : "Continue as Guest"}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAuthMode("login")
                    setUsername("")
                    setPassword("")
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${authMode === "login" ? (theme === "dark" ? "bg-cyan-500 text-gray-900" : "bg-blue-500 text-white") : theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"}`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setAuthMode("register")
                    setUsername("")
                    setPassword("")
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${authMode === "register" ? (theme === "dark" ? "bg-cyan-500 text-gray-900" : "bg-blue-500 text-white") : theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"}`}
                >
                  Register
                </button>
                <button
                  onClick={() => {
                    setAuthMode("guest")
                    setUsername("")
                    setPassword("")
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${authMode === "guest" ? (theme === "dark" ? "bg-cyan-500 text-gray-900" : "bg-blue-500 text-white") : theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"}`}
                >
                  Guest
                </button>
              </div>
            </div>
          </div>
        </div>
        {renderFooter()}
      </div>
    )
  }

  // Render lobby (chat list)
  if (currentPage === "lobby") {
    return (
      <div
        className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}
      >
        <style>{`
          @keyframes slideIn { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100%); opacity: 0; } }
          .slide-in { animation: slideIn 0.3s ease-out; }
          .fade-in { animation: fadeIn 0.3s ease-out; }
          .slide-out { animation: slideOut 0.3s ease-out; }
        `}</style>

        {showDrawer && (
          <div
            onClick={() => setShowDrawer(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 fade-in"
          ></div>
        )}

        {showDrawer && (
          <div
            className={`fixed left-0 top-0 h-full w-64 ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-2xl z-40 slide-in transition-all duration-300`}
          >
            <div className="p-4 space-y-2 mt-16">
              <button
                onClick={() => {
                  setCurrentPage("profile")
                  setShowDrawer(false)
                }}
                className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-300 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                👤 Profile
              </button>
              <button
                onClick={() => {
                  setCurrentPage("settings")
                  setShowDrawer(false)
                }}
                className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-300 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                ⚙️ Settings
              </button>
              {userRole !== "guest" && (
                <button
                  onClick={() => {
                    setCurrentPage("managechats")
                    setShowDrawer(false)
                  }}
                  className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-300 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                >
                  💬 Manage Chats
                </button>
              )}
              {userRole === "admin" && (
                <button
                  onClick={() => {
                    setCurrentPage("admin")
                    setShowDrawer(false)
                  }}
                  className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-300 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                >
                  🛡️ Admin Panel
                </button>
              )}
              {isGuest && (
                <div
                  className={`p-3 rounded-lg mt-4 text-sm transition-all duration-300 ${theme === "dark" ? "bg-orange-900 text-orange-100" : "bg-orange-100 text-orange-900"}`}
                >
                  Your guest session will be deleted when you logout
                </div>
              )}
              <button
                onClick={handleLogout}
                className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-all duration-300 mt-4 ${theme === "dark" ? "bg-red-700 hover:bg-red-800 text-red-100" : "bg-red-400 hover:bg-red-500 text-white"}`}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        )}

        <div
          className={`${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-blue-300"} border-b-2 p-4 transition-colors duration-300`}
        >
          {/* Top Row: Menu - Center - Profile */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <button
              onClick={() => setShowDrawer(!showDrawer)}
              className={`p-2 rounded-lg transition-all duration-300 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
            >
              <div className="space-y-1.5">
                <div className={`w-6 h-0.5 ${theme === "dark" ? "bg-white" : "bg-black"}`}></div>
                <div className={`w-6 h-0.5 ${theme === "dark" ? "bg-white" : "bg-black"}`}></div>
                <div className={`w-6 h-0.5 ${theme === "dark" ? "bg-white" : "bg-black"}`}></div>
              </div>
            </button>

            <h1 className="text-2xl font-bold flex-shrink-0">GhostChat</h1>

            <button
              onClick={() => setCurrentPage("profile")}
              className={`p-2 rounded-lg text-2xl transition-all duration-300 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
            >
              {selectedAvatar}
            </button>
          </div>

          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-300 ${theme === "dark" ? "bg-gray-700 border-cyan-400 text-white placeholder-gray-400 focus:border-cyan-300 focus:shadow-lg focus:shadow-cyan-500/20" : "bg-gray-100 border-blue-300 text-black placeholder-gray-600 focus:border-blue-300 focus:shadow-lg focus:shadow-blue-500/20"} focus:outline-none`}
          />
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredChats.length === 0 ? (
            <div className="text-center py-12 text-gray-500 fade-in">
              <div className="text-4xl mb-2">💬</div>
              <p>No chats yet. Create one or join using a code!</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setCurrentChat(chat.id)
                  loadChatMessages(chat.id)
                  setCurrentPage("chat")
                }}
                className={`p-4 rounded-lg cursor-pointer border-2 transition-all duration-300 ${theme === "dark" ? "bg-gray-800 border-cyan-500 hover:bg-gray-700 hover:shadow-lg hover:shadow-cyan-500/20" : "bg-white border-blue-300 hover:bg-gray-50 hover:shadow-lg hover:shadow-blue-500/10"}`}
              >
                <div className="font-bold text-lg mb-1">{chat.name}</div>
                <div className="text-sm mb-2 opacity-75">📌 {chat.code}</div>
                <div className="text-xs opacity-60">
                  👤 {chat.createdBy} • 👥 {chat.members.length} members
                </div>
              </div>
            ))
          )}
        </div>

        {/* FAB Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 fade-in">
          <button
            onClick={() => setShowCreateModal(true)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-xl transition-all duration-300 ${theme === "dark" ? "bg-green-600 hover:bg-green-700 hover:shadow-2xl hover:shadow-green-500/50" : "bg-green-500 hover:bg-green-600"}`}
          >
            +
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-xl transition-all duration-300 ${theme === "dark" ? "bg-blue-600 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/50" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            🔗
          </button>
        </div>

        {/* Create Chat Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 fade-in">
            <div
              className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} p-6 rounded-xl w-full max-w-sm transition-all duration-300 shadow-2xl`}
            >
              <h2 className="text-xl font-bold mb-4">Create New Chat</h2>
              <input
                type="text"
                placeholder="Chat name..."
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border-2 mb-4 transition-all duration-300 ${theme === "dark" ? "bg-gray-700 border-cyan-400 text-white focus:border-cyan-300" : "bg-gray-100 border-blue-400 text-black focus:border-blue-300"} focus:outline-none`}
              />
              <div className="flex gap-2">
                <button
                  onClick={createNewChat}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all duration-300 ${theme === "dark" ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"} text-white`}
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewChatName("")
                  }}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all duration-300 ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Join Chat Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 fade-in">
            <div
              className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} p-6 rounded-xl w-full max-w-sm transition-all duration-300 shadow-2xl`}
            >
              <h2 className="text-xl font-bold mb-4">Join Chat</h2>
              <input
                type="text"
                placeholder="Enter chat code..."
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border-2 mb-4 transition-all duration-300 ${theme === "dark" ? "bg-gray-700 border-cyan-400 text-white focus:border-cyan-300" : "bg-gray-100 border-blue-400 text-black focus:border-blue-300"} focus:outline-none`}
              />
              <div className="flex gap-2">
                <button
                  onClick={joinChat}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all duration-300 ${theme === "dark" ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} text-white`}
                >
                  Join
                </button>
                <button
                  onClick={() => {
                    setShowJoinModal(false)
                    setJoinCode("")
                  }}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all duration-300 ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {renderFooter()}
      </div>
    )
  }

  // Render chat page
  if (currentPage === "chat" && currentChat) {
    const chat = chats.find((c) => c.id === currentChat)
    if (!chat) return null

    return (
      <div
        className={`h-screen flex flex-col transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}
      >
        <div
          className={`${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-blue-300"} border-b-2 p-4 flex items-center justify-between transition-colors duration-300`}
        >
          <div className="flex-1">
            <h2 className="text-xl font-bold">{chat.name}</h2>
            <p className="text-sm opacity-75">📌 {chat.code}</p>
          </div>
          <button
            onClick={() => {
              setCurrentPage("lobby")
              setCurrentChat(null)
            }}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${theme === "dark" ? "bg-red-700 hover:bg-red-800" : "bg-red-500 hover:bg-red-600"} text-white`}
          >
            Leave
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500 fade-in">
              <div className="text-4xl mb-2">💭</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-800 border-l-4 border-cyan-500" : "bg-white border-l-4 border-blue-400 shadow-sm"} transition-all duration-300 animate-fadeIn`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{msg.avatar}</span>
                  <span className="font-bold">{msg.username}</span>
                  <span className="text-xs opacity-50">{msg.timestamp}</span>
                </div>
                <p className="ml-8">
                  {msg.isFile ? (
                    <span className="text-blue-400 font-medium">
                      📎 {msg.text} ({msg.fileSize} KB)
                    </span>
                  ) : (
                    msg.text
                  )}
                </p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div
          className={`${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-blue-300"} border-t-2 p-4 transition-all duration-300 ${keyboardVisible ? "pb-6" : ""}`}
        >
          {/* File Sharing and Emoji Picker */}
          <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
            <label
              className={`px-3 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-all duration-300 ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} whitespace-nowrap text-sm`}
            >
              📎 Share File
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`px-3 py-2 rounded-lg transition-all duration-300 ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} text-sm`}
            >
              😊 Emoji
            </button>
          </div>

          {/* Emoji Picker Popup */}
          {showEmojiPicker && (
            <div
              className={`grid grid-cols-4 gap-2 p-3 rounded-lg mb-3 transition-all duration-300 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
            >
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setMessageInput(messageInput + emoji)
                    setShowEmojiPicker(false)
                  }}
                  className="text-2xl p-2 hover:bg-gray-600 rounded transition-all duration-200"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Message Input */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              onFocus={() => setKeyboardVisible(true)}
              onBlur={() => setKeyboardVisible(false)}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-300 ${theme === "dark" ? "bg-gray-700 border-cyan-400 text-white placeholder-gray-400 focus:border-cyan-300 focus:shadow-lg focus:shadow-cyan-500/20" : "bg-white border-blue-400 text-black placeholder-gray-600 focus:border-blue-300 focus:shadow-lg focus:shadow-blue-500/20"} focus:outline-none`}
            />
            <button
              onClick={sendMessage}
              className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${theme === "dark" ? "bg-cyan-500 hover:bg-cyan-600 text-gray-900 hover:shadow-lg hover:shadow-cyan-500/30" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
            >
              Send
            </button>
          </div>
        </div>
        {renderFooter()}
      </div>
    )
  }

  // Render profile page
  if (currentPage === "profile") {
    return (
      <div
        className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}
      >
        <div
          className={`${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-blue-300"} border-b-2 p-4`}
        >
          <button
            onClick={() => setCurrentPage("lobby")}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"}`}
          >
            ← Back
          </button>
        </div>
        <div
          className={`max-w-md mx-auto mt-8 p-6 rounded-xl border-2 transition-all duration-300 ${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-blue-400 shadow-lg"}`}
        >
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{selectedAvatar}</div>
            <h2 className="text-2xl font-bold mb-2">{currentUser}</h2>
            <p className="capitalize font-medium">{userRole}</p>
          </div>
          <div className="space-y-3">
            <label className="block">
              <span className="block mb-3 font-semibold">Change Avatar</span>
              <div className="grid grid-cols-4 gap-2">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => {
                      setSelectedAvatar(avatar)
                      const user = JSON.parse(localStorage.getItem("ghostchat_user"))
                      user.avatar = avatar
                      localStorage.setItem("ghostchat_user", JSON.stringify(user))
                    }}
                    className={`text-3xl p-3 rounded-lg transition-all duration-300 ${selectedAvatar === avatar ? (theme === "dark" ? "bg-cyan-500 shadow-lg shadow-cyan-500/30" : "bg-blue-500") : theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </label>
          </div>
        </div>
        {renderFooter()}
      </div>
    )
  }

  // Render settings page
  if (currentPage === "settings") {
    return (
      <div
        className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}
      >
        <div
          className={`${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-blue-300"} border-b-2 p-4`}
        >
          <button
            onClick={() => setCurrentPage("lobby")}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"}`}
          >
            ← Back
          </button>
        </div>
        <div className="max-w-md mx-auto mt-8 p-6 space-y-6">
          <h2 className="text-2xl font-bold">Settings</h2>

          {/* Theme Settings */}
          <div>
            <label className="block mb-2 font-semibold">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border-2 transition-all duration-300 ${theme === "dark" ? "bg-gray-700 border-cyan-400 text-white focus:border-cyan-300" : "bg-gray-100 border-blue-400 text-black focus:border-blue-300"} focus:outline-none`}
            >
              <option value="dark">🌙 Dark (Cyber)</option>
              <option value="light">☀️ Light</option>
            </select>
          </div>

          {/* Change Username */}
          <div>
            <button
              onClick={() => setShowChangeUsername(!showChangeUsername)}
              className={`w-full py-2 rounded-lg font-medium transition-all duration-300 ${theme === "dark" ? "bg-blue-700 hover:bg-blue-800" : "bg-blue-500 hover:bg-blue-600"} text-white`}
            >
              {showChangeUsername ? "Hide" : "Change Username"}
            </button>
            {showChangeUsername && (
              <div className="mt-3 space-y-2">
                <input
                  type="text"
                  placeholder="New username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border-2 transition-all duration-300 ${theme === "dark" ? "bg-gray-700 border-cyan-400 text-white focus:border-cyan-300" : "bg-gray-100 border-blue-400 text-black focus:border-blue-300"} focus:outline-none`}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleChangeUsername}
                    className={`flex-1 py-2 rounded-lg font-bold transition-all duration-300 ${theme === "dark" ? "bg-green-700 hover:bg-green-800" : "bg-green-500 hover:bg-green-600"} text-white`}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowChangeUsername(false)
                      setNewUsername("")
                    }}
                    className={`flex-1 py-2 rounded-lg font-bold transition-all duration-300 ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Change Password */}
          {!isGuest && (
            <div>
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className={`w-full py-2 rounded-lg font-medium transition-all duration-300 ${theme === "dark" ? "bg-blue-700 hover:bg-blue-800" : "bg-blue-500 hover:bg-blue-600"} text-white`}
              >
                {showChangePassword ? "Hide" : "Change Password"}
              </button>
              {showChangePassword && (
                <div className="mt-3 space-y-2">
                  <input
                    type="password"
                    placeholder="Old password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border-2 transition-all duration-300 ${theme === "dark" ? "bg-gray-700 border-cyan-400 text-white focus:border-cyan-300" : "bg-gray-100 border-blue-400 text-black focus:border-blue-300"} focus:outline-none`}
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border-2 transition-all duration-300 ${theme === "dark" ? "bg-gray-700 border-cyan-400 text-white focus:border-cyan-300" : "bg-gray-100 border-blue-400 text-black focus:border-blue-300"} focus:outline-none`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleChangePassword}
                      className={`flex-1 py-2 rounded-lg font-bold transition-all duration-300 ${theme === "dark" ? "bg-green-700 hover:bg-green-800" : "bg-green-500 hover:bg-green-600"} text-white`}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowChangePassword(false)
                        setOldPassword("")
                        setNewPassword("")
                      }}
                      className={`flex-1 py-2 rounded-lg font-bold transition-all duration-300 ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {renderFooter()}
      </div>
    )
  }

  // Render manage chats page
  if (currentPage === "managechats") {
    const userChats = chats.filter((c) => c.createdBy === currentUser)
    return (
      <div
        className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}
      >
        <div
          className={`${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-blue-300"} border-b-2 p-4`}
        >
          <button
            onClick={() => setCurrentPage("lobby")}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"}`}
          >
            ← Back
          </button>
        </div>
        <div className="max-w-2xl mx-auto p-6">
          <h2 className="text-2xl font-bold mb-6">Manage Chats</h2>
          {userChats.length === 0 ? (
            <p className="text-gray-500">You haven't created any chats yet.</p>
          ) : (
            <div className="space-y-3">
              {userChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-4 rounded-lg border-2 flex items-center justify-between transition-all duration-300 ${theme === "dark" ? "bg-gray-800 border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20" : "bg-white border-blue-300 hover:shadow-lg"}`}
                >
                  <div>
                    <h3 className="font-bold">{chat.name}</h3>
                    <p className="text-sm opacity-75">📌 {chat.code}</p>
                  </div>
                  <button
                    onClick={() => deleteChat(chat.id)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${theme === "dark" ? "bg-red-700 hover:bg-red-800" : "bg-red-500 hover:bg-red-600"} text-white`}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {renderFooter()}
      </div>
    )
  }

  // Render admin panel
  if (currentPage === "admin") {
    const users = JSON.parse(localStorage.getItem("ghostchat_users") || "[]")
    const guestUsers = JSON.parse(localStorage.getItem("ghostchat_guest_users") || "[]")
    const allUsers = [...users, ...guestUsers]
    const guestHistory = JSON.parse(localStorage.getItem("ghostchat_guest_history") || "[]")

    // Show chat details page
    if (selectedChatId !== null && viewingUserChats !== null) {
      const userCreatedChats = chats.filter((c) => c.createdBy === viewingUserChats)
      const userJoinedChats = chats.filter(
        (c) => c.members?.includes(viewingUserChats) && c.createdBy !== viewingUserChats,
      )
      const userDeletedChats = deletedChats.filter((c) => c.createdBy === viewingUserChats)
      const allUserChats = [...userCreatedChats, ...userJoinedChats, ...userDeletedChats]
      const chatData = allUserChats.find((c) => c.id === selectedChatId)

      if (!chatData) {
        return (
          <div
            className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}
          >
            <div
              className={`${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-blue-300"} border-b-2 p-4`}
            >
              <button
                onClick={() => setSelectedChatId(null)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"}`}
              >
                ← Back to Chats
              </button>
            </div>
            {renderFooter()}
          </div>
        )
      }

      const chatName = typeof chatData.name === "string" ? chatData.name : "Unnamed"
      const chatCode = typeof chatData.code === "string" ? chatData.code : "N/A"
      const chatCreatedBy = typeof chatData.createdBy === "string" ? chatData.createdBy : "Unknown"
      const chatCreatedAt = typeof chatData.createdAt === "string" ? chatData.createdAt : "N/A"
      const chatMembers = Array.isArray(chatData.members) ? chatData.members : []
      const chatMessages = Array.isArray(chatData.messages) ? chatData.messages : []

      return (
        <div
          className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}
        >
          <div
            className={`${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-blue-300"} border-b-2 p-4`}
          >
            <button
              onClick={() => setSelectedChatId(null)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"}`}
            >
              ← Back to Chats
            </button>
          </div>
          <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">{chatName}</h2>
            <div
              className={`p-4 rounded-lg border-2 mb-6 ${theme === "dark" ? "bg-gray-800 border-purple-500" : "bg-white border-purple-400"}`}
            >
              <div className="text-sm opacity-75">📌 Code: {chatCode}</div>
              <div className="text-sm opacity-75">👤 Created by: {chatCreatedBy}</div>
              <div className="text-sm opacity-75">📅 Created: {chatCreatedAt}</div>
              <div className="text-sm opacity-75">
                👥 Members ({chatMembers.length}): {chatMembers.length > 0 ? chatMembers.join(", ") : "None"}
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4">Messages ({chatMessages.length})</h3>
            <div className="space-y-3">
              {chatMessages.length === 0 ? (
                <p className="text-gray-500">No messages in this chat.</p>
              ) : (
                chatMessages.map((msg) => {
                  const msgUsername = typeof msg.username === "string" ? msg.username : "Unknown"
                  const msgText = typeof msg.text === "string" ? msg.text : "[Message]"
                  const msgTimestamp = typeof msg.timestamp === "string" ? msg.timestamp : ""
                  const msgAvatar = typeof msg.avatar === "string" ? msg.avatar : "👤"
                  const msgFileName = typeof msg.fileName === "string" ? msg.fileName : "file"

                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-lg border-l-4 ${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-blue-400"}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{msgAvatar}</span>
                        <span className="font-bold">{msgUsername}</span>
                        <span className="text-xs opacity-50">{msgTimestamp}</span>
                      </div>
                      <p className="ml-8">{msg.isFile ? `📎 ${msgFileName}` : msgText}</p>
                    </div>
                  )
                })
              )}
            </div>
          </div>
          {renderFooter()}
        </div>
      )
    }

    // Show user's created/joined/deleted chats
    if (viewingUserChats !== null) {
      const selectedUserData = allUsers.find((u) => u.username === viewingUserChats)
      if (!selectedUserData) {
        return (
          <div
            className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}
          >
            <div
              className={`${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-blue-300"} border-b-2 p-4`}
            >
              <button
                onClick={() => setViewingUserChats(null)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"}`}
              >
                ← Back to Users
              </button>
            </div>
            {renderFooter()}
          </div>
        )
      }

      const userCreatedChats = chats.filter((c) => c.createdBy === viewingUserChats)
      const userJoinedChats = chats.filter(
        (c) => c.members?.includes(viewingUserChats) && c.createdBy !== viewingUserChats,
      )
      const userDeletedChats = deletedChats.filter((c) => c.createdBy === viewingUserChats)
      const selectedUsername = typeof selectedUserData.username === "string" ? selectedUserData.username : "User"

      return (
        <div
          className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}
        >
          <div
            className={`${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-blue-300"} border-b-2 p-4`}
          >
            <button
              onClick={() => setViewingUserChats(null)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"}`}
            >
              ← Back to Users
            </button>
          </div>
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            <h2 className="text-2xl font-bold">{selectedUsername}'s Chats</h2>

            <div>
              <h3 className="text-xl font-bold mb-4 text-green-500">✅ Created ({userCreatedChats.length})</h3>
              {userCreatedChats.length === 0 ? (
                <p className="text-gray-500">None</p>
              ) : (
                <div className="space-y-3">
                  {userCreatedChats.map((chat) => {
                    const cName = typeof chat.name === "string" ? chat.name : "Unnamed"
                    const cCode = typeof chat.code === "string" ? chat.code : "N/A"
                    const msgCount = Array.isArray(chat.messages) ? chat.messages.length : 0

                    return (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChatId(chat.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${theme === "dark" ? "bg-gray-800 border-green-500 hover:bg-gray-700" : "bg-white border-green-400 hover:bg-gray-50"}`}
                      >
                        <div className="font-bold">{cName}</div>
                        <div className="text-sm opacity-75">📌 {cCode}</div>
                        <div className="text-sm opacity-75">💬 {msgCount} messages</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-500">🔗 Joined ({userJoinedChats.length})</h3>
              {userJoinedChats.length === 0 ? (
                <p className="text-gray-500">None</p>
              ) : (
                <div className="space-y-3">
                  {userJoinedChats.map((chat) => {
                    const cName = typeof chat.name === "string" ? chat.name : "Unnamed"
                    const cCode = typeof chat.code === "string" ? chat.code : "N/A"
                    const cCreatedBy = typeof chat.createdBy === "string" ? chat.createdBy : "Unknown"

                    return (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChatId(chat.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${theme === "dark" ? "bg-gray-800 border-blue-500 hover:bg-gray-700" : "bg-white border-blue-400 hover:bg-gray-50"}`}
                      >
                        <div className="font-bold">{cName}</div>
                        <div className="text-sm opacity-75">📌 {cCode}</div>
                        <div className="text-sm opacity-75">Created by: {cCreatedBy}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-red-500">🗑️ Deleted ({userDeletedChats.length})</h3>
              {userDeletedChats.length === 0 ? (
                <p className="text-gray-500">None</p>
              ) : (
                <div className="space-y-3">
                  {userDeletedChats.map((chat) => {
                    const cName = typeof chat.name === "string" ? chat.name : "Unnamed"
                    const cCode = typeof chat.code === "string" ? chat.code : "N/A"
                    const cDeletedAt = typeof chat.deletedAt === "string" ? chat.deletedAt : "N/A"

                    return (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChatId(chat.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${theme === "dark" ? "bg-red-900 border-red-500 hover:bg-red-800" : "bg-red-100 border-red-400 hover:bg-red-50"}`}
                      >
                        <div className="font-bold">{cName}</div>
                        <div className="text-sm opacity-75">📌 {cCode}</div>
                        <div className="text-sm opacity-75">Deleted: {cDeletedAt}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          {renderFooter()}
        </div>
      )
    }

    // Main admin panel - show users
    return (
      <div
        className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}
      >
        <div
          className={`${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-blue-300"} border-b-2 p-4`}
        >
          <button
            onClick={() => setCurrentPage("lobby")}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"}`}
          >
            ← Back to Lobby
          </button>
        </div>
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="text-3xl font-bold mb-8">🛡️ Admin Panel</h2>

          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-cyan-500">👥 Users ({allUsers.length})</h3>
            {allUsers.length === 0 ? (
              <p className="text-gray-500">No users yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allUsers.map((user) => {
                  const userName = typeof user.username === "string" ? user.username : "Unknown"
                  const userRole = typeof user.role === "string" ? user.role : "user"
                  const userAvatar = typeof user.avatar === "string" ? user.avatar : "👤"
                  const userChatCount = chats.filter(
                    (c) => (c.members && c.members.includes(userName)) || c.createdBy === userName,
                  ).length
                  const userMessages = chats.reduce(
                    (sum, c) => sum + (c.messages || []).filter((m) => m.username === userName).length,
                    0,
                  )

                  return (
                    <div
                      key={userName}
                      onClick={() => setViewingUserChats(userName)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${user.isDeletedGuest ? (theme === "dark" ? "bg-orange-900 border-orange-500" : "bg-orange-100 border-orange-400") : theme === "dark" ? "bg-gray-800 border-cyan-500 hover:bg-gray-700" : "bg-white border-blue-300 hover:bg-gray-50"}`}
                    >
                      <div className="font-bold text-lg mb-3 flex items-center gap-2">
                        <span className="text-2xl">{userAvatar}</span>
                        <span className="flex-1 truncate">{userName}</span>
                        {user.isDeletedGuest && (
                          <span className="text-xs bg-red-600 px-2 py-1 rounded whitespace-nowrap">Deleted</span>
                        )}
                      </div>
                      <div className="space-y-2 text-sm opacity-75">
                        <div>Role: {userRole}</div>
                        <div>Chats: {userChatCount}</div>
                        <div>Messages: {userMessages}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-cyan-500">
              💬 Active Chats ({chats.length})
            </h3>
            {chats.length === 0 ? (
              <p className="text-gray-500">No active chats.</p>
            ) : (
              <div className="space-y-2">
                {chats.map((chat) => {
                  const cName = typeof chat.name === "string" ? chat.name : "Unnamed"
                  const cCode = typeof chat.code === "string" ? chat.code : "N/A"
                  const cCreatedBy = typeof chat.createdBy === "string" ? chat.createdBy : "Unknown"
                  const cMembers = Array.isArray(chat.members) ? chat.members : []
                  const cMessages = Array.isArray(chat.messages) ? chat.messages : []

                  return (
                    <div
                      key={chat.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-blue-300"}`}
                    >
                      <div className="font-bold">{cName}</div>
                      <div className="text-sm opacity-75">
                        📌 {cCode} • 👤 {cCreatedBy} • 👥 {cMembers.length} members • 💬 {cMessages.length} messages
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-red-500">
              🗑️ Deleted Chats ({deletedChats.length})
            </h3>
            {deletedChats.length === 0 ? (
              <p className="text-gray-500">No deleted chats.</p>
            ) : (
              <div className="space-y-2">
                {deletedChats.map((chat) => {
                  const cName = typeof chat.name === "string" ? chat.name : "Unnamed"
                  const cCode = typeof chat.code === "string" ? chat.code : "N/A"
                  const cCreatedBy = typeof chat.createdBy === "string" ? chat.createdBy : "Unknown"
                  const cDeletedAt = typeof chat.deletedAt === "string" ? chat.deletedAt : "N/A"

                  return (
                    <div
                      key={chat.id}
                      className={`p-4 rounded-lg border-2 flex items-center justify-between transition-all duration-300 ${theme === "dark" ? "bg-red-900 border-red-500" : "bg-red-100 border-red-400"}`}
                    >
                      <div className="flex-1">
                        <div className="font-bold">{cName}</div>
                        <div className="text-sm opacity-75">
                          📌 {cCode} • 👤 {cCreatedBy}
                        </div>
                        <div className="text-sm opacity-75">Deleted: {cDeletedAt}</div>
                      </div>
                      <button
                        onClick={() => restoreDeletedChat(chat.id)}
                        className={`px-4 py-2 rounded transition-all duration-300 ${theme === "dark" ? "bg-green-700 hover:bg-green-800" : "bg-green-500 hover:bg-green-600"} text-white whitespace-nowrap`}
                      >
                        Restore
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-orange-500">
              👻 Guest Sessions ({guestHistory.length})
            </h3>
            {guestHistory.length === 0 ? (
              <p className="text-gray-500">No guest sessions yet.</p>
            ) : (
              <div className="space-y-2">
                {guestHistory.map((session, idx) => {
                  const sessionGuestId = typeof session.guestId === "string" ? session.guestId : "Guest"
                  const sessionAvatar = typeof session.guestAvatar === "string" ? session.guestAvatar : "👻"
                  const sessionLoginTime = typeof session.loginTime === "string" ? session.loginTime : "N/A"
                  const sessionDeletedAt = typeof session.deletedAt === "string" ? session.deletedAt : "N/A"
                  const sessionChatsCreated = typeof session.chatsCreated === "number" ? session.chatsCreated : 0
                  const sessionChatsJoined = typeof session.chatsJoined === "number" ? session.chatsJoined : 0
                  const sessionMessages = typeof session.messagesCount === "number" ? session.messagesCount : 0

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${theme === "dark" ? "bg-orange-900 border-orange-500" : "bg-orange-100 border-orange-400"}`}
                    >
                      <div className="font-bold flex items-center gap-2 mb-2">
                        <span className="text-2xl">{sessionAvatar}</span>
                        {sessionGuestId}
                      </div>
                      <div className="text-sm opacity-75 grid grid-cols-2 gap-2">
                        <div>⏰ Login: {sessionLoginTime}</div>
                        <div>⏰ Deleted: {sessionDeletedAt}</div>
                        <div>Created: {sessionChatsCreated} chats</div>
                        <div>Joined: {sessionChatsJoined} chats</div>
                        <div className="col-span-2">📝 Messages: {sessionMessages}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        {renderFooter()}
      </div>
    )
  }
}

export default App
