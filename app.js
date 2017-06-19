import React from 'react'
import PouchDB from 'pouchdb-browser'
import SeamlessAuth from 'pouchdb-seamless-auth'

PouchDB.plugin(require('crypto-pouch'))

export default class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      user: null,
      docs: [],
      error: null
    }

    SeamlessAuth(PouchDB)
  }

  authenticate ({username, password}) {
    const authDB = new PouchDB(`userz_${username}`)
    authDB.crypto(password, { ignore: ['type', 'name', 'roles'] })
    Promise.all([
      PouchDB.setSeamlessAuthLocalDB(authDB),
      PouchDB.setSeamlessAuthRemoteDB('https://lib-eidsr-dev.ehealthafrica.org/couchdb/_users/', {auth: {username, password}})
    ]).then(() => {
      console.log('set seamless')
      PouchDB.seamlessLogIn(username, password).then(user => {
        console.log('logged in', user)
        this.setState({user})
        const db = new PouchDB('eidsr', {auth: {username, password}})
        db.crypto(password) // alternatively, get the full user object from
                            // authDB.get(org.couchdb.user:username) and read
                            // a `key` property from it for encrypting app db
        db.sync('https://lib-eidsr-dev.ehealthafrica.org/couchdb/eidsr').then(() => {
          db.allDocs({include_docs: true, limit: 20}).then(result => {
            this.setState({docs: result.rows})
          })
        })
      })
      .catch(error => {
        console.error('error logging in', error)
        this.setState({error})
      })
    })
  }

  render () {
    return this.state.user
      ? <Dashboard {...this.state} />
      : <Login authenticate={this.authenticate.bind(this)} {...this.state} />
  }
}

function Dashboard (props) {
  return (
    <div>
      <p>Hi, {props.user.name}!</p>
      <h1>Your docs:</h1>
      <ol>{props.docs.map(({doc}) => <li key={doc._id}>{doc.caseInfo.idsrId}</li>)}</ol>
    </div>
  )

}

class Login extends React.Component {
  onLogin (event) {
    event.preventDefault()
    const {elements} = event.target
    const username = elements.namedItem('username').value
    const password = elements.namedItem('password').value
    this.props.authenticate({username, password})
  }

  render () {
    return (
      <form action='' onSubmit={this.onLogin.bind(this)}>
        <input type='text' name='username' />
        <input type='password' name='password' />
        <button type='submit'>Login</button>
        <i>{this.props.error && <p>{this.props.error.message}</p>}</i>
      </form>
    )
  }
}
