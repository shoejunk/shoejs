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
	const sComponentName = 'ChatMessageHandler';

	// Private variables:
	const m_gReceiver = Symbol('m_gReceiver');
	const m_sReceiveEvent = Symbol('m_sReceiveEvent');
	const m_gChatBox = Symbol('m_gChatBox');

	class ChatMessageHandler extends Component
	{
		createdCallback()
		{
			this.preconstruct();
		}

		preInit(callback)
		{
			UTIL.log('ChatMessageHandler preInit');
			if (this[m_gReceiver] && this[m_sReceiveEvent] && this[m_gChatBox])
			{
				UTIL.log('ChatMessageHandler listening');
				this[m_gReceiver].listen(this[m_sReceiveEvent], this.onChatMessage.bind(this));
			}
			callback();
		}

		getName() {return sComponentName;};

		onChatMessage(sMessage)
		{
			$(this[m_gChatBox]).append(`<div class="chatMessage">${sMessage}</div>`);
		}

		setReceiver(gReceiver)
		{
			this[m_gReceiver] = gReceiver;
		}

		setReceiveEvent(sReceiveEvent)
		{
			this[m_sReceiveEvent] = sReceiveEvent;
		}

		setChatBox(gChatBox)
		{
			this[m_gChatBox] = gChatBox;
		}
	}

	document.registerElement('eec-' + sComponentName, {prototype: ChatMessageHandler.prototype});
	return ChatMessageHandler;
});
