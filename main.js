var requirejs = require('requirejs');
requirejs.config(
{
	baseUrl: '.',
	paths:
	{
		text : 'node_modules/text/text'
	}
});

var jsdom = require('jsdom').jsdom;
jsdom('<div></div>', {});
requirejs(['text'], function(text)
{
	requirejs(['text!index.html'], function(sServer)
	{
		document = jsdom(sServer, {});
		window = document.defaultView;
		HTMLElement = window.HTMLElement;
		require('document-register-element');
		requirejs([
			'essentialEngine/common/utilities',
			'essentialEngine/common/commandLineArgLog',
			'essentialEngine/common/numberPool',
			'essentialEngine/component/gameObject',
			'essentialEngine/component/component',
			'essentialEngine/server/chatServer',
			'essentialEngine/server/networkRoom',
			'essentialEngine/server/staticServer',
			'essentialEngine/server/restServer',
			'essentialEngine/server/realtimeServer',
			'essentialEngine/server/userAccountsIntermediary',
			'essentialEngine/server/http']
		, function(UTIL)
		{
			UTIL.log('ready');
		});
	});
});
