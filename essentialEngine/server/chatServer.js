'use strict';

define(
[
	'jquery',
	'essentialEngine/common/utilities',
	'essentialEngine/component/component'
]
, function(
	$,
	UTIL,
	Component)
{
	const sComponentName = 'ChatServer';

	// Private variables:

	class ChatServer extends Component
	{
		createdCallback()
		{
			this.preconstruct();
		}

		preInit(callback)
		{
			callback();
		}

		onConnect(oSocket)
		{
			UTIL.log('onConnect', sComponentName);
			oSocket.on('chatMessage', (mMessage) => {
				UTIL.log('chatMessage received', sComponentName);
				this.parentNode.broadcastAll('chatMessage', mMessage);
			});
		}

		getName() {return sComponentName;};
	}

	UTIL.componentMethod(ChatServer.prototype.onConnect);
	document.registerElement('eec-' + sComponentName, {prototype: ChatServer.prototype});
	return ChatServer;
});
