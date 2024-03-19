define(
[
	'essentialEngine/common/utilities',
	'essentialEngine/component/component'
]
, function(
	UTIL, 
	Component)
{
	const sComponentName = 'UserAccountsClient';
	const m_sServerPath = Symbol('m_sServerPath');

	class UserAccountsClient extends Component
	{
		createdCallback()
		{
			this[m_sServerPath] = '';
			this.preconstruct();
		}

		setServerPath(sServerPath)
		{
			this[m_sServerPath] = sServerPath;
		}

		async createAccount(sUsername, sPassword)
		{
			let data = {};
			const response = await fetch(`${this[m_sServerPath]}/createUser`,
			{
				method: 'POST',
				mode: 'cors',
				headers: {
					'Content-Type': 'application/json',
					username: escape(sUsername),
					password: escape(sPassword)
				},
				body: JSON.stringify(data)
			})
			let sResponseText = await response.text();
			UTIL.log(`response: ${sResponseText}`, sComponentName);
			return [response.status, sResponseText];
		}

		async login(sUsername, sPassword)
		{
			let data = {};
			const response = await fetch(`${this[m_sServerPath]}/login`,
			{
				method: 'POST',
				mode: 'cors',
				headers: {
					'Content-Type': 'application/json',
					username: escape(sUsername),
					password: escape(sPassword)
				},
				body: JSON.stringify(data)
			})
			let sResponseText = await response.text();
			UTIL.log(`response: ${sResponseText}`, sComponentName);
			return [response.status, sResponseText];
		}

		async logout()
		{
			let data = {};
			const response = await fetch(`${this[m_sServerPath]}/logout`,
			{
				method: 'POST',
				mode: 'cors',
				body: JSON.stringify(data)
			})
			let sResponseText = await response.text();
			UTIL.log(`response: ${sResponseText}`, sComponentName);
			return [response.status, sResponseText];
		}

		async resumeSession()
		{
			let data = {};
			const response = await fetch(`${this[m_sServerPath]}/resumeSession`,
			{
				method: 'POST',
				mode: 'cors',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			})
			let sResponseText = await response.text();
			UTIL.log(`response: ${sResponseText}`, sComponentName);
			return [response.status, sResponseText];
		}

		getName() {return sComponentName;}
	}

	UTIL.componentMethod(UserAccountsClient.prototype.createAccount);
	UTIL.componentMethod(UserAccountsClient.prototype.login);
	UTIL.componentMethod(UserAccountsClient.prototype.logout);
	UTIL.componentMethod(UserAccountsClient.prototype.resumeSession);
	document.registerElement('eec-' + sComponentName, {prototype: UserAccountsClient.prototype});
	return UserAccountsClient;
});
