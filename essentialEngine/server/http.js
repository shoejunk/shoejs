define([
	'essentialEngine/component/component',
	'essentialEngine/common/utilities',
	'https',
	'http']
, function(
	Component,
	UTIL,
	HTTPS,
	HTTP)
{
	var sComponentName = 'Http';

	// Private variables:
	const m_oHttp = Symbol('m_oHttp');

	// Private functions:
	const getBody = Symbol('getBody');

	class Http extends Component
	{
		setSsl(bSsl)
		{
			this[m_oHttp] = bSsl ? HTTPS : HTTP;
		}

		request(sHost, iPort, sRequest, sMethod, jParams)
		{
			return new Promise((resolve) =>
			{
				let jHeaders = jParams;
				jHeaders['Content-Type'] = 'application/json';
				const jOptions =
				{
					host: sHost,
					port: iPort,
					path: `/${sRequest}`,
					method: sMethod,
					headers: jHeaders
				};
				const oRequest = this[m_oHttp].request(jOptions, oRes =>
				{
					resolve(oRes);
				});
				oRequest.write('');
				oRequest.end();
			});
		}

		async [getBody](res)
		{
			return new Promise((resolve, reject) =>
			{
				let sFullData = '';
				res.on('data', sData =>
				{
					sFullData += sData;
				});
				res.on('end', () =>
				{
					resolve(sFullData);
				});
			});
		}

		async requestReceiveBody(sHost, iPort, sRequest, sMethod, jParams)
		{
			const oRes = await this.request(sHost, iPort, sRequest, sMethod, jParams);
			const sBody = await this[getBody](oRes);
			return {oRes, sBody};
		}

		async postRequest(sHost, iPort, sRequest, jParams)
		{
			return await this.request(sHost, iPort, sRequest, 'POST', jParams);
		}

		async postRequestToUrl(sUrl, sRequest, jParams)
		{
			aHostPort = sUrl.split(':');
			UTIL.assert(aHostPort.length == 2, `Poorly formed url ${sUrl}`);
			return await this.request(aHostPort[0], aHostPort[1], sRequest, 'POST', jParams);
		}

		async getRequest(sHost, iPort, sRequest, jParams)
		{
			return await this.request(sHost, iPort, sRequest, 'GET', jParams);
		}

		async getRequestToUrl(sUrl, sRequest, jParams)
		{
			const aHostPort = sUrl.split(':');
			UTIL.assert(aHostPort.length == 2, `Poorly formed url ${sUrl}`);
			return await this.request(aHostPort[0], aHostPort[1], sRequest, 'GET', jParams);
		}

		async postRequestReceiveBody(sHost, iPort, sRequest, jParams)
		{
			return await this.requestReceiveBody(sHost, iPort, sRequest, 'POST', jParams);
		}

		async postRequestToUrlReceiveBody(sUrl, sRequest, jParams)
		{
			const aHostPort = sUrl.split(':');
			UTIL.assert(aHostPort.length == 2, `Poorly formed url ${sUrl}`);
			return await this.requestReceiveBody(aHostPort[0], aHostPort[1], sRequest, 'POST', jParams);
		}

		async getRequestReceiveBody(sHost, iPort, sRequest, jParams)
		{
			return await this.requestReceiveBody(sHost, iPort, sRequest, 'GET', jParams);
		}

		async getRequestToUrlReceiveBody(sUrl, sRequest, jParams)
		{
			const aHostPort = sUrl.split(':');
			UTIL.assert(aHostPort.length == 2, `Poorly formed url ${sUrl}`);
			return await this.requestReceiveBody(aHostPort[0], aHostPort[1], sRequest, 'GET', jParams);
		}
	}

	UTIL.componentMethod(Http.prototype.request);
	UTIL.componentMethod(Http.prototype.requestReceiveBody);
	UTIL.componentMethod(Http.prototype.postRequest);
	UTIL.componentMethod(Http.prototype.postRequestToUrl);
	UTIL.componentMethod(Http.prototype.getRequest);
	UTIL.componentMethod(Http.prototype.getRequestToUrl);
	UTIL.componentMethod(Http.prototype.postRequestReceiveBody);
	UTIL.componentMethod(Http.prototype.postRequestToUrlReceiveBody);
	UTIL.componentMethod(Http.prototype.getRequestReceiveBody);
	UTIL.componentMethod(Http.prototype.getRequestToUrlReceiveBody);
	document.registerElement('eec-' + sComponentName, {prototype: Http.prototype});
	return Http;
});
