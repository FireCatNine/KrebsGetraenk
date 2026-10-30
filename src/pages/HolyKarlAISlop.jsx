import React, { useState } from 'react';
import '../styles/karl.css';

import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

export default function KarlChatbot(){
  const WORKER_URL= import.meta.env.VITE_KARL_WORKER_URL;

  const [messages, setMessages]= useState([
    { role: 'user', text: "Kaarl, da liegt ein toter Mensch in unserm Verlauf!" },
    { role: 'karl', text: "Ohh heey; wie kommt der denn hier rein?." },
    { role: 'user', text: "Kaarl, was hast du getan?!" },
    { role: 'karl', text: "Ich, äh, ich wars nicht." },
    { role: 'user', text: "Erzähl mir was passiert ist, Karl!" },
    { role: 'karl', text: "E = mc^2 \\pm \\text{Zufall}" },
    { role: 'user', text: "Erzähl mir was passiert ist, Karl!" }
  ]);
  const [inputText, setInputText]= useState("");
  const [isLoading, setIsLoading]= useState(false);

  const send= async()=> {
    const text= inputText.trim();
    if(!text|| isLoading) return;
    setIsLoading(true);
    setInputText("")
    const userMsg= { role: 'user', text: text};
    const loadingMsg= { role: 'karl', text: "..."};
    setMessages((prev)=> [...prev, userMsg, loadingMsg]);
    try{
      const response= await fetch(WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: text })
      });
      if(!response.ok){
        throw new Error(response.status);
      }
      const data= await response.json();
      setMessages((prev)=> {
        const updated= [...prev];
        updated[updated.length- 1]= { role: 'karl', text: data.response };
        return updated;
      });
    } catch(e){
      console.error("Fehler beim Abrufen des Cloudflare Workers:", e);
      setMessages((prev)=> {
        const updated= [...prev];
        updated[updated.length- 1]= { 
          role: 'karl', 
          text: "Ups, something is wrong gegoed." 
        };
        return updated;
      });
    }
    setIsLoading(false);
  }
  const enter= (e)=> {
    if(e.key=== "Enter"){
      send();
    }
  }







  const renderMessageContent= (msg)=> { 
    if (!msg.text) return '';
    if (msg.isMath){
      return <BlockMath math={msg.text} />;
    }
    const parts= msg.text.split(/(\$.*?\$)/g);
    return parts.map((part, index)=> {
      if (part.startsWith('$') && part.endsWith('$')){
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
        <input 
          className="chat-input" 
          type="text" 
          placeholder="Kaaarl..." 
          value={inputText}
          onChange= {(e)=> setInputText(e.target.value)}
          onKeyDown= {enter}
          disabled= {isLoading}
        />
        <button className="send-button" onClick={send} disabled={isLoading}>Senden</button>
      </footer>
    </div>
  );
}
