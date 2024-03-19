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
	var sComponentName = 'DomControls';

	// Protected variables:
	
	// Protected functions:

	class DomControls extends Component
	{
		domAction(sAction, mDiv)
		{
			let aParams = [];
			for(let i = 2; i < arguments.length; ++i)
			{
				aParams.push(arguments[i]);
			}
			if(!mDiv)
			{
				mDiv = this.parentNode;
			}
			mDiv = $(mDiv);
			if(sAction in mDiv && typeof mDiv[sAction] === 'function')
			{
				mDiv[sAction].apply(mDiv, aParams);
			}
		}

		getName() {return sComponentName;}
	}

	UTIL.componentMethod(DomControls.prototype.domAction);
	document.registerElement('eec-' + sComponentName, {prototype: DomControls.prototype});
	return DomControls;
});
