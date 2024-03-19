define([
	'essentialEngine/component/component',
	'essentialEngine/common/utilities'
]
, function(Component, UTIL)
{
	var sComponentName = 'UserAccounts';

	// Private variables:
	const m_gUserAccountsDb = Symbol('m_gUserAccountsDb');

	// Private functions:
	const onCreateUserRequest = Symbol('onCreateUserRequest');
	const onLoginRequest = Symbol('onLoginRequest');
	const onResumeSessionRequest = Symbol('onResumeSessionRequest');
	const validateUsernamePassword = Symbol('validateUsernamePassword');

	class UserAccounts extends Component
	{
		setUserAccountsDb(gUserAccountsDb)
		{
			this[m_gUserAccountsDb] = gUserAccountsDb;
		}

		preInit(callback)
		{
			this.parentNode.addPostRoute("/createUser", this[onCreateUserRequest].bind(this));
			this.parentNode.addPostRoute("/login", this[onLoginRequest].bind(this));
			this.parentNode.addPostRoute("/resumeSession", this[onResumeSessionRequest].bind(this));
			callback();
		}

		[validateUsernamePassword](username, password)
		{
			if(username.includes(' '))
			{
				return 'Username cannot contain a space';
			}
			if(password.includes(' '))
			{
				return 'Password cannot contain a space';
			}
			if(password.length < 5 || password.length > 30)
			{
				return 'Password must be between 5 and 30 characters';
			}
			if(username.length < 3 || username.length > 12)
			{
				return 'Username must be between 3 and 12 characters';
			}
			for(const sLetter of username)
			{
				if(sLetter.toLowerCase() >= 'a' && sLetter.toLowerCase() <= 'z')
				{
					continue;
				}
				if(sLetter >= '0' && sLetter <= '9')
				{
					continue;
				}
				if(['_', '-', ':', '.', '@', '(', ')', '+', ',', '=', ';', '$', '!', '*', "'", '%'].includes(sLetter))
				{
					continue;
				}
				return "The only special characters allowed in usernames are: _-:.@()+,=;$!*'%"
			}
			if(this.parentNode.isProfane(username))
			{
				return 'That username is not allowed';
			}
			return 'OK';
		}

		[onCreateUserRequest](req, res)
		{
			if(!req.headers.username || !req.headers.password)
			{
				res.status(400);
				res.send('Missing username or password');
				return;
			}
			const unescapedUsername = unescape(req.headers.username);
			const unescapedPassword = unescape(req.headers.password);
			const sValid = this[validateUsernamePassword](unescapedUsername, unescapedPassword);
			if(sValid != 'OK')
			{
				res.status(400);
				res.send(sValid);
				return;
			}
			this[m_gUserAccountsDb].addUser(unescapedUsername, unescapedPassword).then(mRes =>
			{
				if(UTIL.isObject(mRes))
				{
					// Success. mRes is the user object.
					if('session' in req)
					{
						req.session.username = mRes.username;
					}
					res.send(mRes.username);
				}
				else if(mRes == 'document already exists')
				{
					res.status(400);
					res.send('Username already exists');
				}
				else
				{
					res.status(500);
					res.send('Unknown server error');
				}
			});
		}

		[onLoginRequest](req, res)
		{
			if(!req.headers.username || !req.headers.password)
			{
				res.status(400);
				res.send('Missing username or password');
				return;
			}
			const unescapedUsername = unescape(req.headers.username);
			const unescapedPassword = unescape(req.headers.password);
			const sValid = this[validateUsernamePassword](unescapedUsername, unescapedPassword);
			if(sValid != 'OK')
			{
				res.status(400);
				res.send('Invalid username or password');
				return;
			}
			this[m_gUserAccountsDb].login(unescape(req.headers.username), unescape(req.headers.password), req.session).then(jUser =>
			{
				if(jUser)
				{
					if('session' in req)
					{
						req.session.username = jUser.username;
					}
					res.send(jUser.username);
				}
				else
				{
					res.status(400);
					res.send('Invalid username or password');
				}
			});
		}

		[onResumeSessionRequest](req, res)
		{
			this[m_gUserAccountsDb].resumeSession(req.session).then(jUser =>
			{
				if(jUser)
				{
					res.send(jUser.username);
				}
				else
				{
					res.status(400);
					res.send('Unable to resume session');
				}
			});
		}
	}

	document.registerElement('eec-' + sComponentName, {prototype: UserAccounts.prototype});
	return UserAccounts;
});
