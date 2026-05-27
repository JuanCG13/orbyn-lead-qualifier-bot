import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Telegram Lead Qualification Agent</p>
        <h1>Orbyn Lead Qualifier Bot</h1>
        <p>
          Bot de Telegram desplegable en Vercel que cualifica leads con OpenRouter y registra cada evaluación en Google Sheets.
        </p>
        <div className={styles.grid}>
          <div><strong>Webhook</strong><span>/api/telegram</span></div>
          <div><strong>Healthcheck</strong><span>/api/health</span></div>
          <div><strong>Modelo default</strong><span>openai/gpt-4.1-nano</span></div>
          <div><strong>Logging</strong><span>Google Sheets</span></div>
        </div>
      </section>
    </main>
  );
}
