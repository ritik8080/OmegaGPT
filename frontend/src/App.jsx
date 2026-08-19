import { useContext, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import AuthScreen from './components/AuthScreen';
import { ChatContext } from './context/ChatContext';
import { AuthContext } from './context/AuthContext';

function App() {
  const { createNewChat, threads, threadsLoaded, selectThread, currentThreadId, sidebarOpen, setSidebarOpen } = useContext(ChatContext);
  const { user, login } = useContext(AuthContext);

  useEffect(() => {
    // Check for OAuth token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('token');
    if (oauthToken) {
      login({ token: oauthToken });
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  useEffect(() => {
    if (user && threadsLoaded) {
      if (threads.length === 0) {
        createNewChat();
      } else if (threads.length > 0 && !currentThreadId) {
        selectThread(threads[0].threadId);
      }
    }
  }, [threadsLoaded, threads, user, currentThreadId, createNewChat, selectThread]);

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="app-container">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
      <Sidebar />
      <ChatWindow />
    </div>
  );
}

export default App;
