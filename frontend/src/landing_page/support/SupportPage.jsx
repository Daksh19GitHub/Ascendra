import SupportHero from './SupportHero'
import SupportTopics from './SupportTopics'
import SupportFaq from './SupportFaq'
import SupportContact from './SupportContact'

function SupportPage() {
  return (
    <main className="page-main">
      <SupportHero />
      <section className="page-content">
        <div className="container">
          <SupportTopics />
          <div className="row g-5 support-faq-row align-items-stretch">
            <SupportFaq />
            <SupportContact />
          </div>
        </div>
      </section>
    </main>
  )
}

export default SupportPage
