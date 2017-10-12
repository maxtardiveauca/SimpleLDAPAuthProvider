# SimpleLDAPAuthProvider
A JavaScript only auth provider example that uses a public LDAP server

This is a simple LDAP authentication provider for CA Live API Creator.
It connects to a public LDAP server (ldap.forumsys.com), which recognizes
a few users: `boyle`, `curie`, `einstein`, `euclid`, `euler`, `gauss`, `newton`, `pasteur`, `tesla`.

All users have the same password: `password`

Each user belongs to a group: `chemists`, `mathematicians`, or `scientists`.

Each user has an attribute named `mail`, and some users have an attribute named `telephoneNumber`.

To adapt this to your specific LDAP enviornment, you will have to change this to fit
your schema, e.g. what attribures are relevant, how you figure out which roles a user has, etc...

To install this, import this script as a library (API Properties -> Libraries -> Create New Library)
Then mark this new library as used by your project (check the box, and don't forget to save!)

Then, from the top page (the one listing all APIs), create a new authentication provider 
(type JavaScript), *Name for Create Function*: `SimpleLDAPAuthProvider`
You don't have to change the parameters that will appear, they are only shown as an example.
Then select this new auth provider for your project (API Properties -> Authentication Provider)

You should now be able to log in (e.g. using Data Explorer) as e.g. `einstein`/`password`.
