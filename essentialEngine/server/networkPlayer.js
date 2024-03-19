define(['jquery']
, function($)
{
	function NetworkPlayer(m_oSocket)
	{
		var m_oThis = this;
		let m_sChannelName;
		let m_iRoomId = -1;
		let m_sName = '';
		let m_iRating = 0;
		let m_aReadyCallbacks = [];
		let m_bReady = false;
		if('handshake' in m_oSocket && 'session' in m_oSocket.handshake)
		{
			if('username' in m_oSocket.handshake.session)
			{
				m_sName = m_oSocket.handshake.session.username;
				$('#server')[0].getRating(m_sName).then(iRating => 
				{
					m_iRating = iRating
					UTIL.log(`setting rating for ${m_sName} to ${m_iRating}`, ['NetworkPlayer', 'DebugRatings']);
					this.setReady();
				});
			}
		}

		this.onReady = function onReady(callback)
		{
			if(m_bReady)
			{
				callback();
			}
			else
			{
				m_aReadyCallbacks.push(callback);
			}
		}

		this.setReady = function setReady()
		{
			m_aReadyCallbacks.forEach(callback =>
			{
				callback();
			});
			m_aReadyCallbacks = [];
			m_bReady = true;
		}

		this.listen = function listen(sMessageType, handler)
		{
			m_oSocket.on(sMessageType, handler.bind(m_oThis));
		};

		this.joinChannel = function joinChannel(sChannelName)
		{
			m_sChannelName = sChannelName;
			m_oSocket.join(sChannelName);
		};

		this.broadcast = function broadcast(sChannelName, sMessageType, mMessage)
		{
			m_oSocket.broadcast.to(sChannelName).emit(sMessageType, mMessage);
		};

		this.emit = function emit(sEvent, mMessage)
		{
			m_oSocket.emit(sEvent, mMessage);
		};

		this.stopListening = function stopListening()
		{
			if(m_sChannelName)
			{
				m_oSocket.leave(m_sChannelName);
			}
			m_oSocket.removeAllListeners();
		};

		this.setRoomId = function setRoomId(iId)
		{
			m_iRoomId = iId;
		}

		this.getRoomId = function getRoomId()
		{
			return m_iRoomId;
		}

		this.getName = function getName()
		{
			return m_sName;
		}

		this.getRating = function getRating()
		{
			UTIL.log(`getting rating for ${m_sName}: ${m_iRating}`, ['NetworkPlayer', 'DebugRatings']);
			return m_iRating;
		}
	}

	return NetworkPlayer;
});
