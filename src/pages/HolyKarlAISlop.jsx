import React, { useState } from 'react';
import '../styles/karl.css';

import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

export default function KarlChatbot() {
  const WORKER_URL= import.meta.env.VITE_KARL_WORKER_URL;

  const [messages]= useState([
    { role: 'user', text: "Kaarl, da liegt ein toter Mensch in unserm Verlauf!" },
    { role: 'karl', text: "Ohh heey; wie kommt der denn hier rein?." },
    { role: 'user', text: "Kaarl, was hast du getan?!" },
    { role: 'karl', text: "Ich, äh, ich wars nicht." },
    { role: 'user', text: "Erzähl mir was passiert ist, Karl!" },
    { role: 'karl', isMath: true, text: "E = mc^2 \\pm \\text{Zufall}" },
    { role: 'user', text: "Erzähl mir was passiert ist, Karl!" }
  ]);

  const renderMessageContent= (msg)=> { 
    if (!msg.text) return '';
    if (msg.isMath) {
      return <BlockMath math={msg.text} />;
    }
    const parts= msg.text.split(/(\$.*?\$)/g);
    return parts.map((part, index)=> {
      if (part.startsWith('$') && part.endsWith('$')) {
        const mathExpression= part.slice(1, -1);
        return <InlineMath key={index} math={mathExpression} />;
      }
      return part;
    });
  };

  return (
    <div className="karl-chat">
      <div className="chat-area">
        {messages.map((msg, index)=> (
          <div key={index} className={`msg ${msg.role}`}>
            <div className="owner">{msg.role=== 'user' ? 'PAUL?' : 'KARL'}</div>
            <span>{renderMessageContent(msg)}</span>
          </div>
        ))}
      </div>

      <div className="hint">Holy Karl AI Slop läuft über Cloudflare Workers AI.</div>
      <footer>
        <input className="chat-input" type="text" placeholder="Kaaarl..." />
        <button className="send-button">Senden</button>
      </footer>
    </div>
  );
}
