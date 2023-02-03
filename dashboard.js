
// Could break if GitHub changes its markup
const context = document.querySelector('[data-ga-click*="context:organization"]') ? 'org' : 'user'
const menuItems = {
  user: [
    'Watched repositories --',
    'Code',
    'Releases',
    'Conversations',
    'Following --',
    'Open source',
    'Stars and follows',
    'Forks',
    'You --',
    'Starred and followed by',
    'Forked by',
    'Sponsored by'
  ],
  org: [
    'Code',
    'Releases',
    'Conversations',
    'Administration'
  ]
}

const eventClasses = [
  // Code
  '.git-branch', '.push', '.gollum', '.issues_merged', '[data-hydro-click*=\'PushEvent\']',
  // Releases
  '.release', '.tag',
  // Conversations
  '.issues_closed', '.issues_labeled', '.issues_opened', '.issues_reopened', '.commit_comment', '.issues_comment',
  // Open source
  '.create', '.public', '.repo',
  // Stars and follows / Starred and followed by
  '.watch_started', '.follow',
  // Forks / Forked by
  '.fork',
  // Sponsorship
  '.sponsor',
  // Administration
  '.team_add', '.member_add'
].join()

let listOfFollowees

init()
updateClasses()
if (context === 'user') specifyTimelineEvents()

document.addEventListener('change', function (evt) {
  if (evt.target.classList.contains('js-dashboard-filter-checkbox')) {
    updateClasses()
    rememberPreference()
  }
})

document.addEventListener('click', function (evt) {
  if (evt.shiftKey && evt.target.classList.contains('js-dashboard-filter-label')) {
    for (const checkbox of document.querySelectorAll('.js-dashboard-filter-checkbox')) {
      if (checkbox === evt.target) continue
      checkbox.checked = false
    }
  }
})

function updateClasses() {
  const target = document.querySelector('#dashboard')
  for (const checkbox of document.querySelectorAll('.js-dashboard-filter-checkbox')) {
    target.classList.toggle(`show_${checkbox.id}`, checkbox.checked)
  }
}

function init () {
  const details = document.createElement('details')
  const classes = context === 'user'
    ? ['position-relative', 'js-dropdown-details', 'details-overlay', 'float-left', 'mt-2', 'mr-3']
    : ['position-relative', 'js-dropdown-details', 'details-overlay', 'mb-n1', 'mt-3', 'mb-2']
  details.classList.add(...classes)
  details.style.userSelect = 'none'
  const summary = document.createElement('summary')
  const btnClasses = context === 'user' ? ['btn'] : ['btn', 'btn-sm']
  summary.classList.add(...btnClasses)
  summary.textContent = 'Filter'
  const container = document.createElement('div')
  container.classList.add('dropdown-menu', 'dropdown-menu-se', 'f5')
  container.style.width = '260px'

  for (const key of menuItems[context]) {
    const isHeader = key.split(/ --$/)
    if (isHeader.length > 1) {
      const header = document.createElement('div')