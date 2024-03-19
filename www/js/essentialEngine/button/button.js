'use strict';

define(
[
	'essentialEngine/component/component', 
	'essentialEngine/common/utilities', 
]
, function(
	Component,
	UTIL)
{
	var sComponentName = 'Button';

	// Protected variables:
	const m_sTarget = Symbol('m_sTarget');
	const m_sEvent = Symbol('m_sEvent');
	const m_bOneTime = Symbol('m_bOneTime');
	const m_bTriggered = Symbol('m_bTriggered');
	const m_aParams = Symbol('m_aParams');
	const m_sPressedImg = Symbol('m_sPressedImg');
	const m_sReleasedImg = Symbol('m_sReleasedImg');
	const m_sHoverImg = Symbol('m_sHoverImg');
	const m_bMouseDown = Symbol('m_bMouseDown');
	
	// Protected functions:

	class Button extends Component
	{
		createdCallback()
		{
			this[m_sTarget] = this.getAttribute('data-target');
			this[m_sEvent] = this.getAttribute('data-event') || 'trigger';
			this[m_bOneTime] = this.getAttribute('data-oneTime') !== null;
			this[m_bTriggered] = false;
			this[m_sPressedImg] = null;
			this[m_sReleasedImg] = null;
			let oButtonImg = $(this.parentNode).find('.buttonImg');
			if(oButtonImg && oButtonImg.length > 0)
			{
				this[m_sReleasedImg] = oButtonImg[0].src;
			}

			const sParams = this.getAttribute('data-params');
			if(typeof sParams === 'string')
			{
				this[m_aParams] = sParams.split(' ');
			}
			else
			{
				this[m_aParams] = [];
			}
			this.preconstruct();
			$(this.parentNode).mousedown(this.mousedown.bind(this));
			$(document).mouseup(this.mouseup.bind(this));
			$(this.parentNode).mouseout(this.mouseout.bind(this));
			$(this.parentNode).mouseenter(this.mouseenter.bind(this));
			$(this.parentNode).click(this.click.bind(this));
		}

		mousedown()
		{
			if(this[m_sPressedImg])
			{
				$(this.parentNode).find('.buttonImg')[0].src = this[m_sPressedImg];
			}
			this[m_bMouseDown] = true;
		}

		mouseup()
		{
			if(this[m_sReleasedImg])
			{
				$(this.parentNode).find('.buttonImg')[0].src = this[m_sReleasedImg];
			}
			this[m_bMouseDown] = false;
		}

		mouseout()
		{
			if(this[m_sReleasedImg])
			{
				$(this.parentNode).find('.buttonImg')[0].src = this[m_sReleasedImg];
			}
		}

		mouseenter()
		{
			if(this[m_sPressedImg] && this[m_bMouseDown])
			{
				$(this.parentNode).find('.buttonImg')[0].src = this[m_sPressedImg];
			}
			else if(this[m_sHoverImg] && !this[m_bMouseDown])
			{
				$(this.parentNode).find('.buttonImg')[0].src = this[m_sHoverImg];
			}
		}

		click()
		{
			if(this[m_bTriggered] && this[m_bOneTime])
			{
				return;
			}
			this[m_bTriggered] = true;
			let oTarget;
			if(this[m_sTarget])
			{
				oTarget = $('#' + this[m_sTarget])[0];
			}
			else
			{
				oTarget = this.parentNode;
			}
			if(oTarget && oTarget[this[m_sEvent]] && typeof oTarget[this[m_sEvent]] === 'function')
			{
				oTarget[this[m_sEvent]].apply(oTarget[this[m_sEvent]], this[m_aParams]);
			}
		}

		reset()
		{
			this[m_bTriggered] = false;
		}

		setPressedImg(sPressedImg)
		{
			this[m_sPressedImg] = sPressedImg;
		}

		setHoverImg(sHoverImg)
		{
			this[m_sHoverImg] = sHoverImg;
		}

		getName() {return sComponentName;}
	}

	UTIL.componentMethod(Button.prototype.reset);
	document.registerElement('eec-' + sComponentName, {prototype: Button.prototype});
	return Button;
});
