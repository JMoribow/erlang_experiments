
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
      header.textContent = isHeader[0]
      header.classList.add('dropdown-header')
      container.appendChild(header)
      continue
    }
    const id = key.toLowerCase().replace(/\s/g, '_').replace(/\/_/g, '')
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.id = id
    input.className = 'position-absolute my-2 ml-3 js-dashboard-filter-checkbox'

    const label = document.createElement('label')
    label.className = 'pl-6 dropdown-item js-dashboard-filter-label'
    label.innerText = key
    label.htmlFor = id

    container.appendChild(input)
    container.appendChild(label)
  }
  details.appendChild(summary)
  details.appendChild(container)

  const positionMarker = document.querySelector('#dashboard')
  if (positionMarker) {
    positionMarker.prepend(details)
    applyPreference()
  } else {
    console.log('Dashboard extension: position marker not found.')
  }
}

function rememberPreference () {
  const preference = JSON.parse(localStorage.getItem(`dashboard:select:${context}`) || '{}')
  for (const box of document.querySelectorAll('.js-dashboard-filter-checkbox')) {
    preference[box.id] = box.checked
  }

  localStorage.setItem(`dashboard:select:${context}`, JSON.stringify(preference))
}

function applyPreference () {
  const preference = JSON.parse(localStorage.getItem(`dashboard:select:${context}`) || '{}')

  for (const box of document.querySelectorAll('.js-dashboard-filter-checkbox')) {
    box.checked = (typeof preference[box.id] === 'boolean') ? preference[box.id] : true
  }
}

function specifyTimelineEvents() {
  const dashboard = document.querySelector('#dashboard .news')
  if (!dashboard) return
  const observer = new MutationObserver(addMoreSpecificIdentifiers)
  observer.observe(dashboard, {subtree: true, childList: true})
}

async function getFolloweeList() {
  if (listOfFollowees) return listOfFollowees

  console.log('Dashboard extension: getting list of people you follow from localStorage')
  const followees = localStorage.getItem('dashboard:following')
  if (!followees || (followees && (new Date().getTime() - new Date(JSON.parse(followees).updatedAt))/1000 > 24*60*60)) {
    const results = await fetchFollowees()
    const followees = {
      updatedAt: (new Date()).getTime(),
      following: results
    }
    localStorage.setItem('dashboard:following', JSON.stringify(followees))
    listOfFollowees = results
  } else {
    listOfFollowees = JSON.parse(followees).following
  }

  return listOfFollowees
}

async function fetchFollowees() {
  console.log('Dashboard extension: updating list of people you follow from GitHub API (once every 24h)')
  return new Promise(async function(resolve) {
    let followees = []
    const user = document.querySelector('.HeaderNavlink.name .avatar, .Header-link .avatar').alt.slice(1)
    const endpoint = `https://api.github.com/users/${user}/following`
    let page = 1
    while (page > 0) {
      const res = await fetch(`${endpoint}?page=${page}`)
      const people = await res.json()
      followees = followees.concat(people)
      if (people.length === 30) {
        page++
      } else {
        page = 0
        resolve(followees.map(o => o.login))
      }
    }
  })
}

// Could break if GitHub changes its markup
async function addMoreSpecificIdentifiers(list) {
  const followees = await getFolloweeList()
  for (const record of list) {
    const closestParent = record.target.closest('.news, #panel-1')
    if (!closestParent) continue

    for (const eventItem of record.target.querySelectorAll(eventClasses)) {
      if (!(eventItem instanceof HTMLElement)) continue
      let target = eventItem
      const parentEventItem = target.parentElement.closest(eventClasses)
      if (parentEventItem) continue
      
      const expandable =  target.parentElement.closest('.body:has(.Details)')
      if (expandable) target = expandable

      // Check if any links are to one of the followed people
      const fromFollowedPeople = Array.from(target.querySelectorAll('a')).some(function(maybeActor) {
        return followees.indexOf(maybeActor.pathname.slice(1)) >= 0
      })
      target.classList.add(fromFollowedPeople ? 'by_followed_people' : 'by_internet')
    }
  }
}