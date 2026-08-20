export function LoginHero() {
  return (
    <section className="login-hero" aria-label="ABC Bank welcome">
      <div className="login-hero__intro">
        <h1>Welcome to ABC Bank</h1>
        <p>Your Gateway to Effortless Management.</p>
      </div>

      <div className="login-hero__footer">
        <h2>Seamless Collaboration</h2>
        <p>Effortlessly work together with your team in real-time.</p>
        <div className="login-hero__pagination" aria-hidden="true">
          <span className="login-hero__dot login-hero__dot--active" />
          <span className="login-hero__dot" />
          <span className="login-hero__dot" />
        </div>
      </div>
    </section>
  );
}
