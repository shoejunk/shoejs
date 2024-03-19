'use strict';

// Example usage:
// oServer.addGetRoute('/', function(oReq, oRes)
// {
// 	console.log('params: ');
// 	console.log(oReq.query);
// 	oRes.send('Hello, World!');
// });

define([
	'express',
	'essentialEngine/component/component',
	'essentialEngine/common/utilities',
	'fs',
	'https',
	'express-session',
	'connect-arangodb-session',
	'body-parser'
]
, function(
	express,
	Component,
	UTIL,
	FS,
	HTTPS,
	session,
	arangoStore,
	BODYPARSER)
{
	var sComponentName = 'RestServer';
	const ArangoStore = arangoStore(session);

	function getName()
	{
		return sComponentName;
	}

	var RestServerPrototype = Object.create(Component.prototype);
	RestServerPrototype.getName = getName;
	RestServerPrototype.createdCallback = function createdCallback()
	{
		let m_oApp = express();
		let m_iPort = this.getAttribute('data-port') || 8080;
		let m_oSession;

		if(this.getAttribute('data-sessionStoreUrl'))
		{
			let store = new ArangoStore(
			{
				url: this.getAttribute('data-sessionStoreUrl'),
				dbName: this.getAttribute('data-sessionStoreDBName'),
				collection: 'sessions',
				user: this.getAttribute('data-sessionStoreUsername'),
				password: this.getAttribute('data-sessionStorePassword')
			})
			m_oSession = session(
			{
				secret: this.getAttribute('data-sessionStoreSecret'),
				store: store,
				resave: true,
				saveUninitialized: true
			});
			m_oApp.use(m_oSession);
			m_oApp.use(BODYPARSER.json());
			m_oApp.use(BODYPARSER.urlencoded({extended: true}));
		}

		this.addRoute = UTIL.componentMethod(function addRoute(sMethod, sPath, handler)
		{
			UTIL.assert(sMethod in m_oApp);
			m_oApp[sMethod](sPath, handler);
		});

		this.addGetRoute = UTIL.componentMethod(function addGetRoute(sPath, handler)
		{
			m_oApp.get(sPath, handler);
		});

		this.addPostRoute = UTIL.componentMethod(function addPostRoute(sPath, handler)
		{
			m_oApp.post(sPath, handler);
		});

		this.addPutRoute = UTIL.componentMethod(function addPutRoute(sPath, handler)
		{
			m_oApp.put(sPath, handler);
		});

		this.addDeleteRoute = UTIL.componentMethod(function addDeleteRoute(sPath, handler)
		{
			m_oApp.delete(sPath, handler);
		});

		this.getApp = UTIL.componentMethod(function getApp()
		{
			return m_oApp;
		});

		this.getSession = UTIL.componentMethod(function getSession()
		{
			return m_oSession;
		});

		let m_oServer;
		if(this.getAttribute('data-key'))
		{
			let jOptions = {
				key: FS.readFileSync(this.getAttribute('data-key')),
				cert: FS.readFileSync(this.getAttribute('data-cert')),
				ca: [FS.readFileSync(this.getAttribute('data-ca1')), FS.readFileSync(this.getAttribute('data-ca2'))]
			};
			m_oServer = HTTPS.createServer(jOptions, m_oApp).listen(m_iPort);
		}
		else
		{
			m_oServer = m_oApp.listen(m_iPort, function()
			{
				UTIL.log('rest server listening on port ' + m_iPort, sComponentName);
			});
		}

		this.getHttpServer = UTIL.componentMethod(function getHttpServer()
		{
			return m_oServer;
		});

		this.preconstruct();
	};

	var RestServer = document.registerElement('eec-' + sComponentName, { prototype: RestServerPrototype });
	return RestServer;
});
