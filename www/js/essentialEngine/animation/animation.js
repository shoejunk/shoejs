'use strict';

define(
[
	'jquery',
	'essentialEngine/common/utilities', 
	'essentialEngine/component/component',
]
, function(
	$,
	UTIL,
	Component)
{
	var sComponentName = 'Animation';

	// Private variables:
	const m_sAnimType = Symbol('m_sAnimType');
	const m_iFrames = Symbol('m_iFrames');
	const m_sImage = Symbol('m_sImage');
	const m_oAnimElem = Symbol('m_oAnimElem');
	const m_iFrame = Symbol('m_iFrame');
	const m_hAnimInterval = Symbol('m_hAnimInterval');
	const m_iDamageFrame = Symbol('m_iDamageFrame');

	class Animation extends Component
	{
		createdCallback()
		{
			this[m_iFrame] = 0;
			this[m_hAnimInterval] = null;
			this.preconstruct();
		}

		preInit(callback)
		{
			this[m_oAnimElem] = $('<img src="' + this[m_sImage] + '">');
			this[m_oAnimElem].css({position: 'absolute' });
			this[m_oAnimElem].css({width: (this[m_iFrames] * 100) + '%'});
			this[m_oAnimElem].css({left: 0});
			$(this[m_oAnimElem]).hide();
			$(this.parentNode).append(this[m_oAnimElem]);
			callback();
		}

		setAnimType(sAnimType)
		{
			this[m_sAnimType] = sAnimType;
		}

		setFrames(iFrames)
		{
			this[m_iFrames] = iFrames;
		}

		setImage(sImage)
		{
			this[m_sImage] = sImage;
		}

		setDamageFrame(iDamageFrame)
		{
			this[m_iDamageFrame] = iDamageFrame;
		}

		getName() {return sComponentName;}

		advanceAnimation(bLoop, damageCallback)
		{
			++this[m_iFrame];
			if(this[m_iFrame] >= this[m_iFrames])
			{
				if(bLoop)
				{
					this[m_iFrame] = 0;
				}
				else
				{
					return true;
				}
			}

			this[m_oAnimElem].css({left: (-100 * this[m_iFrame]) + '%'});
			if(this[m_iDamageFrame] !== null && damageCallback && this[m_iFrame] == this[m_iDamageFrame])
			{
				damageCallback();
			}
			return false;
		}
		
		loopAnim(sAnimType, fFps, fTime=null, aEndPos=null, sEndAnimType=null, callback=null, aFrames=null, damageCallback=null)
		{
			if(sAnimType !== this[m_sAnimType] || $(this[m_oAnimElem]).is(':visible'))
			{
				return;
			}
			this.parentNode.hideAnims();
			if(this[m_iFrames] === 1 && fTime === null)
			{
				this[m_oAnimElem].css({left: (-100 * this[m_iFrame]) + '%'});
				$(this[m_oAnimElem]).show();
				return;
			}
			let iNumFrames;
			if(aFrames)
			{
				iNumFrames = aFrames[1] - aFrames[0] + 1;
				this[m_iFrame] = aFrames[0];
			}
			else
			{
				iNumFrames = this[m_iFrames];
				this[m_iFrame] = 0;
			}
			this[m_oAnimElem].css({left: (-100 * this[m_iFrame]) + '%'});
			$(this[m_oAnimElem]).show();
			if(this[m_iDamageFrame] !== null && damageCallback && this[m_iFrame] == this[m_iDamageFrame])
			{
				damageCallback();
			}
			let fStartTime;
			let fEndTime;
			let aStartPos;
			let bShouldLoop = true;
			if(!fTime && (callback || sEndAnimType))
			{
				bShouldLoop = false;
			}
			if(!fFps && aFrames)
			{
				bShouldLoop = false;
			}
			if(fTime)
			{
				fStartTime = new Date().getTime();
				fEndTime = fStartTime + (fTime * 1000);
				aStartPos = [this.parentNode.getAnalogX(), this.parentNode.getAnalogY()];
			}
			if(!fFps || fFps === 0)
			{
				// Calculate FPS so that the animation fits in the time given:
				UTIL.assert(fTime, 'In loopAnim, if FPS is not given, then time must be given');
				fFps = iNumFrames / fTime;
			}
			var fAnimIntervalTime = 1000 / fFps;
			var oThis = this;
			function onInterval()
			{
				if(oThis.advanceAnimation(bShouldLoop, damageCallback))
				{
					if(aEndPos)
					{
						oThis.parentNode.analogMove(aEndPos[0], aEndPos[1]);
					}
					if(callback)
					{
						callback();
					}
					oThis.hideAnims();
					if(sEndAnimType)
					{
						oThis.parentNode.loopAnim(sEndAnimType, fFps);
					}
					return;
				}
				if(fTime)
				{
					let fX;
					let fY;
					let fCurrentTime = new Date().getTime();
					if(fCurrentTime > fEndTime)
					{
						if(aEndPos)
						{
							oThis.parentNode.analogMove(aEndPos[0], aEndPos[1]);
						}
						fCurrentTime = fEndTime;
						oThis.hideAnims();
						if(sEndAnimType)
						{
							oThis.parentNode.loopAnim(sEndAnimType, fFps);
						}
						if(aEndPos)
						{
							oThis.parentNode.analogMove(aEndPos[0], aEndPos[1]);
						}
						if(callback)
						{
							callback();
						}
						return;
					}
					if(aStartPos && aEndPos)
					{
						[fX, fY] = UTIL.getTweenPoint2(aStartPos[0], aStartPos[1], aEndPos[0], aEndPos[1], (fCurrentTime - fStartTime) / (fTime * 1000));
						oThis.parentNode.analogMove(fX, fY);
					}
				}
			}

			this[m_hAnimInterval] = setInterval(onInterval, fAnimIntervalTime);
		}

		setAnimPos(sAnimType, fPos)
		{
			if(sAnimType !== this[m_sAnimType] || !this[m_oAnimElem])
			{
				return;
			}
			if(this[m_hAnimInterval])
			{
				clearInterval(this[m_hAnimInterval]);
				this[m_hAnimInterval] = null;
			}
			$(this[m_oAnimElem]).show();
			let fFrame = (fPos * this[m_iFrames]) % this[m_iFrames];
			this[m_iFrame] = Math.floor(fFrame);
			if(this[m_iFrame] < 0)
			{
				this[m_iFrame] = this[m_iFrames] + this[m_iFrame];
			}
			if(this[m_iFrame] >= this[m_iFrames])
			{
				this[m_iFrame] = this[m_iFrames] - 1;
			}
			this[m_oAnimElem].css({left: (-100 * this[m_iFrame]) + '%'});
		}

		hideAnims()
		{
			$(this[m_oAnimElem]).hide();
			if(this[m_hAnimInterval])
			{
				clearInterval(this[m_hAnimInterval]);
				this[m_hAnimInterval] = null;
			}
		}
	}

	UTIL.componentMethod(Animation.prototype.setAnimType);
	UTIL.componentMethod(Animation.prototype.setFrames);
	UTIL.componentMethod(Animation.prototype.setImage);
	UTIL.componentMethod(Animation.prototype.loopAnim);
	UTIL.componentMethod(Animation.prototype.setAnimPos);
	UTIL.componentMethod(Animation.prototype.hideAnims);

	document.registerElement('eec-' + sComponentName, {prototype: Animation.prototype});
	return Animation;
});
