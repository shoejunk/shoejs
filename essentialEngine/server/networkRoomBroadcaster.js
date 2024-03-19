define([
	'jquery',
	'essentialEngine/component/component',
	'essentialEngine/common/utilities']
, function(
	$,
	Component,
	UTIL)
{
	var sComponentName = 'NetworkRoomBroadcaster';

	function getName()
	{
		return sComponentName;
	}

	var NetworkRoomBroadcasterPrototype = Object.create(Component.prototype);
	NetworkRoomBroadcasterPrototype.getName = getName;
	NetworkRoomBroadcasterPrototype.createdCallback = function createdCallback()
	{
		var m_oThis = this;

		this.onMatch = UTIL.componentMethod(function onMatch(oNetworkRoom)
		{
			UTIL.log('networkRoomBroadcaster matchStarted', sComponentName);
			m_oThis.parentNode.broadcastAll('matchStarted', null, oNetworkRoom.getName());
			oNetworkRoom.listen('msg', function(oNetworkPlayer, mMessage)
			{
				UTIL.log('msg received', sComponentName);
				UTIL.log(mMessage, sComponentName);
				var iNewX = mMessage[0];
				var iNewY = mMessage[1];
				var aParent = $(oNetworkRoom.getGameState());
				var aEntity = aParent.find('.tinkeringTom');
				var gEntity = aEntity[0];
				if(gEntity)
				{
					var aPossibleMoves = gEntity.getPossibleMoves();
					if(UTIL.recursiveIn(mMessage, aPossibleMoves))
					{
						gEntity.move(iNewX, iNewY);
						oSquare = gEntity.getBoard().get(iNewX, iNewY);
						oSquare.place(gEntity.getComponent('BoardEntity'));
						oNetworkPlayer.broadcast(oNetworkRoom.getName(), 'msg', [gEntity.getX(), gEntity.getY()]);
					}
					else
					{
						m_oThis.parentNode.broadcastAll('msg', [gEntity.getX(), gEntity.getY()], oNetworkRoom.getName());
					}
				}
			});
		});

		this.preconstruct();
	};

	document.registerElement('eec-' + sComponentName, {prototype: NetworkRoomBroadcasterPrototype});
	return NetworkRoomBroadcasterPrototype;
});
