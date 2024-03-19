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
	var sComponentName = 'Dispatcher';

	// Protected variables:
	const aServers = Symbol('aServers');
	const iNextServer = Symbol('iNextServer');
	
	// Protected functions:

	class Dispatcher extends Component
	{
		createdCallback()
		{
			this[iNextServer] = 0;
			this.preconstruct();
		}

		preInit(callback)
		{
			this[aServers] = [];
			for(let i = 0; i < this.children.length; ++i)
			{
				const oChild = this.children[i];
				this[aServers].push(oChild.innerHTML);
			}
			callback();
		}

		onMatch(oRoom)
		{
			const sServerAddress = this[aServers][this[iNextServer]++];
			if(this[iNextServer] >= this[aServers].length)
			{
				this[iNextServer] = 0;
			}
			this.parentNode.broadcastAll('connectToServer', sServerAddress, oRoom.getName());
			UTIL.log('connecting to server ' + sServerAddress, sComponentName);
		}

		getName() {return sComponentName;}
	}

	UTIL.componentMethod(Dispatcher.prototype.onMatch);
	document.registerElement('eec-' + sComponentName, {prototype: Dispatcher.prototype});
	return Dispatcher;
});
