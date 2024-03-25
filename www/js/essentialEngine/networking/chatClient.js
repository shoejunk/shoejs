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
	const sComponentName = 'ChatClient';

	// Private variables:
	const m_gSocket = Symbol('m_gSocket');
	const m_sSendEvent = Symbol('m_sSendEvent');
	const m_sReceiveEvent = Symbol('m_sReceiveEvent');
	const m_gChatBox = Symbol('m_gChatBox');
	const m_gInputBox = Symbol('m_gInputBox');

	class ChatClient extends Component
	{
		createdCallback()
		{
			this.preconstruct();
		}

		preInit(callback)
		{
			UTIL.log('ChatClient preInit');
			if (this[m_gSocket] && this[m_sReceiveEvent] && this[m_gChatBox])
			{
				UTIL.log('ChatClient listening');
				this[m_gSocket].listen(this[m_sReceiveEvent], this.onChatMessage.bind(this));
			}
			callback();
		}

		getName() {return sComponentName;};

		onKeydown(e)
		{
			let bSuccess = true;
			if (!this[m_gSocket])
			{
				UTIL.log("Socket missing or invalid prop_g_socket");
				bSuccess = false;
			}
			if (!this[m_sSendEvent])
			{
				UTIL.log("SendEvent missing or invalid prop_s_send_event");
				bSuccess = false;
			}
			if (!this[m_gInputBox])
			{
				UTIL.log("InputBox missing or invalid prop_g_input_box");
				bSuccess = false;
			}

			if (bSuccess && e.key == 'Enter')
			{
				let sText = $(this[m_gInputBox]).val();
				let sEventName = this[m_sSendEvent];
				UTIL.log(`Sending ${sText} as event ${sEventName}`);
				this[m_gSocket].send(sEventName, sText);
				$(this[m_gInputBox]).val('');
			}
		}

		onChatMessage(sMessage)
		{
			$(this[m_gChatBox]).append(`<div class="chatMessage">${sMessage}</div>`);
		}

		setSocket(gSocket)
		{
			this[m_gSocket] = gSocket;
		}

		setSendEvent(sSendEvent)
		{
			this[m_sSendEvent] = sSendEvent;
		}

		setReceiveEvent(sReceiveEvent)
		{
			this[m_sReceiveEvent] = sReceiveEvent;
		}

		setChatBox(gChatBox)
		{
			this[m_gChatBox] = gChatBox;
		}

		setInputBox(gInputBox)
		{
			this[m_gInputBox] = gInputBox;
			$(gInputBox).keydown(this.onKeydown.bind(this));
		}
	}

	document.registerElement('eec-' + sComponentName, {prototype: ChatClient.prototype});
	return ChatClient;
});
