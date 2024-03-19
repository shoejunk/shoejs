define(['jquery', 'essentialEngine/common/utilities', 'essentialEngine/common/deferred'], function($, UTIL, Deferred)
{
	var HtmlIncludePrototype = Object.create(HTMLElement.prototype);

	HtmlIncludePrototype.createdCallback = function createdCallback()
	{
		// Private variables:
		let m_oThis = this;
		let m_oDelayer = new Deferred();

		// Private functions:
		function onHtmlLoaded()
		{
			// var oDiv = document.createElement('div');
			// oDiv.innerHTML = sHtml;
			// //m_oThis.parentNode.replaceChild(oDiv.firstChild, m_oThis);
			// m_oThis.parentNode.appendChild(oDiv.firstChild, m_oThis);
			m_oDelayer.resolve();
		}

		// Public functions:
		this.onLoad = async function onLoad(callback)
		{
			await m_oDelayer.defer();
			callback();
		};

		this.start = function start()
		{
			var sPath = this.getAttribute('data-path');
			let jTemplateParams = this.getAttribute('data-templateParams');
			if(jTemplateParams)
			{
				jTemplateParams = JSON.parse(jTemplateParams);
			}
			UTIL.loadHtmlFromTemplate(sPath, this.parentNode, jTemplateParams).then(onHtmlLoaded);
			// requirejs(['text!' + sPath], onHtmlLoaded, this);
		}
	};

	var HtmlInclude = document.registerElement('ee-HtmlInclude',
	{
		prototype	: HtmlIncludePrototype
	});

	return HtmlInclude;
});
