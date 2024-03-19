define(
[
	'jquery', 
	'essentialEngine/common/utilities',
	'essentialEngine/component/component',
	'socket.io-client'
]
, function(
	$, 
	UTIL, 
	Component,
	oSocketIo)
{
	const sComponentName = 'ClientSocket';

	// Protected variables:
	const m_oSocket = Symbol('m_oSocket');
	const m_bInited = Symbol('m_bInited');
	const m_oThis = Symbol('m_oThis');
	const m_aListens = Symbol('m_aListens');
	const m_bIsRedirectEnabled = Symbol('m_bIsRedirectEnabled');
	const m_sConnectPrefix = Symbol('m_sConnectPrefix');
	
	class ClientSocket extends Component
	{
		createdCallback()
		{
			this[m_bInited] = false;
			this[m_oThis] = this;
			this[m_aListens] = [];
			this[m_bIsRedirectEnabled] = true;
			this[m_sConnectPrefix] = '';
			this.preconstruct();
		}

		preInit(callback)
		{
			this.connect();
			callback();
		}

		init()
		{
			UTIL.log("ClientSocket init");
			if(this[m_bInited])
			{
				return;
			}
			this[m_bInited] = true;
			for(let i = 0; i < this[m_aListens].length; ++i)
			{
				let jListen = this[m_aListens][i];
				this[m_oSocket].on(jListen['event'], jListen['callback']);
			}
			if(this.parentNode.onConnect)
			{
				this.parentNode.onConnect();
			}
			this[m_oSocket].on('connectToServer', this.connectToServer.bind(this));
		}

		setConnectPrefix(sConnectPrefix)
		{
			this[m_sConnectPrefix] = sConnectPrefix;
		}

		listen(sEvent, onReceive)
		{
			UTIL.log(`ClientSocket listen for ${sEvent}`);
			if(this[m_oSocket])
			{
				this[m_aListens].push({event: sEvent, callback: onReceive});
				this[m_oSocket].on(sEvent, onReceive);
			}
			else
			{
				this[m_aListens].push({event: sEvent, callback: onReceive});
			}
		}

		send(sEvent, mMessage)
		{
			this[m_oSocket].emit(sEvent, mMessage);
		}

		connect()
		{
			const serverAddress = this.getAttribute('data-serverAddress');
			if(serverAddress)
			{
				UTIL.log("Connecting to " + this[m_sConnectPrefix] + serverAddress);
				this[m_oSocket] = oSocketIo.connect(this[m_sConnectPrefix] + serverAddress);
			}
			else
			{
				this[m_oSocket] = oSocketIo();
			}
			this[m_oSocket].on('connect', this.init.bind(this));
		}

		connectToServer(sServer)
		{
			if(this[m_bIsRedirectEnabled])
			{
				this[m_bInited] = false;
				this[m_oSocket].removeListener('connectToServer');
				this[m_oSocket].disconnect();
				this[m_oSocket] = oSocketIo.connect(sServer);
				this[m_oSocket].on('connect', this.init.bind(this));
			}
		}

		disconnect()
		{
			this[m_bInited] = false;
			this[m_oSocket].removeListener('connectToServer');
			this[m_oSocket].disconnect();
		}

		reconnect()
		{
			this.disconnect();
			this.connect();
		}

		disableRedirect()
		{
			this[m_bIsRedirectEnabled] = false;
		}

		enableRedirect()
		{
			this[m_bIsRedirectEnabled] = true;
		}

		getName() {return sComponentName;}
	}

	UTIL.componentMethod(ClientSocket.prototype.listen);
	UTIL.componentMethod(ClientSocket.prototype.send);
	UTIL.componentMethod(ClientSocket.prototype.connect);
	UTIL.componentMethod(ClientSocket.prototype.connectToServer);
	UTIL.componentMethod(ClientSocket.prototype.disconnect);
	UTIL.componentMethod(ClientSocket.prototype.disableRedirect);
	UTIL.componentMethod(ClientSocket.prototype.enableRedirect);
	UTIL.componentMethod(ClientSocket.prototype.reconnect);
	
	document.registerElement('eec-' + sComponentName, {prototype: ClientSocket.prototype});
	return ClientSocket;
});
