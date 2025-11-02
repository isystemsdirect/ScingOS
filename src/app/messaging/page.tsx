
'use client';
import { Channel, ChannelHeader, ChannelList, MessageInput, MessageList, Thread, Window } from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';

const MessagingPage = () => {
    return (
        <div className="h-full">
            <ChannelList />
            <Channel>
                <Window>
                    <ChannelHeader />
                    <MessageList />
                    <MessageInput />
                </Window>
                <Thread />
            </Channel>
        </div>
    );
};

export default MessagingPage;
