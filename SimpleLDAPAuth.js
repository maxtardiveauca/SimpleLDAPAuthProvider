// This is a simple LDAP authentication provider for CA Live API Creator.
// It connects to a public LDAP server (ldap.forumsys.com), which recognizes
// a few users: boyle, curie, einstein, euclid, euler, gauss, newton, pasteur, tesla.
// All users have the same password: "password" (without quotes).
// Each user belongs to a group: chemists, mathematicians, or scientists.
// Each user has an attribute named mail, and some users have an attribute named telephoneNumber.
// To adapt this to your specific LDAP enviornment, you will have to change this to fit
// your schema, e.g. what attribures are relevant, how you figure out which roles a user has, etc...
//
// To install this, import this script as a library (API Properties -> Libraries -> Create New Library)
// Then mark it as used by your project (don't forget to save!)
// Then create a new authentication provider (type JavaScript), Name for Create Function: SimpleLDAPAuthProvider
// You don't have to change the parameters, they are only shown as an example.
// Then select this new auth provider for your project (API Properties -> Authentication Provider)
// You should now be able to log in (e.g. using Data Explorer) as einstein/password.

function SimpleLDAPAuthProvider () {
    var result = {};
    var configSetup = {};
    
    // This gets called first to pass in the required LDAP configuration values
    result.configure = function configure(myConfig) {
        configSetup.serverName = myConfig.serverName || "ldap://ldap.forumsys.com";
        configSetup.keyLifetimeMinutes = myConfig.keyLifetimeMinutes || 60;
    };

    // This gets called to validate the user payload against LDAP service
    result.authenticate = function authenticate(payload) {

        var authResponse = {
            roleNames: [],
            userIdentifier: payload.username,
            keyLifetimeSeconds: configSetup.keyLifetimeMinutes,
            userData: {},
            // We hard-code userInfo here, but you can add information that will be returned
            // to the authenticator in the response, along with the auth token.
            userInfo: {typeOfPerson: 'Cool'},
            // If you know when and from where this user last logged in, you can
            // optionally return it here.
            lastLogin : {
                datetime: null,
                ipAddress : null
            }
        };
        
        // Set up the JNDI environment
        var Hashtable = Java.type("java.util.Hashtable");
        var env = new Hashtable();
        env.put("java.naming.factory.initial", "com.sun.jndi.ldap.LdapCtxFactory");
        env.put("java.naming.provider.url", "ldap://ldap.forumsys.com");
        var userCN = "uid=" + payload.username + ",dc=example,dc=com";
        env.put("java.naming.security.authentication", "simple");
        env.put("java.naming.security.principal", userCN);
        env.put("java.naming.security.credentials", payload.password);
        
        var InitialDirContext = Java.type("javax.naming.directory.InitialDirContext");
        try {
			// First, can we connect? If not, then either the user is unknown,
			// or the password is wrong, and this will throw an exception.
            var ctx = new InitialDirContext(env);

			// Next, we retrieve the mail and phone attributes of the user, if present
            var attrs = ctx.getAttributes(userCN, ["mail", "telephoneNumber"]);
            var attrsEnum = attrs.getAll();
            while (attrsEnum.hasMore()) {
                var attrib = attrsEnum.next();
                authResponse.userData[attrib.getID()] = attrib.get().toString();
            }
            
            // Finally, we look for all the groups that contain our user
            var SearchControls = Java.type("javax.naming.directory.SearchControls");
            var ctls = new SearchControls();
	        ctls.setReturningAttributes(["ou"]);
	        var answer = ctx.search("dc=example,dc=com", 
	        		"(&(objectClass=groupOfUniqueNames)(uniqueMember=" + userCN + "))", ctls);
	        while (answer.hasMore()) {
	            authResponse.roleNames.push(answer.next().getAttributes().get("ou").get());
	        }
        }
        catch(e) {
            return {
            	errorMessage: e.getMessage()
            }
        }

        return authResponse;
    };

    // getLoginInfo gets called to create the logon dialog - you can change this if your
    // authentication method does not use username/password, or if you don't like the names,
    // but of course you'll have to change the authenticate function correspondingly.
    result.getLoginInfo = function getLoginInfo() {
        return {
            fields: [
                {
                    name: "username",
                    display: "User name",
                    description: "Enter your Username, e.g. einstein",
                    type: "text",
                    length: 40,
                    helpURL: ""
                },
                {
                    name: "password",
                    display: "Password",
                    description: "Enter your password, e.g. password",
                    type: "password",
                    length: 40,
                    helpURL: ""
                }
            ],
            links : []
        };
    };

    // This function is called by the authentication provider and these values are stored in the server side admin database
    result.getConfigInfo = function getConfigInfo() {
        return {
            current : {
 			  "serverName": configSetup.serverName,
              "keyLifetimeMinutes" : configSetup.keyLifetimeMinutes
            },
            fields : [
			{
			  name: "serverName",
			  display: "LDAP Server Name",
			  type: "text",
			  length: 40,
			  helpURL: ""
			},
			{
			  name: "keyLifetimeMinutes",
			  display: "API Key Lifetime (Minutes)",
			  type: "number",
			  length: 8,
			  helpURL: ""
			}
            ],
            links: []
        };
    };

    return result;
}
