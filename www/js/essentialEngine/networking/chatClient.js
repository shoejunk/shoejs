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
	const m_eSocket = Symbol('m_eSocket');
	const m_sSendEvent = Symbol('m_sSendEvent');
	const m_sReceiveEvent = Symbol('m_sReceiveEvent');
	const m_eChatBox = Symbol('m_eChatBox');
	const m_eInputBox = Symbol('m_eInputBox');

	class ChatClient extends Component
	{
		createdCallback()
		{
			this.preconstruct();
		}

		preInit(callback)
		{
			UTIL.log('ChatClient preInit');
			if (this[m_eSocket] && this[m_sReceiveEvent] && this[m_eChatBox])
			{
				UTIL.log('ChatClient listening');
				this[m_eSocket].listen(this[m_sReceiveEvent], this.onChatMessage.bind(this));
			}
			callback();
		}

		getName() {return sComponentName;};

		onKeydown(e)
		{
			let bSuccess = true;
			if (!this[m_eSocket])
			{
				UTIL.log("Socket missing or invalid prop_e_socket");
				bSuccess = false;
			}
			if (!this[m_sSendEvent])
			{
				UTIL.log("SendEvent missing or invalid prop_s_send_event");
				bSuccess = false;
			}
			if (!this[m_eInputBox])
			{
				UTIL.log("InputBox missing or invalid prop_e_input_box");
				bSuccess = false;
			}

			if (bSuccess && e.key == 'Enter')
			{
				let sText = $(this[m_eInputBox]).val();
				let sEventName = this[m_sSendEvent];
				UTIL.log(`Sending ${sText} as event ${sEventName}`);
				this[m_eSocket].send(sEventName, sText);
				$(this[m_eInputBox]).val('');
			}
		}

		onChatMessage(sMessage)
		{
			$(this[m_eChatBox]).append(`<div class="chatMessage">${sMessage}</div>`);
		}

		setSocket(eSocket)
		{
			this[m_eSocket] = eSocket;
		}

		setSendEvent(sSendEvent)
		{
			this[m_sSendEvent] = sSendEvent;
		}

		setReceiveEvent(sReceiveEvent)
		{
			this[m_sReceiveEvent] = sReceiveEvent;
		}

		setChatBox(eChatBox)
		{
			this[m_eChatBox] = eChatBox;
		}

		setInputBox(eInputBox)
		{
			this[m_eInputBox] = eInputBox;
			$(eInputBox).keydown(this.onKeydown.bind(this));
		}
	}

	document.registerElement('eec-' + sComponentName, {prototype: ChatClient.prototype});
	return ChatClient;
});
