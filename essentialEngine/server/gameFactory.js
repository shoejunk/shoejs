define(
[
	'jquery', 
	'essentialEngine/common/utilities', 
	'essentialEngine/common/checklist',
	'essentialEngine/component/component', 
]
, function(
	$, 
	UTIL, 
	Checklist,
	Component)
{
	var sComponentName = 'GameFactory';

	function getName()
	{
		return sComponentName;
	}

	function preCreate(callback)
	{
		this.init(Component.prototype.preCreate.bind(this, callback));
	}

	var GameFactoryPrototype = Object.create(Component.prototype);
	GameFactoryPrototype.getName = getName;
	GameFactoryPrototype.preCreate = preCreate;
	GameFactoryPrototype.createdCallback = function createdCallback()
	{
		var m_oThis = this;
		var m_sHtml;

		function onHtmlLoaded(callback, sHtml)
		{
			m_sHtml = sHtml;
			callback();
		}

		this.init = function init(callback)
		{
			var sPath = this.getAttribute('data-startingGameState');
			requirejs(['text!' + sPath], onHtmlLoaded.bind(this, callback));
		};

		this.onMatch = UTIL.componentMethod(function onMatch(oNetworkRoom)
		{
			var oDiv = document.createElement('div');
			oDiv.innerHTML = m_sHtml.replace(new RegExp('{roomName}', 'g'), oNetworkRoom.getName());
			var gGameState = m_oThis.parentNode.appendChild(oDiv.firstChild);
			oNetworkRoom.setGameState(gGameState);
		});

		this.preconstruct();

		// Construction:
	};

	var GameFactory = document.registerElement('eec-' + sComponentName, {prototype: GameFactoryPrototype});
	return GameFactory;
});
