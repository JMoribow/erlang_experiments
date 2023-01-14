
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