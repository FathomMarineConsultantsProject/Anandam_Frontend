import { Bot, MessageCircle, Send, Phone } from 'lucide-react';

function AssistantSection({ assistant }) {
  if (!assistant) return null;

  return (
    <section className="panel-section assistant-section">
      <div className="section-heading">
        <MessageCircle size={22} strokeWidth={2} />
        <h2>{assistant.title}</h2>
      </div>

      <div className="assistant-card">
        <div className="assistant-top">
          <div className="assistant-avatar-large">
            <Bot size={18} strokeWidth={2} />
          </div>

          <div className="assistant-title-group">
            <h3>{assistant.profileTitle}</h3>
            <p>{assistant.subtitle}</p>
          </div>
        </div>

        <div className="assistant-chat-row">
          <div className="assistant-avatar-small">M</div>

          <div className="assistant-message-box">
            {assistant.introMessage}
          </div>
        </div>

        <div className="assistant-help-box">
          <h4>{assistant.helpHeading}</h4>

          <ul>
            {assistant.helpList?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="assistant-input-row">
          <input type="text" placeholder={assistant.inputPlaceholder} />
          <button type="button" aria-label="Send message">
            <Send size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="assistant-quick-row">
          <button type="button" className="assistant-quick-chat-btn">
            <MessageCircle size={16} strokeWidth={2} />
            <span>{assistant.quickChatLabel}</span>
          </button>

          <button type="button" className="assistant-call-btn" aria-label="Call support">
            <Phone size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="assistant-notice">
          <strong>{assistant.noticeTitle}</strong> {assistant.notice}
        </div>
      </div>
    </section>
  );
}

export default AssistantSection;