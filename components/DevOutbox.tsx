import { devOutbox } from "@/lib/mail";

/** Stands in for an inbox on a local machine with no mail provider. Never shown in production. */
export default function DevOutbox() {
  const messages = devOutbox();
  if (messages.length === 0) return null;
  return (
    <section className="card" aria-labelledby="dev-outbox">
      <span className="eyebrow">Local development only</span>
      <h2 id="dev-outbox">Test inbox</h2>
      <p className="small muted">No mail provider is set up, so messages appear here.</p>
      <ul className="stack" style={{ margin: 0, paddingLeft: 18 }}>
        {messages.map((message, index) => (
          <li key={`${message.subject}-${index}`}>
            {message.link ? <a href={message.link} className="tap-link">{message.subject}</a> : message.subject}
          </li>
        ))}
      </ul>
    </section>
  );
}
