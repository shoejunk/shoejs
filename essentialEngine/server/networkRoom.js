define([
	'essentialEngine/common/utilities']
, function(
	UTIL)
{
	function NetworkRoom(iRoomNumber, iCapacity)
	{
		var m_oThis = this;
		var m_aNetworkPlayers = [];
		var m_sRoomName = 'room' + iRoomNumber;
		var m_gGameState;
		let m_iPlayerId = 0;
		let m_aCallbacks = [];

		this.onFull = function onFull(callback)
		{
			if (this.isFull())
			{
				callback();
			}
			else
			{
				m_aCallbacks.push(callback);
			}
		}

		this.add = function add(oNetworkPlayer)
		{
			UTIL.assert(m_aNetworkPlayers.length < iCapacity);
			const playerId = UTIL.randomInt(0, m_iPlayerId);
			UTIL.log(`Adding ${oNetworkPlayer.getName()} as player ${playerId}`, 'NetworkRoom');
			oNetworkPlayer.setRoomId(playerId);
			for(let i = playerId; i < m_iPlayerId; ++i)
			{
				let playerToMove = m_aNetworkPlayers[i];
				const movedPlayerId = i + 1;
				m_aNetworkPlayers[movedPlayerId] = playerToMove;
				playerToMove.setRoomId(movedPlayerId);
				UTIL.log(`Shifting ${playerToMove.getName()} to be player ${movedPlayerId}`, 'NetworkRoom');
			}
			++m_iPlayerId;
			m_aNetworkPlayers[playerId] = oNetworkPlayer;
			oNetworkPlayer.joinChannel(m_sRoomName);
			if (this.isFull())
			{
				m_aCallbacks.forEach(callback => callback());
				m_aCallbacks = [];
			}
		};

		// Returns true if the player was removed
		this.remove = function remove(oNetworkPlayer)
		{
			for(let i = 0; i < m_aNetworkPlayers.length; ++i)
			{
				const oPlayer = m_aNetworkPlayers[i];
				if(oPlayer === oNetworkPlayer)
				{
					m_aNetworkPlayers.splice(i, 1);
					for(let j = i; j < m_aNetworkPlayers.length; ++j)
					{
						m_aNetworkPlayers[j].setRoomId(j);
					}
					--m_iPlayerId
					return true;
				}
			}
			return false;
		}

		this.isFull = function isFull()
		{
			return m_aNetworkPlayers.length >= iCapacity;
		};

		this.getName = function getName()
		{
			return m_sRoomName;
		};

		this.listen = function listen(sMessageType, handler)
		{
			m_aNetworkPlayers.map(function(oNetworkPlayer)
			{
				oNetworkPlayer.listen(sMessageType, handler.bind(null, oNetworkPlayer));
			});
		};

		this.stopListening = function stopListening()
		{
			for(let oNetworkPlayer of m_aNetworkPlayers)
			{
				oNetworkPlayer.stopListening();
			}
		}

		this.setGameState = UTIL.componentMethod(function setGameState(gGameState)
		{
			m_gGameState = gGameState;
		});

		this.getGameState = UTIL.componentMethod(function getGameState()
		{
			return m_gGameState;
		});

		this.getPlayer = UTIL.componentMethod(function getPlayer(iPlayer)
		{
			return m_aNetworkPlayers[iPlayer];
		});

		this.getNumPlayers = UTIL.componentMethod(function getNumPlayers()
		{
			return m_aNetworkPlayers.length;
		});

		this.broadcast = UTIL.componentMethod(function broadcast(sEvent, jData)
		{
			for(let oNetworkPlayer of m_aNetworkPlayers)
			{
				oNetworkPlayer.emit(sEvent, jData);
			}
		});
	}

	return NetworkRoom;
});
