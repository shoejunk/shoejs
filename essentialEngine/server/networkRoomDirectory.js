'use strict';

define(
[
	'essentialEngine/common/utilities',
	'essentialEngine/component/component'
]
, function(
	UTIL,
	Component)
{
	var sComponentName = 'NetworkRoomDirectory';

	// Private variables:
	const m_jDirectory = Symbol('m_jDirectory');

	// Private functions:

	class NetworkRoomDirectory extends Component
	{
		createdCallback()
		{
			this[m_jDirectory] = {};
			this.preconstruct();
		}

		getName() {return sComponentName;};

		onMatch(oNetworkRoom)
		{
			this[m_jDirectory][oNetworkRoom.getName()] = oNetworkRoom;
		}

		getRoom(sRoomName)
		{
			return this[m_jDirectory][sRoomName];
		}
	}

	UTIL.componentMethod(NetworkRoomDirectory.prototype.onMatch);
	UTIL.componentMethod(NetworkRoomDirectory.prototype.getRoom);
	
	document.registerElement('eec-' + sComponentName, {prototype: NetworkRoomDirectory.prototype});
	return NetworkRoomDirectory;
});
