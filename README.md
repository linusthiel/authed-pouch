# authed-pouch

This is a proof of concept of leveraging [crypto-pouch][cp],
[pouchdb-seamless-auth][psa] and [pouchdb-auth][pa] to build a distributed,
offline-capable, secure, encrypted user management and authentication
solution.

## Introduction

Pouchdb-auth is useful as a way to do user authentication and management
with an online database. Pouchdb-seamless-auth builds on that to implement
the same capability with a local, offline-capable database. There is a caveat,
though, in that the user secret is synced to the local users database, and is
vulnerable to an attacker reading the secret. Crypto-pouch is a pouchdb plugin
which encrypts a database using a specified key.

Authed-pouch simply sets pouchdb-seamless-auth with a per-user, local db
which is encrypted using the user's password. Thus, any secrets are encrypted
and safe.

## Workflow

When a user logs in, a database named after the user's username, prepended with
`users_`, is instantiated and configured for encryption with the user's
password. This is supplied to pouchdb-seamless-auth, which is also configured
to point to a central couchdb `_users` database.

On log-in, pouchdb-seamless-auth will connect to the online central couchdb,
and try to log in. If online, and log-in is successful, the user's document
is synced from the central `_users` database to the local `user_<username>`
database.

If offline, the online authentication will fail, and pouchdb-seamless-auth will
instead defer to the local database `users_<username>`. Since it was synced on
the first log-in, and encrypted with the user's password, if the username and
password are correct, authentication will be successful.

After that point, any other pouchdb databases can be encrypted as well, either
using the user's password, or, for a scenario such as the Liberia eIDSR setup
where potentially several users share access to the same district's database,
a shared key which is stored on the user object and thus available both on- and
offline, as well as encrypted.

## Architecture

Apart from the local user authentication flow which is shown in the example,
this can be set up with a per-user (or in our case per-district) database
centrally. Each such database should be protected and only allow users with a
role `ROLE`. Each user with access would also have `ROLE`.

These databases can then [replicate][replicate] from and to a central database,
where all data is replicated to the central database, and only data matching
the particular user (district) is replicated from the central database.

Thus, any user has access to their database only, with an encryption key
(potentially shared) stored on the user object, for encrypting the local
database.

A client system would, on successful log-in, sync the user's object and
retrieve the key, configuring the local database to be encrypted with the key,
prior to initializing replication of the database with the central db.


## Author

[Linus Thiel][linus] <linus@yesbabyyes.se>

[cp]: https://github.com/calvinmetcalf/crypto-pouch
[psa]: https://github.com/marten-de-vries/pouchdb-seamless-auth
[pa]: https://github.com/pouchdb/pouchdb-auth
[replicate]: https://wiki.apache.org/couchdb/Replication
[linus]: https://github.com/linus
