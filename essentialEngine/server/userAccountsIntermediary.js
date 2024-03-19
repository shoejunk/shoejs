define([
	'essentialEngine/component/component',
	'essentialEngine/common/utilities',
	'https',
	'http']
, function(
	Component,
	UTIL,
	HTTPS,
	HTTP)
{
	//UTIL.addLogTag('userAccounts');

	var sComponentName = 'UserAccountsIntermediary';

	// Private variables:
	const m_sAccountsHost = Symbol('m_sAccountsHost');
	const m_iAccountsPort = Symbol('m_sAccountsPort');
	const m_sDirectoryHost = Symbol('m_sDirectoryHost');
	const m_iDirectoryPort = Symbol('m_sDirectoryPort');
	const m_oHttp = Symbol('m_oHttp');
	const m_sAdminUsername = Symbol('m_sAdminUsername');
	const m_sAdminPassword = Symbol('m_sAdminPassword');

	// Private functions:
	const onCreateUserRequest = Symbol('onCreateUserRequest');
	const onGetGameInProgressRequest = Symbol('onGetGameInProgressRequest');
	const onLoginRequest = Symbol('onLoginRequest');
	const onLogoutRequest = Symbol('onLogoutRequest');
	const onResumeSessionRequest = Symbol('onResumeSessionRequest');
	const getUserDbUrl = Symbol('getUserDbUrl');
	const request = Symbol('request');
	const getBody = Symbol('getBody');
	const requestReceiveBody = Symbol('requestReceiveBody');
	const requestGetBody = Symbol('requestGetBody');

	class UserAccountsIntermediary extends Component
	{
		preInit(callback)
		{
			this.parentNode.addPostRoute('/createUser', this[onCreateUserRequest].bind(this));
			this.parentNode.addPostRoute('/login', this[onLoginRequest].bind(this));
			this.parentNode.addPostRoute('/logout', this[onLogoutRequest].bind(this));
			this.parentNode.addPostRoute('/resumeSession', this[onResumeSessionRequest].bind(this));
			this.parentNode.addGetRoute('/getGameInProgress', this[onGetGameInProgressRequest].bind(this));
			callback();
		}

		setAccountsHost(sAccountsHost)
		{
			this[m_sAccountsHost] = sAccountsHost;
		}

		setAccountsPort(iAccountsPort)
		{
			this[m_iAccountsPort] = iAccountsPort;
		}

		setDirectoryHost(sDirectoryHost)
		{
			this[m_sDirectoryHost] = sDirectoryHost;
		}

		setDirectoryPort(iDirectoryPort)
		{
			this[m_iDirectoryPort] = iDirectoryPort;
		}

		setSsl(bSsl)
		{
			this[m_oHttp] = bSsl ? HTTPS : HTTP;
		}

		setAdminUsername(sAdminUsername)
		{
			this[m_sAdminUsername] = sAdminUsername;
		}

		setAdminPassword(sAdminPassword)
		{
			this[m_sAdminPassword] = sAdminPassword;
		}

		async [onCreateUserRequest](req, res)
		{
			let jOptions =
			{
				host: this[m_sAccountsHost],
				port: this[m_iAccountsPort],
				path: '/createUser',
				method: 'POST',
				mode: 'cors',
				headers:
				{
					'Content-Type': 'application/json',
					username: req.headers.username,
					password: req.headers.password
				}
			};
			UTIL.log('Requesting createUser', sComponentName);
			const {oRes, sBody} = await this[requestReceiveBody](jOptions);
			if(oRes.statusCode < 300)
			{
				req.session.username = sBody;
			}
			res.status(oRes.statusCode);
			res.send(sBody);
		}

		[request](jOptions)
		{
			return new Promise((resolve) =>
			{
				const oRequest = this[m_oHttp].request(jOptions, oRes =>
				{
					resolve(oRes);
				});
				oRequest.write('');
				oRequest.end();
			});
		}

		async [getBody](res)
		{
			return new Promise((resolve, reject) =>
			{
				let sFullData = '';
				res.on('data', sData =>
				{
					sFullData += sData;
				});
				res.on('end', () =>
				{
					resolve(sFullData);
				});
			});
		}

		async [requestReceiveBody](jOptions)
		{
			const oRes = await this[request](jOptions);
			const sBody = await this[getBody](oRes);
			return {oRes, sBody};
		}

		async [requestGetBody](jOptions)
		{
			const oRes = await this[request](jOptions);
			const sBody = await this[getBody](oRes);
			return sBody;
		}

		async [getUserDbUrl](username)
		{
			const jOptions =
			{
				host: this[m_sDirectoryHost],
				port: this[m_iDirectoryPort],
				path: '/getUserDbUrl',
				method: 'POST',
				mode: 'cors',
				headers:
				{
					'Content-Type': 'application/json',
					username: username,
				}
			};
			const {sBody} = await this[requestReceiveBody](jOptions);
			return sBody;
		}

		async [onLoginRequest](req, res)
		{
			let jOptions =
			{
				host: this[m_sAccountsHost],
				port: this[m_iAccountsPort],
				path: '/login',
				method: 'POST',
				mode: 'cors',
				headers:
				{
					'Content-Type': 'application/json',
					username: req.headers.username,
					password: req.headers.password
				}
			};
			UTIL.log('Requesting login', sComponentName);
			const {sBody: sUsername, oRes} = await this[requestReceiveBody](jOptions);
			if(oRes.statusCode >= 300)
			{
				res.status(oRes.statusCode);
				res.send(sUsername);
				return;
			}
			req.session.username = sUsername;
			res.status(oRes.statusCode);
			res.send(sUsername);
		}

		[onLogoutRequest](req, res)
		{
			if ('session' in req)
			{
				req.session.destroy(err =>
				{
					res.clearCookie('connect.sid', { path: '/' }).send('log out successful');
				});
			}
		}

		async [onResumeSessionRequest](req, res)
		{
			UTIL.log('Requesting to resume session', sComponentName);
			if(req.session && 'username' in req.session)
			{
				res.send(req.session.username);
			}
			else
			{
				res.status(201);
				res.send('Unable to resume session');
			}
		}

		async [onGetGameInProgressRequest](req, res)
		{
			UTIL.log('Requesting game server URL and game room ID if game is in progress', sComponentName);
			if(req.session && 'username' in req.session)
			{
				const {oRes, sBody: sPlayerDbUrl} = await this.parentNode.postRequestReceiveBody(this[m_sDirectoryHost],
					this[m_iDirectoryPort], 'getUserDbUrl',
				{
					username: req.session.username
				});
				if(oRes.statusCode >= 300)
				{
					return false;
				}
				const {oRes: jGetPlayerFieldRes, sBody: sGameRoom} = 
					await this.parentNode.getRequestToUrlReceiveBody(sPlayerDbUrl, 'getPlayerField',
				{
					username: req.session.username,
					adminusername: this[m_sAdminUsername],
					adminpassword: this[m_sAdminPassword],
					key: 'gameRoom'
				});
				if(jGetPlayerFieldRes.statusCode >= 300)
				{
					res.status(jGetPlayerFieldRes.statusCode);
					res.send('Failed to access get gameRoom');
					return false;
				}
				res.status(200);
				res.send(sGameRoom);
				return sGameRoom;
			}
			else
			{
				res.status(400);
				res.send('No session found requesting getGameInProgress');
			}
		}
	}

	document.registerElement('eec-' + sComponentName, {prototype: UserAccountsIntermediary.prototype});
	return UserAccountsIntermediary;
});
