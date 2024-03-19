define(
[
	'essentialEngine/component/component'
]
, function(Component)
{
	let sComponentName = 'TextParsingServer';
	
	function getName()
	{
		return sComponentName;
	}

	function preInit(callback)
	{
		this.init(Component.prototype.preInit.bind(this, callback));
	}

	var TextParsingServerPrototype = Object.create(Component.prototype);
	TextParsingServerPrototype.getName = getName;
	TextParsingServerPrototype.preInit = preInit;
	TextParsingServerPrototype.createdCallback = function createdCallback()
	{
		let m_oThis = this;

		function handleRequest(oReq, oRes)
		{
			let sText = oReq.query['text'];
			if(sText)
			{
				if(m_oThis.parentNode.parseText)
				{
					m_oThis.parentNode.parseText(sText);
				}
				oRes.send(sText);
			}
			else
			{
				oRes.send('send text in a \'text\' url parameter');
			}
		}

		this.preconstruct();
		this.init = (callback) =>
		{
			m_oThis.parentNode.addGetRoute('/', handleRequest);
			callback();
		};
	};

	var TextParsingServer = document.registerElement('eec-' + sComponentName, {prototype: TextParsingServerPrototype});
	return TextParsingServer;
});
