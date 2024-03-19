'use strict';

define(
[
	'essentialEngine/component/component',
	'essentialEngine/common/utilities',
	'jquery'
]
, function(
	Component,
	UTIL,
	$)
{
	var sComponentName = 'SocketTrigger';

	// Protected variables:
	const m_aParams = Symbol('m_aParams');
	
	// Protected functions:

	class SocketTrigger extends Component
	{
		createdCallback()
		{
			const sParams = this.getAttribute('data-params');
			if(typeof sParams === 'string')
			{
				this[m_aParams] = sParams.split(' ');
			}
			else
			{
				this[m_aParams] = [];
			}
			this.preconstruct();
		}

		preInit(callback)
		{
			let sMessageType = this.getAttribute('data-messageType');
			this.parentNode.listen(sMessageType, this.trigger.bind(this));
			callback();
		}

		trigger(mMessage)
		{
			let sTarget = this.getAttribute('data-target');
			let sEvent = this.getAttribute('data-event') || 'trigger';
			let oTarget;
			if(sTarget)
			{
				oTarget = $('#' + sTarget)[0];
			}
			else
			{
				oTarget = this.parentNode;
			}
			if(oTarget && oTarget[sEvent] && typeof oTarget[sEvent] === 'function')
			{
				oTarget[sEvent].apply(oTarget[sEvent], this[m_aParams].concat(mMessage));
			}
		}

		getName() {return sComponentName;}
	}

	document.registerElement('eec-' + sComponentName, {prototype: SocketTrigger.prototype});
	return SocketTrigger;
});
