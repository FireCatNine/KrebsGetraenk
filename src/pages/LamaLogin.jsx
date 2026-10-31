import { useState } from 'react';

const A= "C6H10N4O2<->";
const B= "04c7794f50b61cac66effe196207a0a9ac1f595527fbabcfc29dc48fa9f72ec6";

async function sha256Hex(text) {
  const buf= await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b=> b.toString(16).padStart(2, "0")).join("");
}

export default function LamaLogin({ onAuthenticated }) {
  const [passwordInput, setPasswordInput]= useState("");
  const [loginError, setLoginError]= useState(false);
  const [checking, setChecking]= useState(false);

  const handleLogin= async (e)=> {
    e.preventDefault();
    if (checking) return;
    setChecking(true);
    setLoginError(false);

    const hash= await sha256Hex(`${A}:${passwordInput}`);
    if (hash=== B) {
      localStorage.setItem('karl_auth', 'true');
      onAuthenticated();
    } else {
      setLoginError(true);
      setPasswordInput("");
    }
    setChecking(false);
  };

  return (
    <div className="karl-auth-container">
      <form className="karl-auth-box" onSubmit={handleLogin}>
        <h2>Lamalogin</h2>
        <p>Bitte gib das Passwort ein, um auf Karl zuzugreifen.</p>
        <input
          type="password"
          className="chat-input"
          placeholder="Passwort..."
          value={passwordInput}
          onChange={(e)=> setPasswordInput(e.target.value)}
          autoFocus
        />
        {loginError && <div className="auth-error">Falsches Passwort, Paul!</div>}
        <button type="submit" className="send-button" style={{ marginTop: '12px', width: '100%' }} disabled={checking}>
          Entsperren
        </button>
      </form>
      <br></br>
       <section className="karl-disclaimer-box">
        <h2>Disclaimer & Triggerwarnung</h2>
        <p>Bitte beachte:</p>
        <p>
          Karl ist ein fiktives, soziopathisches Lama aus der Satire-Serie „Lamas mit Hüten“. Seine Antworten 
          enthalten tiefschwarzen Humor sowie explizite und absurde Darstellungen von Gewalt. 
          <br></br>
          Dieser Chatbot dient ausschließlich der Unterhaltung und Satire. 
          Dennoch könnten manche dieser Aussagen auf Dich verstörend wirken oder Dich emotional belasten. 

        </p>
        <p style={{ color: '#ffa8a8' }}>
          <strong>
            Sollten Dich diese Inhalte belasten, beende dieses Experiment sofort und wende Dich an einen Arzt, 
            einen Psychologen oder eine Vertrauensperson!
          </strong>
        </p>
        <p>
          Aus diesen Gründen ist Karl nur mit Einvernehmen der Entwickler zu nutzen und somit hinter einem Passwort geschützt.
        </p>
        <br></br>
        <p>Das Passwort wird gespeichert; um es zu löschen und sich abzumelden einfach „Logout“ schreiben und senden.</p>
      </section>
    </div>
  );
}