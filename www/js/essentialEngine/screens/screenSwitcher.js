'use strict';

define(
[
	'essentialEngine/component/component', 
	'essentialEngine/common/utilities', 
]
, function(
	Component,
	UTIL)
{
	var sComponentName = 'ScreenSwitcher';

	// Protected variables:
	const m_sScreenName = Symbol('m_sScreenName');

	// Protected functions:

	class ScreenSwitcher extends Component
	{
		createdCallback()
		{
			let sTrigger = this.getAttribute('data-trigger');
			if(sTrigger)
			{
				this[sTrigger] = this.trigger;
			}
			this.preconstruct();
			this[m_sScreenName] = this.getAttribute('data-screenName');
		}

		trigger()
		{
			$('ee-ScreenController')[0].goToScreen(this[m_sScreenName]);
		}

		goToScreen(sScreenName)
		{
			$('ee-ScreenController')[0].goToScreen(sScreenName);
		}

		reload()
		{
			location.reload();
		}

		getName() {return sComponentName;}
	}

	UTIL.componentMethod(ScreenSwitcher.prototype.goToScreen);
	UTIL.componentMethod(ScreenSwitcher.prototype.trigger);
	UTIL.componentMethod(ScreenSwitcher.prototype.reload);
	document.registerElement('eec-' + sComponentName, {prototype: ScreenSwitcher.prototype});
	return ScreenSwitcher;
});
