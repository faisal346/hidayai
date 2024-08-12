'use client'
import Image from 'next/image';
import { Box, Stack, TextField, Button } from '@mui/material'
import { useState } from 'react'

export default function Home() {
  const [heading] = useState('FoodFinder');
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hi welcome to FoodFinder: your trusted restaurant finding service, how can I assist you today?',
  }]);

  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    const userMessage = message;
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: userMessage },
    ]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: userMessage }]),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    const processText = async ({ done, value }) => {
      if (done) {
        return result;
      }

      const text = decoder.decode(value || new Int8Array(), { stream: true });
      console.log("Received text:", text); // Add this line for debugging
      setMessages((messages) => {
        const lastMessage = messages[messages.length - 1];
        const otherMessages = messages.slice(0, messages.length - 1);
        if (lastMessage.role === 'assistant') {
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text }
          ];
        }
        return [
          ...messages,
          { role: 'assistant', content: text }
        ];
      });

      return reader.read().then(processText);
    }

    reader.read().then(processText);
  }

  return (

    <Stack spacing={1} sx={{ bgcolor: '#F5EEDC' }}>
      {/* Changed: Added bgcolor: '#C0392B'. Previously, no background color was set for this Stack */}
      <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
        <Image
          src="/foodfinder.png"
          alt="Logo"
          width={100}
          height={100}
          priority
        />
      </Box>
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <h1 style={{ fontFamily: "'Montserrat', sans-serif" }}>{heading}</h1>
      </Box>

    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#66B2B2"
      p={2}
    >
      {/* Changed: bgcolor from "#f0f0f0" to "#F4D03F" */}
      <Stack
        direction="column"
        width="600px"
        height="700px"
        bgcolor="white"
        borderRadius={2}
        boxShadow={3}
        p={2}
        spacing={2}
        justifyContent="space-between"
      >
        <Stack
          direction="column"
          spacing={2}
          overflow="auto"
          flexGrow={1}
        >
          {messages.map((message, index) => (
            <Box 
              key={index}
              display='flex'
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                  ? 'primary.main'
                  : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={2}
                maxWidth="80%"
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Message"
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" size="large" onClick={sendMessage}>Send</Button>
        </Stack>
      </Stack>
      </Box>
    </Stack>
  )
}
