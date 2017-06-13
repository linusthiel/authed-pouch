const PouchDB = require('pouchdb-browser')
PouchDB.plugin(require('crypto-pouch'))
const SeamlessAuth = require('pouchdb-seamless-auth')

let caseDb = new PouchDB('eidsr')
let authDb = new PouchDB('_users_eidsr')

authDb.crypto('eeBoPhe7', { ignore: ['type', 'name', 'roles'] })

function initUserDB () {
  console.log('initUserDB')
  return Promise.all([
    PouchDB.setSeamlessAuthLocalDB(authDb),
    PouchDB.setSeamlessAuthRemoteDB('https://lib-eidsr-dev.ehealthafrica.org/couchdb/_users/')
  ])
}

function logIn () {
  console.log('logIn')
  return PouchDB.seamlessLogIn('eidsr', 'eeBoPhe7').then(userObj => {
    console.log(userObj)
    //caseDb.crypto({key: userObj.secret_key})
  })
}

function showSession () {
  return PouchDB.seamlessSession().then(console.log)
}

function sync () {
  console.log('sync')
  return caseDb.sync('https://lib-eidsr-dev.ehealthafrica.org/couchdb/eidsr', {
    live: true,
    auth: {username: 'eidsr', password: 'eeBoPhe7'}
  })
}

function read () {
  console.log('read')
  console.log(caseDb.name)
  console.log(authDb.name)
  return Promise.all([
    authDb.allDocs({include_docs: true}),
    caseDb.allDocs({limit: 1, include_docs: true})
  ])
}

SeamlessAuth(PouchDB).then(initUserDB).then(logIn).then(showSession).then(sync).then(read).then(console.log).catch(e => {
  console.error(e)
  read().then(console.log)
})
