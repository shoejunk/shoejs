define([
	'essentialEngine/component/component',
	'essentialEngine/common/utilities',
	'essentialEngine/server/networkPlayer']
, function(
	Component,
	UTIL,
	NetworkPlayer)
{
	var sComponentName = 'NetworkPlayerFactory';

	function getName()
	{
		return sComponentName;
	}

	var NetworkPlayerFactoryPrototype = Object.create(Component.prototype);
	NetworkPlayerFactoryPrototype.getName = getName;
	NetworkPlayerFactoryPrototype.createdCallback = function createdCallback()
	{
		this.onConnect = UTIL.componentMethod(function onConnect(oSocket)
		{
			var oPlayer = new NetworkPlayer(oSocket);
			if(this.parentNode.addNetworkPlayer)
			{
				this.parentNode.addNetworkPlayer(oPlayer);
			}
		});

		this.preconstruct();
	};

	var NetworkPlayerFactory = document.registerElement('eec-' + sComponentName, {prototype: NetworkPlayerFactoryPrototype});
	return NetworkPlayerFactory;
});
