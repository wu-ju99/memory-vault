import { Link } from 'react-router-dom';
import '../../styles/auth.css';

function AuthShell({
  mode = 'login',
  heroEyebrow,
  heroTitle,
  heroDescription,
  formEyebrow,
  formTitle,
  formDescription,
  alternatePrompt,
  alternateTo,
  alternateLabel,
  highlights = [],
  children,
}) {
  return (
    <div className={`auth-page auth-page-${mode}`}>
      <div className="auth-shell">
        <section className="auth-hero" aria-label="Memory Vault introduction">
          <span className="auth-hero-eyebrow">{heroEyebrow}</span>
          <h1 className="auth-hero-title">{heroTitle}</h1>
          <p className="auth-hero-description">{heroDescription}</p>

          <div className="auth-hero-panel">
            <p className="auth-hero-panel-label">核心特点</p>
            <ul className="auth-feature-list">
              {highlights.map((item) => (
                <li key={item.title} className="auth-feature-item">
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-card">
            <div className="auth-brand">
              <span className="auth-brand-mark" aria-hidden="true">MV</span>
              <div>
                <p className="auth-brand-name">Memory Vault</p>
                <p className="auth-brand-tagline">私人相册 · 回忆归档 · 长期保存</p>
              </div>
            </div>

            <div className="auth-card-header">
              <p className="auth-card-eyebrow">{formEyebrow}</p>
              <h2>{formTitle}</h2>
              <p>{formDescription}</p>
            </div>

            {children}

            <p className="auth-switch">
              <span>{alternatePrompt}</span>
              <Link className="auth-switch-link" to={alternateTo}>
                {alternateLabel}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AuthShell;
