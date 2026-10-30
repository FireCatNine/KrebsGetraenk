import React, { useState, useRef, useEffect } from 'react';
import '../styles/karl.css';
// Mathe Dings zeigen-> LaTeX oder KaTeX für CSS

export default function KarlChatbot() {
  const WORKER_URL= import.meta.env.VITE_KARL_WORKER_URL;

  const [messages]= useState([
    { role: 'user', text: "Kaarl, da liegt ein toter Mensch in unserm Verlauf!" },
    { role: 'karl', text: "Ohh heey; wie kommt der denn hier rein?." },
    { role: 'user', text: "Kaarl, was hast du getan?!"},
    { role: 'karl', text: "Ich, äh, ich wars nicht."},
    { role: 'user', text: "Erzähl mir was passiert ist, Karl!"}
  ]);



  return (
    <div className="karl-chat">
      <div className="chat-area">
        {messages.map((msg, index)=> (
          <div key={index} className={`msg ${msg.role}`}>
            <div className="owner">{msg.role=== 'user'? 'PAUL?': 'KARL'}</div>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>

      <div className="hint">Holy Karl AI Slop läuft über Cloudflare Workers AI.</div>
       <footer>
        <input className="chat-input" type="text" placeholder="Kaaarl..."/>
        <button className="send-button">Senden</button>
      </footer>
    </div>
  );
}
