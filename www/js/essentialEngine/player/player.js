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
	let sComponentName = 'Player';

	function getName()
	{
		return sComponentName;
	}

	function preInit(callback)
	{
		this.init();
		callback();
	}

	var PlayerPrototype = Object.create(Component.prototype);
	PlayerPrototype.getName = getName;
	PlayerPrototype.preInit = preInit;
	PlayerPrototype.createdCallback = function createdCallback()
	{
		let m_oThis = this;
		let m_iPlayerId;
		let m_sPlayerName;

		this.preconstruct();

		this.init = function init()
		{
			this.parentNode.listen('matchStarted', function()
			{
				if(m_oThis.parentNode.onMatch)
				{
					m_oThis.parentNode.onMatch();
				}
			});
		};

		this.setPlayerId = UTIL.componentMethod(function setPlayerId(iPlayer)
		{
			m_iPlayerId = iPlayer;
		});

		this.getPlayerId = UTIL.componentMethod(function getPlayerId()
		{
			return m_iPlayerId;
		});

		this.setPlayerName = UTIL.componentMethod(function setPlayerName(sPlayerName)
		{
			m_sPlayerName = sPlayerName;
		});

		this.getPlayerName = UTIL.componentMethod(function getPlayerName()
		{
			return m_sPlayerName;
		});
	};

	var Player = document.registerElement('eec-' + sComponentName, {prototype: PlayerPrototype});
	return Player;
});
