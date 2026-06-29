import AboutHero from './AboutHero'
import AboutValues from './AboutValues'
import AboutMission from './AboutMission'
import AboutJourney from './AboutJourney'
import AboutCta from './AboutCta'

function AboutPage() {
  return (
    <main className="page-main">
      <AboutHero />
      <section className="page-content">
        <div className="container">
          <AboutValues />
          <div className="row g-5 about-split-row">
            <div className="col-lg-6 about-split-col">
              <AboutMission />
            </div>
            <div className="col-lg-6 about-split-col">
              <AboutJourney />
            </div>
          </div>
          <AboutCta />
        </div>
      </section>
    </main>
  )
}

export default AboutPage
