export function PageShell({ title, subtitle, right, children }) {
  return (
    <section className="dash-page-shell">
      <div className="dash-page-shell__head">
        <div className="dash-page-shell__titles">
          <h2 className="dash-page-shell__title">{title}</h2>
          {subtitle ? <div className="dash-page-shell__subtitle">{subtitle}</div> : null}
        </div>
        {right ? <div className="dash-page-shell__right">{right}</div> : null}
      </div>
      <div className="dash-page-shell__body">{children}</div>
    </section>
  )
}
