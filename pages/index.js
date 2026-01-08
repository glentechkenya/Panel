export default function Home() {
  return (
    <div style={{
      fontFamily: "system-ui, sans-serif",
      padding: "2rem",
      background: "#f9fafb",
      minHeight: "100vh"
    }}>
      <h1>Glenpanel</h1>
      <p>This is your WhatsApp bot control panel.</p>
      <ul>
        <li>Webhook (Twilio): <code>/api/webhook/twilio</code></li>
        <li>Test send: <code>/api/test-send</code></li>
      </ul>
      <p>
        Configure your Twilio WhatsApp sandbox or number to point to
        <code>https://your-vercel-app.vercel.app/api/webhook/twilio</code>.
      </p>
    </div>
  );
}
