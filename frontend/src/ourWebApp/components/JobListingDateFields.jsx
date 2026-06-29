function JobListingDateFields({
  jobStartsAt,
  jobClosesAt,
  onJobStartsAtChange,
  onJobClosesAtChange,
  disabled = false,
  idPrefix = 'job-listing',
}) {
  return (
    <div className="job-listing-date-fields">
      <div className="job-listing-date-field">
        <label htmlFor={`${idPrefix}-starts-at`} className="job-listing-date-label">
          <i className="bi bi-calendar-event me-1"></i>
          Start date
        </label>
        <input
          id={`${idPrefix}-starts-at`}
          type="date"
          className="form-control job-listing-date-input"
          value={jobStartsAt}
          onChange={(event) => onJobStartsAtChange(event.target.value)}
          disabled={disabled}
          required
        />
      </div>
      <div className="job-listing-date-field">
        <label htmlFor={`${idPrefix}-closes-at`} className="job-listing-date-label">
          <i className="bi bi-calendar-check me-1"></i>
          End date
        </label>
        <input
          id={`${idPrefix}-closes-at`}
          type="date"
          className="form-control job-listing-date-input"
          value={jobClosesAt}
          min={jobStartsAt || undefined}
          onChange={(event) => onJobClosesAtChange(event.target.value)}
          disabled={disabled}
          required
        />
      </div>
    </div>
  )
}

export default JobListingDateFields
