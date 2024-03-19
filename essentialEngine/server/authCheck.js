define([
	'essentialEngine/component/component',
	'essentialEngine/common/utilities',
	'essentialEngine/common/deferred']
, function(
	Component,
	UTIL,
	Deferred)
{
	var sComponentName = 'AuthCheck';

	// Private variables:
	const m_gDb = Symbol('m_gDb');
	const m_oCollection = Symbol('m_oCollection');
	const m_oDeferToPreInit = Symbol('m_oDeferToPreInit');

	// Private functions:
	const onCheckAuthorizationRequest = Symbol('onCheckAuthorizationRequest');

	class AuthCheck extends Component
	{
		createdCallback()
		{
			this[m_oDeferToPreInit] = new Deferred();
			this.preconstruct();
		}

		preInit(callback)
		{
			this.parentNode.addGetRoute("/checkAuthorization", this[onCheckAuthorizationRequest].bind(this));
			this[m_oDeferToPreInit].resolve();
			callback();
		}

		async setDb(gDb)
		{
			this[m_gDb] = gDb;
		}

		async setCollection(sCollection)
		{
			await this[m_oDeferToPreInit].defer();
			this[m_oCollection] = await this[m_gDb].getCollection(sCollection);

			// Ensure the admin user exists. Create it if it doesn't.
			const jDocument = await this[m_gDb].getDocument(this[m_oCollection], 'admin');
			if(!jDocument)
			{
				await this[m_gDb].addDocument(this[m_oCollection], 'admin', {_key: 'admin', permissions: ['admin']})
			}
		}

		async [onCheckAuthorizationRequest](oReq, oRes)
		{
			if(!('username' in oReq.headers))
			{
				oRes.status(400);
				oRes.send('Missing username');
				return;
			}

			if(!('permission' in oReq.headers))
			{
				oRes.status(400);
				oRes.send('Missing permission');
				return;
			}

			const jDocument = await this[m_gDb].getDocument(this[m_oCollection], oReq.headers.username);
			if(!jDocument)
			{
				oRes.status(400);
				oRes.send(`User ${oReq.headers.username} not in player DB`);
				return;
			}

			if(!('permissions' in jDocument) || !jDocument.permissions.includes(unescape(oReq.headers.permission)))
			{
				oRes.status(400);
				oRes.send(`User ${oReq.headers.username} does not have the ${unescape(oReq.headers.permission)} permission`);
				return;
			}

			oRes.status(200);
			oRes.send('');
		}
	}

	document.registerElement('eec-' + sComponentName, {prototype: AuthCheck.prototype});
	return AuthCheck;
});
