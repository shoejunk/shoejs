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
	var sComponentName = 'RestTrigger';

	// Private variables:

	// Private functions:

	class RestTrigger extends Component
	{
		preInit(callback)
		{
			let sTrigger = this.getAttribute('data-trigger');
			let sRoute = this.getAttribute('data-route');
			switch(sRoute)
			{
				case 'put':
					this.parentNode.addPutRoute(sTrigger, this.trigger.bind(this));
					break;
				case 'post':
					this.parentNode.addPostRoute(sTrigger, this.trigger.bind(this));
					break;
				default:
					this.parentNode.addGetRoute(sTrigger, this.trigger.bind(this));
			}
			callback();
		}

		trigger(oReq, oRes)
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
				let sMessage = this.getAttribute('data-message');
				if(sMessage)
				{
					oTarget[sEvent](sMessage, oReq.query);
				}
				else
				{
					oTarget[sEvent](oReq.query);
				}
			}
			oRes.send('');
		}

		getName() {return sComponentName;}
	}

	document.registerElement('eec-' + sComponentName, {prototype: RestTrigger.prototype});
	return RestTrigger;
});
