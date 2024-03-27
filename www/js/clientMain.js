"use strict";

if(typeof document.registerElement == 'undefined')
{
	document.registerElement = document.register;
}

requirejs.config(
{
	baseUrl: '.',
	paths:
	{
		essentialEngine     : 'js/essentialEngine',
		thirdParty          : 'js/thirdParty',
		jquery              : 'js/thirdParty/jquery/jquery.min',
		text                : 'js/thirdParty/text/text',
		'socket.io-client'  : 'js/thirdParty/socket.io-client/dist/socket.io'
	}
});

requirejs([
	'essentialEngine/component/entity',
	'essentialEngine/htmlInclude/htmlInclude',
	'essentialEngine/component/component',
	'essentialEngine/common/utilities',
	'text',
	'essentialEngine/networking/clientSocket',
	'essentialEngine/networking/socketTrigger',
	'essentialEngine/common/numberPool',
	'essentialEngine/player/player',
	'essentialEngine/screens/screenController',
	'essentialEngine/button/button',
	'essentialEngine/screens/screenSwitcher',
	'thirdParty/socket.io/socket.io.min',
	'essentialEngine/animation/animation',
	'essentialEngine/clientStopwatch/clientStopwatch',
	'essentialEngine/animation/animHandler',
	'essentialEngine/networking/chatClient',
	'essentialEngine/networking/userAccountsClient',
	'essentialEngine/networking/accountCreationHelper',
	'essentialEngine/networking/loginHelper',
	'essentialEngine/networking/logoutHelper',
	'essentialEngine/common/backgroundImage',
	'essentialEngine/domControls/domControls'
],
function()
{
	UTIL.log("Client loaded");
});
