define([
	'jquery',
	'http',
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
	$,
	oHttp,
	express,
	Component,
	UTIL,
	FS,
	HTTPS,
	session,
	arangoStore,
	BODYPARSER)
{
	var sComponentName = 'StaticServer';
	const ArangoStore = arangoStore(session);

	function getName()
	{
		return sComponentName;
	}

	var StaticServerPrototype = Object.create(Component.prototype);
	StaticServerPrototype.getName = getName;
	StaticServerPrototype.createdCallback = function createdCallback()
	{
		let m_oApp = express();
		let m_oSession;
		let m_iPort = UTIL.getCommandLineArg('port') || this.getAttribute('data-port') || 8080;
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
				saveUninitialized: false,
				resave: false
			});
			m_oApp.use(m_oSession);
			m_oApp.use(BODYPARSER.json());      
			m_oApp.use(BODYPARSER.urlencoded({extended: true}));
		}
		let m_oServer;

		this.getApp = UTIL.componentMethod(function getApp()
		{
			return m_oApp;
		});

		this.getHttpServer = UTIL.componentMethod(function getHttpServer()
		{
			return m_oServer;
		});

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

		this.getSession = UTIL.componentMethod(function getSession()
		{
			return m_oSession;
		});

		this.setRedirect = function(sRedirect)
		{
			m_oApp.get('/', (request, response) => 
			{
				UTIL.log('redirecting to ' + sRedirect, sComponentName);
				response.redirect(sRedirect);
			});
		}

		let key = null;
		let cert;
		let ca = [];
		UTIL.log('static server creation callback', sComponentName);
		for(let i = 0; i < this.children.length; ++i)
		{
			let mount;
			let mounts = $(this.children[i]).find("mount");
			if(mounts.length > 0)
			{
				mount = mounts[0];
			}
			let directory;
			let directories = $(this.children[i]).find("directory");
			if(directories.length > 0)
			{
				directory = directories[0];
			}
			if(directory)
			{
				if(mount)
				{
					m_oApp.use(mount.innerHTML, express.static(directory.innerHTML));
				}
				else
				{
					m_oApp.use(express.static(directory.innerHTML));
				}
			}
			let keys = $(this.children[i]).find("key");
			if(keys.length > 0)
			{
				key = FS.readFileSync(keys[0].innerHTML);
			}
			let certs = $(this.children[i]).find("cert");
			if(certs.length > 0)
			{
				cert = FS.readFileSync(certs[0].innerHTML);
			}
			let cas = $(this.children[i]).find("ca");
			if(cas.length > 0)
			{
				ca.push(FS.readFileSync(cas[0].innerHTML));
			}
		}

		if (key)
		{
			let jOptions = {
				key: key,
				cert: cert,
				ca: ca
			};
			m_oServer = HTTPS.createServer(jOptions, m_oApp).listen(m_iPort)
			UTIL.log(`secure server listening on port ${m_iPort}`, sComponentName);
		}
		else
		{
			m_oServer = m_oApp.listen(m_iPort, function()
			{
				UTIL.log(`listening on port ${m_iPort}`, sComponentName);
			});
		}
		
		this.preconstruct();
	};

	let StaticServer = document.registerElement('eec-' + sComponentName, { prototype: StaticServerPrototype });
	return StaticServer;
});
