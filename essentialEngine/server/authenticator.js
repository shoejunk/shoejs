define([
	'essentialEngine/component/component',
	'essentialEngine/common/utilities']
, function(
	Component,
	UTIL)
{
	var sComponentName = 'Authenticator';

	// Private variables:
	const m_sAccountsHost = Symbol('m_sAccountsHost');
	const m_iAccountsPort = Symbol('m_sAccountsPort');
	const m_sAdminUsername = Symbol('m_sAdminUsername');
	const m_sAdminPassword = Symbol('m_sAdminPassword');
	const m_sDirectoryHost = Symbol('m_sDirectoryHost');
	const m_iDirectoryPort = Symbol('m_iDirectoryPort');

	// Private functions:
	const setup = Symbol('setup');

	class Authenticator extends Component
	{
		async [setup]()
		{
			const escapedUsername = escape(this[m_sAdminUsername]);
			const escapedPassword = escape(this[m_sAdminPassword]);
			const oLoginRes = await this.parentNode.postRequest(this[m_sAccountsHost], this[m_iAccountsPort], 'login',
			{
				username: escapedUsername,
				password: escapedPassword
			});
			if(oLoginRes.statusCode >= 300)
			{
				await this.parentNode.postRequest(this[m_sAccountsHost], this[m_iAccountsPort], 'createUser',
				{
					username: escapedUsername,
					password: escapedPassword
				});
			}
			await this.parentNode.postRequestReceiveBody(this[m_sDirectoryHost], this[m_iDirectoryPort], 'getUserDbUrl',
			{
				username: escapedUsername
			});
		}
		
		preInit(callback)
		{
			this[setup]().then(callback);
		}

		setAccountsHost(sAccountsHost)
		{
			this[m_sAccountsHost] = sAccountsHost;
		}

		setAccountsPort(iAccountsPort)
		{
			this[m_iAccountsPort] = iAccountsPort;
		}

		setAdminUsername(sAdminUsername)
		{
			this[m_sAdminUsername] = sAdminUsername;
		}

		setAdminPassword(sAdminPassword)
		{
			this[m_sAdminPassword] = sAdminPassword;
		}

		setDirectoryHost(sDirectoryHost)
		{
			this[m_sDirectoryHost] = sDirectoryHost;
		}

		setDirectoryPort(iDirectoryPort)
		{
			this[m_iDirectoryPort] = iDirectoryPort;
		}

		async authenticateRequest(oReq, sPermission)
		{
			if(!('username' in oReq.headers))
			{
				return false;
			}
			if(!('password' in oReq.headers))
			{
				return false;
			}
			const oLoginRes = await this.parentNode.postRequest(this[m_sAccountsHost], this[m_iAccountsPort], 'login',
			{
				username: oReq.headers.username,
				password: oReq.headers.password
			});
			if(oLoginRes.statusCode >= 300)
			{
				return false;
			}
			const {sBody: sPlayerDbUrl} = await this.parentNode.postRequestReceiveBody(this[m_sDirectoryHost], this[m_iDirectoryPort], 'getUserDbUrl',
			{
				username: oReq.headers.username
			});
			UTIL.log(`Checking for authorization as ${sPermission}`, sComponentName);
			const oAuthorizationRes = await this.parentNode.getRequestToUrl(sPlayerDbUrl, 'checkAuthorization',
			{
				username: oReq.headers.username,
				permission: escape(sPermission)
			});
			if(oAuthorizationRes.statusCode >= 300)
			{
				return false;
			}
			return true;
		}

		async authenticateUser(sUsername, sPassword, sPermission)
		{
			const oLoginRes = await this.parentNode.postRequest(this[m_sAccountsHost], this[m_iAccountsPort], 'login',
			{
				username: sUsername,
				password: sPassword
			});
			if(oLoginRes.statusCode >= 300)
			{
				return false;
			}
			const {sBody: sPlayerDbUrl} = await this.parentNode.postRequestReceiveBody(this[m_sDirectoryHost],
				this[m_iDirectoryPort],
				'getUserDbUrl',
			{
				username: sUsername
			});
			UTIL.log(`Checking for authorization as ${sPermission}`, sComponentName);
			const oAuthorizationRes = await this.parentNode.getRequestToUrl(sPlayerDbUrl, 'checkAuthorization',
			{
				username: sUsername,
				permission: escape(sPermission)
			});
			if(oAuthorizationRes.statusCode >= 300)
			{
				return false;
			}
			return true;
		}
	}

	UTIL.componentMethod(Authenticator.prototype.authenticateRequest);
	UTIL.componentMethod(Authenticator.prototype.authenticateUser);
	document.registerElement('eec-' + sComponentName, {prototype: Authenticator.prototype});
	return Authenticator;
});
