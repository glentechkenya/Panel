export function handleIncomingMessage(text = "") {
  const msg = text.trim().toLowerCase();

  if (msg === "hi" || msg === "hello") {
    return "Hello from Glenpanel 👋";
  }
  if (msg === "help" || msg === "menu") {
    return "Commands: hi, help, echo <text>, time";
  }
  if (msg.startsWith("echo ")) {
    const rest = text.slice(5).trim();
    return rest || "Nothing to echo.";
  }
  if (msg === "time") {
    return `Server time: ${new Date().toISOString()}`;
  }
  return `You said: ${text}`;
}
