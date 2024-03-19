'use strict';

define(
[
	'essentialEngine/common/utilities',
	'jquery'
]
, function(
	UTIL,
	$)
{
	// Private variables:
	const m_iScaleBaseX = Symbol('m_iScaleBaseX');
	const m_iScaleBaseY = Symbol('m_iScaleBaseY');
	
	class ScreenController extends HTMLElement
	{
		createdCallback()
		{
			this[m_iScaleBaseX] = UTIL.toInt(this.getAttribute('data-scaleBaseX'));
			this[m_iScaleBaseY] = UTIL.toInt(this.getAttribute('data-scaleBaseY'));
			if(typeof this[m_iScaleBaseX] === 'number' || typeof this[m_iScaleBaseY] === 'number')
			{
				$(window).resize(this.scaleBody.bind(this));
				this.scaleBody();
			}

			if(this.children.length > 0)
			{
				$(this.children[0]).show();
				for(let i = 1; i < this.children.length; ++i)
				{
					$(this.children[i]).hide();
				}
			}
		}

		goToScreen(sScreen)
		{
			let oChildToShow = $(this).find('#' + sScreen);
			if(oChildToShow)
			{
				for(let i = 0; i < this.children.length; ++i)
				{
					let oChild = this.children[i];
					if(oChild !== oChildToShow)
					{
						$(oChild).hide();
					}
				}
				$(oChildToShow).show();
			}
		}

		scaleBody()
		{
			const oWindow = $(window);
			const iNewWindowW = oWindow.width();
			const iNewWindowH = oWindow.height();
			let fXScale = 1;
			let fYScale = 1;
			if(typeof this[m_iScaleBaseX] === 'number')
			{
				fXScale = iNewWindowW / this[m_iScaleBaseX];
			}
			if(typeof this[m_iScaleBaseY] === 'number')
			{
				fYScale = iNewWindowH / this[m_iScaleBaseY];
			}
			const fScale = Math.min(fXScale, fYScale);
			UTIL.setScale(fScale);
		}
	}

	document.registerElement('ee-ScreenController', {prototype: ScreenController.prototype});
	return ScreenController;
});
