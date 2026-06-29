import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchAnalytics } from '../api/webAppApi'
import { POST_REACTIONS } from '../constants/postReactions'
import ProfileCompletionRing from '../components/ProfileCompletionRing'

const CHART_COLORS = {
  primary: '#4F46E5',
  accent: '#14B8A6',
  primaryLight: '#818CF8',
  accentLight: '#2DD4BF',
  muted: '#94A3B8',
  grid: '#E2E8F0',
}

const REACTION_COLORS = ['#4F46E5', '#EC4899', '#14B8A6', '#F59E0B']

function formatChartDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatEngagementDate(dateString) {
  return formatChartDate(dateString)
}

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <section className={`analytics-chart-card${className ? ` ${className}` : ''}`}>
      <div className="analytics-chart-card-header">
        <h2>{title}</h2>
        {subtitle && <p className="webapp-muted mb-0">{subtitle}</p>}
      </div>
      <div className="analytics-chart-card-body">{children}</div>
    </section>
  )
}

function StatCard({ icon, label, value, accent = 'indigo', title }) {
  return (
    <article
      className={`analytics-stat-card analytics-stat-card-${accent}`}
      title={title || label}
    >
      <span className="analytics-stat-icon" aria-hidden="true">
        <i className={`bi ${icon}`}></i>
      </span>
      <p className="analytics-stat-value">{value}</p>
      <p className="analytics-stat-label">{label}</p>
    </article>
  )
}

function AnalyticsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="analytics-chart-tooltip">
      <p className="analytics-chart-tooltip-label">{formatChartDate(label)}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="analytics-chart-tooltip-row">
          <span className="analytics-chart-tooltip-dot" style={{ background: entry.color }} />
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]

  return (
    <div className="analytics-chart-tooltip">
      <p className="analytics-chart-tooltip-row mb-0">
        {entry.name}: <strong>{entry.value}</strong>
      </p>
    </div>
  )
}

