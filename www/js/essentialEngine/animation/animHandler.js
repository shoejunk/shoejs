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
	const sComponentName = 'AnimHandler';

	// Private variables:
	const m_jSequences = Symbol('m_jSequences');
	const m_sSequencePlaying = Symbol('m_sSequencePlaying');
	const m_iCurrentStep = Symbol('m_iCurrentStep');
	const m_aCurrentPos = Symbol('m_aCurrentPos');

	// Private functions:
	const playAnimStep = Symbol('playAnimStep');
	const nextAnimStep = Symbol('nextAnimStep');

	class AnimHandler extends Component
	{
		createdCallback()
		{
			this[m_jSequences] = {};
			this[m_sSequencePlaying] = null;
			this[m_iCurrentStep] = null;
			this.preconstruct();
		}

		preInit(callback)
		{
			for(let oSequence of this.children)
			{
				let oSequenceName = $(oSequence).find('name');
				oSequenceName = oSequenceName.length > 0 ? oSequenceName[0] : null;
				if(oSequenceName)
				{
					let sSequenceName = oSequenceName.innerHTML;
					let aAnimSteps = $(oSequence).find('animStep');
					if(aAnimSteps.length > 0)
					{
						this[m_jSequences][sSequenceName] = [];
						for(let i = 0; i < aAnimSteps.length; ++i)
						{
							let oAnimStep = aAnimSteps[i];
							let jAnimStepData = {};
							for(let oAnimStepProp of oAnimStep.children)
							{
								if(oAnimStepProp.tagName === 'ANIMFRAMES')
								{
									jAnimStepData[oAnimStepProp.tagName] = oAnimStepProp.innerHTML.split(',');
								}
								else
								{
									jAnimStepData[oAnimStepProp.tagName] = oAnimStepProp.innerHTML;
								}
							}
							this[m_jSequences][sSequenceName].push(jAnimStepData);
						}
					}
				}
			}
			callback();
		}

		getName() {return sComponentName;}

		playAnimSequence(sAnimSequence, aStartPos, aEndPos, aVictimPos, aStaging, sFinishingAnim, damageCallback)
		{
			if(this[m_sSequencePlaying] !== null)
			{
				return;
			}
			this[m_aCurrentPos] = aStartPos;
			let aAnimSequence = this[m_jSequences][sAnimSequence];
			if(UTIL.isArray(aAnimSequence))
			{
				this[m_sSequencePlaying] = sAnimSequence;
				this[m_iCurrentStep] = 0;
				let jStep = aAnimSequence[0];
				this[playAnimStep](jStep, aStartPos, aEndPos, aVictimPos, aStaging, sFinishingAnim, damageCallback);
			}
		}

		hasAnimSequence(sAnimSequence)
		{
			return UTIL.isArray(this[m_jSequences][sAnimSequence]);
		}

		[playAnimStep](jStep, aStartPos, aEndPos, aVictimPos, aStaging, sFinishingAnim, damageCallback)
		{
			UTIL.assertString(jStep.ANIM);
			let aMoveTo;
			if(jStep.MOVETO)
			{
				if(jStep.MOVETO === 'end')
				{
					aMoveTo = aEndPos;
				}
				else if(jStep.MOVETO === 'victim')
				{
					aMoveTo = aVictimPos;
				}
				else if(jStep.MOVETO === 'stage')
				{
					aMoveTo = aStaging;
				}
				else if(jStep.MOVETO === 'start')
				{
					aMoveTo = aStartPos;
				}
				if(jStep.OPTIONAL && jStep.OPTIONAL.toLowerCase() === 'true' && this[m_aCurrentPos][0] === aMoveTo[0] && this[m_aCurrentPos][1] === aMoveTo[1])
				{
					// Already at this position and the animation is optional, so skip it:
					this[nextAnimStep](aStartPos, aEndPos, aVictimPos, aStaging, sFinishingAnim, damageCallback);
					return;
				}
				this[m_aCurrentPos] = aMoveTo;
			}
			let sNextAnim = null;
			if(sFinishingAnim && this[m_iCurrentStep] === this[m_jSequences][this[m_sSequencePlaying]].length - 1)
			{
				sNextAnim = sFinishingAnim;
			}
			this.parentNode.loopAnim(jStep.ANIM, jStep.FPS, jStep.TIME, aMoveTo, sNextAnim, this[nextAnimStep].bind(this, aStartPos, aEndPos, aVictimPos, aStaging, sFinishingAnim, damageCallback), jStep.ANIMFRAMES, damageCallback);
		}

		[nextAnimStep](aStartPos, aEndPos, aVictimPos, aStaging, sFinishingAnim, damageCallback)
		{
			let aCurrentSequence = this[m_jSequences][this[m_sSequencePlaying]];
			++this[m_iCurrentStep];
			if(this[m_iCurrentStep] >= aCurrentSequence.length)
			{
				// Sequence over
				this[m_iCurrentStep] = null;
				this[m_sSequencePlaying] = null;
			}
			else
			{
				this[playAnimStep](aCurrentSequence[this[m_iCurrentStep]], aStartPos, aEndPos, aVictimPos, aStaging, sFinishingAnim, damageCallback);
			}
		}
	}

	UTIL.componentMethod(AnimHandler.prototype.playAnimSequence);
	UTIL.componentMethod(AnimHandler.prototype.hasAnimSequence);

	document.registerElement('eec-' + sComponentName, {prototype: AnimHandler.prototype});
	return AnimHandler;
});
