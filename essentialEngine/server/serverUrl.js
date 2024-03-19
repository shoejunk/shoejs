define([
	'essentialEngine/component/component',
	'essentialEngine/common/utilities']
, function(
	Component,
	UTIL)
{
	var sComponentName = 'ServerUrl';

	// Private variables:
	const m_sUrl = Symbol('m_sUrl');

	// Private functions:

	class ServerUrl extends Component
	{
		setUrl(sUrl)
		{
			this[m_sUrl] = sUrl;
		}

		getUrl()
		{
			return this[m_sUrl];
		}
	}

	UTIL.componentMethod(ServerUrl.prototype.getUrl);

	document.registerElement('eec-' + sComponentName, {prototype: ServerUrl.prototype});
	return ServerUrl;
});
