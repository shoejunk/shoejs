'use strict';

define([
	'essentialEngine/component/component',
	'essentialEngine/common/utilities',
	'essentialEngine/server/networkRoom',
	'essentialEngine/common/numberPool',
	'essentialEngine/common/timeline']
, function(
	Component,
	UTIL,
	NetworkRoom,
	NumberPool,
	TIMELINE)
{
	const sComponentName = 'FcfsMatchmaker';

	// Private variables:
	const m_oNumberPool = Symbol('m_oNumberPool');
	const m_jRooms = Symbol('m_jRooms');
	const m_iCapacity = Symbol('m_iCapacity');
	const m_iTimeout = Symbol('m_iTimeout');
	const m_oCurrentRoom = Symbol('m_oCurrentRoom');
	const m_bDestroyRoomOnMatch = Symbol('m_bDestroyRoomOnMatch');
	const m_iTimerId = Symbol('m_iTimerId');

	class FcfsMatchmaker extends Component
	{
		createdCallback()
		{
			this[m_oNumberPool] = new NumberPool();
			this[m_jRooms] = {};
			this[m_iCapacity] = UTIL.toInt(this.getAttribute('data-playersPerMatch'));
			const iTimeoutSec = this.getAttribute('data-timeoutSec');
			if(iTimeoutSec)
			{
				this[m_iTimeout] = UTIL.toInt(iTimeoutSec) * 1000;
			}
			this[m_iTimerId] = null;
			this.preconstruct();
		}

		addToExistingRoom(oPlayer)
		{
			UTIL.log('added player to room', sComponentName);
			let oCurrentRoom = this[m_oCurrentRoom];
			oCurrentRoom.add(oPlayer);
			if(oCurrentRoom.isFull())
			{
				UTIL.log('room full', sComponentName);
				if(this.parentNode.onMatch)
				{
					UTIL.log('onMatch registered so calling onMatch', sComponentName);
					this.parentNode.onMatch(oCurrentRoom);
				}
				this[m_oCurrentRoom] = null;
				if(this[m_iTimerId] !== null)
				{
					TIMELINE.cancel(this[m_iTimerId]);
					this[m_iTimerId] = null;
				}
			}
			else if(this[m_iTimeout])
			{
				if(this[m_iTimerId] === null)
				{
					this[m_iTimerId] = TIMELINE.register(this.timeout.bind(this), 5000);
				}
			}
		}

		onPlayerDisconnect(oNetworkPlayer)
		{
			oNetworkPlayer.stopListening();
			if(this[m_oCurrentRoom])
			{
				this[m_oCurrentRoom].remove(oNetworkPlayer);
			}
		};

		onCancelMatchmaking(oNetworkPlayer)
		{
			oNetworkPlayer.emit('matchmakingCanceled');
			this.onPlayerDisconnect(oNetworkPlayer);
		};

		addNetworkPlayer(oNetworkPlayer)
		{
			if(this[m_oCurrentRoom])
			{
				this.addToExistingRoom(oNetworkPlayer);
			}
			else
			{
				var iRoomNumber = this[m_oNumberPool].get();
				this[m_oCurrentRoom] = new NetworkRoom(iRoomNumber, this[m_iCapacity]);
				this[m_jRooms][this[m_oCurrentRoom].getName()] = this[m_oCurrentRoom];
				this.addToExistingRoom(oNetworkPlayer);
			}

			if(this[m_oCurrentRoom])
			{
				oNetworkPlayer.listen('disconnect', this.onPlayerDisconnect.bind(this, oNetworkPlayer));
				oNetworkPlayer.listen('cancelMatchmaking', this.onCancelMatchmaking.bind(this, oNetworkPlayer));
			}
		}

		timeout()
		{
			if(this[m_oCurrentRoom])
			{
				this.parentNode.broadcastAll('matchmakingTimeout', null, this[m_oCurrentRoom].getName());
				this[m_oCurrentRoom] = null;
			}
		}

		getName()
		{
			return sComponentName;
		}
	}

	UTIL.componentMethod(FcfsMatchmaker.prototype.addNetworkPlayer);
	document.registerElement('eec-' + sComponentName, {prototype: FcfsMatchmaker.prototype});
	return FcfsMatchmaker;
});
