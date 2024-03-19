define([
	'essentialEngine/component/component',
	'essentialEngine/common/utilities',
	'bcrypt'
]
, function(
	Component,
	UTIL,
	BCRYPT)
{
	var sComponentName = 'UserAccountsDB';

	class UserAccountsDB extends Component
	{
		preInit(callback)
		{
			this.parentNode.addCollection('users').then(callback);
		}

		async addUser(sUsername, sPassword)
		{
			let sKey = escape(sUsername.toLowerCase());
			const bExists = await this.parentNode.doesDocumentExist('users', sKey);
			if(bExists)
			{
				return 'document already exists';
			}
			const [sHashRes, sHash] = await new Promise(resolve =>
			{
				BCRYPT.hash(sPassword, 10, (err, sHash) =>
				{
					if(err)
					{
						resolve(['unkown error', null])
					}
					else
					{
						resolve(['success', sHash]);
					}
				});
			})
			if(sHashRes != 'success')
			{
				return sHashRes;
			}
			let jUser = {_key: sKey, username: sUsername, password: sHash};
			const sRes = await this.parentNode.addDocument('users', sKey, jUser);
			if(sRes == 'success')
			{
				return jUser;
			}
			return sRes;
		}

		async login(sUsername, sPassword, jSession)
		{
			const jUser = await this.parentNode.getDocument('users', sUsername.toLowerCase());
			if(jUser)
			{
				const bRes = await BCRYPT.compare(sPassword, jUser.password);
				if(bRes)
				{
					if(jSession)
					{
						jSession.username = jUser.username;
					}
					return jUser;
				}
				else
				{
					return null;
				}
			}
			return null;
		}

		async resumeSession(jSession)
		{
			if(jSession && 'username' in jSession)
			{
				const jUser = await this.parentNode.getDocument('users', jSession.username.toLowerCase());
				if(jUser)
				{
					return jUser;
				}
				return null;
			}
			return null;
		}
	}

	UTIL.componentMethod(UserAccountsDB.prototype.addUser);
	UTIL.componentMethod(UserAccountsDB.prototype.login);
	UTIL.componentMethod(UserAccountsDB.prototype.resumeSession);

	document.registerElement('eec-' + sComponentName, {prototype: UserAccountsDB.prototype});
	return UserAccountsDB;
});
