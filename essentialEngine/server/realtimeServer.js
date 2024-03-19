define([
	'socket.io',
	'essentialEngine/component/component',
	'essentialEngine/common/utilities',
	'essentialEngine/server/networkRoom',
	'essentialEngine/common/numberPool']
, function(
	socketIo,
	Component,
	UTIL,
	NetworkRoom,
	NumberPool)
{
	var sComponentName = 'RealtimeServer';

	function getName()
	{
		return sComponentName;
	}

	function preInit(callback)
	{
		this.init();
		Component.prototype.preInit.bind(this, callback)();
	}

	var RealtimeServerPrototype = Object.create(Component.prototype);
	RealtimeServerPrototype.getName = getName;
	RealtimeServerPrototype.preInit = preInit;
	RealtimeServerPrototype.createdCallback = function createdCallback()
	{
		var m_oThis = this;
		var m_aRooms = [];
		var m_oNumberPool = new NumberPool();
		var m_iRoomNumber = m_oNumberPool.get();
		var m_oCurrentRoom = new NetworkRoom(m_iRoomNumber, 2);
		var m_oIo;

		m_aRooms.push(m_oCurrentRoom);

		this.broadcastAll = UTIL.componentMethod(function broadcastAll(sMessageType, mMessage, sChannelName)
		{
			UTIL.log('broadcastAll', sComponentName);
			if(sChannelName)
			{
				m_oIo.to(sChannelName).emit(sMessageType, mMessage);
			}
			else
			{
				m_oIo.emit(sMessageType, mMessage);
			}
		});

		this.getIo = UTIL.componentMethod(function getIo()
		{
			return m_oIo;
		});
		
		this.init = function init()
		{
			UTIL.log("init", sComponentName);
			UTIL.assert(this.parentNode.getHttpServer);
			var oHttpServer = this.parentNode.getHttpServer();
			UTIL.assert(oHttpServer);
			m_oIo = socketIo(oHttpServer);
			m_oIo.on('connection', function(oSocket)
			{
				UTIL.log('connect', sComponentName);
				oSocket.on('disconnect', () => UTIL.log('disconnect', sComponentName));
				if(m_oThis.parentNode.onConnect)
				{
					m_oThis.parentNode.onConnect(oSocket);
				}
			});
		};

		this.preconstruct();
	};

	var RealtimeServer = document.registerElement('eec-' + sComponentName, { prototype: RealtimeServerPrototype });
	return RealtimeServer;
});
