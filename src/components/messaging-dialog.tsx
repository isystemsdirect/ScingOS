'use client';
import React, { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat, Channel, Window, ChannelHeader, MessageList, MessageInput, Thread, LoadingIndicator } from 'stream-chat-react';
import { useMessagingStore } from '@/lib/stores/messaging-store';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || '';

const MessagingDialog = () => {
  const { isOpen, closeDialog, targetUser } = useMessagingStore();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  useEffect(() => {
    if (!isOpen || chatClient) return;

    const initChat = async () => {
      if (!apiKey) {
        console.error("Stream API key is missing.");
        return;
      }

      const client = StreamChat.getInstance(apiKey);
      await client.connectUser(
        {
          id: 'john-doe', // This should be the current user's ID
          name: 'John Doe',
          image: 'https://getstream.io/random_png/?id=john-doe&name=John+Doe',
        },
        client.devToken('john-doe') // In production, use a server-generated token
      );
      setChatClient(client);
    };

    initChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
        setChatClient(null);
      }
    };
  }, [isOpen, chatClient]);

  useEffect(() => {
    if (chatClient && targetUser?.id) {
      const startChat = async () => {
        const channel = chatClient.channel('messaging', {
          members: ['john-doe', targetUser.id],
          name: `Chat with ${targetUser.name}`,
        });
        await channel.watch();
      };
      startChat();
    }
  }, [chatClient, targetUser]);


  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        {!chatClient ? (
          <div className="flex items-center justify-center h-full">
            <LoadingIndicator />
          </div>
        ) : (
          <Chat client={chatClient} theme="str-chat__theme-dark">
            <Channel>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { MessagingDialog };
