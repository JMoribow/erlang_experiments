
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