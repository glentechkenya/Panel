import { useState } from "react";

export default function Home() {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  async function sendTest(e) {
    e.preventDefault();
    setReply("Sending...");
    try {
      const res = await fetch("/api/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, message })
      });
      const data = await res.json();
      setReply(data.reply || JSON.stringify(data));
    } catch (err) {
      setReply("Error: " + err.message);
    }
  }

  return (
    <div style={{
      fontFamily: "system-ui, sans-serif",
      padding: "2rem",
      background: "#f9fafb",
      minHeight: "100vh"
    }}>
      <h1>Glenpanel</h1>
      <p>This is your WhatsApp bot control panel.</p>

      <form onSubmit={sendTest} style={{ marginTop: "1rem" }}>
        <div>
          <label>To (WhatsApp number, e.g. whatsapp:+2547xxxxxxx)</label><br />
          <input
            type="text"
            value={to}
            onChange={e => setTo(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
        </div>
        <div>
          <label>Message</label><br />
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
        </div>
        <button type="submit" style={{
          padding: "0.6rem 1rem",
          background: "#111827",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}>
          Send Test
        </button>
      </form>

      {reply && (
        <div style={{
          marginTop: "1rem",
          padding: "0.75rem",
          background: "#e5e7eb",
          borderRadius: "6px"
        }}>
          <strong>Bot reply:</strong> {reply}
        </div>
      )}

      <div style={{ marginTop: "2rem" }}>
        <p>Webhook (Twilio): <code>/api/webhook/twilio</code></p>
        <p>Test send: <code>/api/test-send</code></p>
        <p>
          Configure your Twilio WhatsApp sandbox or number to point to<br />
          <code>https://your-vercel-app.vercel.app/api/webhook/twilio</code>
        </p>
      </div>
    </div>
  );
}
