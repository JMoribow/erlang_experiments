
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