function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalytics()
      .then((response) => {
        setAnalytics(response.data)
      })
      .catch(() => {
        setError('Unable to load analytics. Please try again.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const reactionPieData = useMemo(() => {
    if (!analytics?.reactionBreakdown) return []

    return POST_REACTIONS.map((reaction, index) => ({
      name: reaction.label,
      value: analytics.reactionBreakdown[reaction.type] || 0,
      emoji: reaction.emoji,
      fill: REACTION_COLORS[index],
    })).filter((entry) => entry.value > 0)
  }, [analytics])

  const friendGrowthData = useMemo(() => {
    if (!analytics) return []

    if (analytics.friendGrowth?.length) {
      return analytics.friendGrowth.map((entry) => ({
        ...entry,
        label: formatChartDate(entry.date),
      }))
    }

    return [{ date: new Date().toISOString().slice(0, 10), friends: 0, label: 'Today' }]
  }, [analytics])

  const topPostsData = useMemo(() => {
    if (!analytics?.topPosts?.length) return []

    return analytics.topPosts.map((post, index) => ({
      ...post,
      shortLabel: `Post ${index + 1}`,
    }))
  }, [analytics])

  const hasEngagementActivity = useMemo(() => {
    if (!analytics?.engagementOverTime?.length) return false
    return analytics.engagementOverTime.some(
      (day) => day.reactions > 0 || day.comments > 0 || day.reposts > 0
    )
  }, [analytics])

  if (loading) {
    return (
      <div className="container webapp-page-content text-center analytics-page">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="container webapp-page-content analytics-page">
        <div className="profile-alert profile-alert-error">{error || 'Analytics unavailable.'}</div>
      </div>
    )
  }

  const { summary, engagementOverTime, rangeDays } = analytics
  const totalEngagement =
    summary.reactionsReceived + summary.commentsReceived + summary.repostsReceived

  return (
    <div className="container webapp-page-content analytics-page">
      <div className="analytics-page-header">
        <div className="analytics-page-header-main">
          <p className="webapp-muted mb-0">
            Track your network growth and content engagement over the last {rangeDays} days
          </p>
        </div>
        <div className="analytics-header-stat">
          <span className="analytics-header-stat-value">{totalEngagement}</span>
          <span className="analytics-header-stat-label">Total interactions</span>
        </div>
      </div>

      <section className="analytics-summary-section" aria-label="Summary statistics">
        <h2 className="analytics-section-title">Overview</h2>
        <div className="analytics-summary-grid">
          <StatCard icon="bi-people-fill" label="Friends" value={summary.friends} accent="indigo" />
          <StatCard icon="bi-newspaper" label="Posts" value={summary.posts} accent="teal" />
          <article className="analytics-stat-card analytics-stat-card-ring">
            <ProfileCompletionRing percentage={summary.profileCompletion} />
            <p className="analytics-stat-label analytics-stat-label-ring">Profile strength</p>
          </article>
        </div>
      </section>

      <section className="analytics-summary-section" aria-label="Engagement statistics">
        <h2 className="analytics-section-title">Engagement received</h2>
        <div className="analytics-summary-grid analytics-summary-grid-engagement">
          <StatCard
            icon="bi-heart-fill"
            label="Reactions"
            title="Reactions received"
            value={summary.reactionsReceived}
            accent="indigo"
          />
          <StatCard
            icon="bi-chat-dots-fill"
            label="Comments"
            title="Comments received"
            value={summary.commentsReceived}
            accent="teal"
          />
          <StatCard
            icon="bi-repeat"
            label="Reposts"
            title="Reposts received"
            value={summary.repostsReceived}
            accent="indigo"
          />
        </div>
      </section>

      <ChartCard
        title="Engagement over time"
        subtitle={`Reactions, comments, and reposts on your posts — last ${rangeDays} days`}
        className="analytics-chart-card-wide"
      >
        {hasEngagementActivity ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={engagementOverTime} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatEngagementDate}
                tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<AnalyticsTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="reactions"
                name="Reactions"
                stroke={CHART_COLORS.primary}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="comments"
                name="Comments"
                stroke={CHART_COLORS.accent}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="reposts"
                name="Reposts"
                stroke={CHART_COLORS.primaryLight}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="analytics-empty-chart">
            <i className="bi bi-graph-up"></i>
            <p>No engagement on your posts in the last {rangeDays} days yet.</p>
            <span className="webapp-muted">Publish posts and connect with friends to see activity here.</span>
          </div>
        )}
      </ChartCard>

      <div className="analytics-charts-grid">
        <ChartCard title="Reaction types" subtitle="How people react to your posts">
          {reactionPieData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={reactionPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={3}
                >
                  {reactionPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  formatter={(value, entry) =>
                    `${entry.payload.emoji || ''} ${value}`.trim()
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="analytics-empty-chart analytics-empty-chart-sm">
              <i className="bi bi-emoji-smile"></i>
              <p>No reactions yet.</p>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Top posts" subtitle="Your 5 most engaged posts">
          {topPostsData.length ? (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={topPostsData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: CHART_COLORS.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="shortLabel"
                    width={56}
                    tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const post = payload[0].payload
                      return (
                        <div className="analytics-chart-tooltip">
                          <p className="analytics-chart-tooltip-label">{post.preview}</p>
                          <p className="analytics-chart-tooltip-row mb-0">
                            Total: <strong>{post.totalEngagement}</strong>
                          </p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="totalEngagement" name="Engagement" radius={[0, 8, 8, 0]}>
                    {topPostsData.map((entry, index) => (
                      <Cell
                        key={entry.id}
                        fill={index % 2 === 0 ? CHART_COLORS.primary : CHART_COLORS.accent}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <ul className="analytics-top-posts-list">
                {topPostsData.map((post, index) => (
                  <li key={post.id}>
                    <span className="analytics-top-post-rank">{index + 1}</span>
                    <div>
                      <p className="analytics-top-post-preview">{post.preview}</p>
                      <span className="webapp-muted">
                        {post.reactions} reactions · {post.comments} comments · {post.reposts}{' '}
                        reposts
                        {post.postType === 'job' ? ' · Job opening' : ''}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="analytics-empty-chart analytics-empty-chart-sm">
              <i className="bi bi-bar-chart"></i>
              <p>No posts to rank yet.</p>
            </div>
          )}
        </ChartCard>
      </div>

      <ChartCard
        title="Friend growth"
        subtitle="Your network size over time"
        className="analytics-chart-card-wide"
      >
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={friendGrowthData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              minTickGap={20}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="analytics-chart-tooltip">
                    <p className="analytics-chart-tooltip-row mb-0">
                      Friends: <strong>{payload[0].value}</strong>
                    </p>
                  </div>
                )
              }}
            />
            <Line
              type="monotone"
              dataKey="friends"
              name="Friends"
              stroke={CHART_COLORS.accent}
              strokeWidth={3}
              dot={{ r: 4, fill: CHART_COLORS.accent, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <p className="analytics-footer-note webapp-muted">
        Total engagement all time: {totalEngagement} interactions across {summary.posts} posts
        {summary.jobPosts > 0 ? ` (${summary.standardPosts} normal, ${summary.jobPosts} job)` : ''}.
      </p>
    </div>
  )
}

export default AnalyticsPage
