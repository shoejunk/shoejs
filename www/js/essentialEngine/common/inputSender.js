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
	const sComponentName = 'InputSender';

	// Private variables:
	const m_gInputBox = Symbol('m_gInputBox');
	const m_gSender = Symbol('m_gSender');
	const m_sSendEvent = Symbol('m_sSendEvent');

	class InputSender extends Component
	{
		createdCallback()
		{
			this.preconstruct();
		}

		preInit(callback)
		{
			callback();
		}

		getName() {return sComponentName;};

		onKeydown(e)
		{
			let bSuccess = true;
			if (!this[m_gSender])
			{
				UTIL.log("ClientSocket missing or invalid prop_g_sender");
				bSuccess = false;
			}
			if (!this[m_sSendEvent])
			{
				UTIL.log("ClientSocket missing or invalid prop_s_send_event");
				bSuccess = false;
			}
			if (!this[m_gInputBox])
			{
				UTIL.log("ClientSocket missing or invalid prop_g_input_box");
				bSuccess = false;
			}

			if (bSuccess && e.key == 'Enter')
			{
				let sText = $(this[m_gInputBox]).val();
				let sEventName = this[m_sSendEvent];
				UTIL.log(`Sending ${sText} as event ${sEventName}`);
				this[m_gSender].send(sEventName, sText);
				$(this[m_gInputBox]).val('');
			}
		}

		setInputBox(gInputBox)
		{
			this[m_gInputBox] = gInputBox;
			$(gInputBox).keydown(this.onKeydown.bind(this));
		}

		setSender(gSender)
		{
			this[m_gSender] = gSender;
		}

		setSendEvent(sSendEvent)
		{
			this[m_sSendEvent] = sSendEvent;
		}
	}

	document.registerElement('eec-' + sComponentName, {prototype: InputSender.prototype});
	return InputSender;
});
