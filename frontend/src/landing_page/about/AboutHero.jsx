import { aboutStats } from './aboutData'

function AboutHero() {
  return (
    <section className="page-hero">
      <div className="container">
        <p className="section-label mb-0">About Ascendra</p>
        <h1>Where professionals rise together</h1>
        <p className="page-lead">
          Ascendra is a modern professional network for people who want to grow
          — connect with purpose, share meaningful content, and build your
          career with community and AI at your side.
        </p>
        <div className="page-stats">
          {aboutStats.map((stat) => (
            <div className="page-stat" key={stat.value}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutHero
