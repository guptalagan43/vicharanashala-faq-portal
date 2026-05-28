import React from 'react';
import YakshaChat from '../components/YakshaChat';
import '../styles/chat.css';
import '../reference.css';

export const ChatPage: React.FC = () => {
  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* We pass isModal=false so it renders the regular sidebar DOM, but we style it to fill the page */}
        <YakshaChat isModal={false} onClose={() => {}} />
      </div>
    </div>
  );
};
