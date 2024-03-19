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
	var sComponentName = 'BackgroundImage';

	// Protected variables:
	const m_sImage = Symbol('m_sImage');

	class BackgroundImage extends Component
	{
		createdCallback()
		{
			this.preconstruct();
		}

		setImage(sImage)
		{
			this[m_sImage] = sImage;
			this.reset();
		}

		darken()
		{
			document.body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6) ), url(${this[m_sImage]})`;
		}

		removeImage()
		{
			document.body.style.backgroundImage = null;
		}

		reset()
		{
			document.body.style.backgroundImage = `url(${this[m_sImage]})`;
		}

		getName() {return sComponentName;}
	}

	UTIL.componentMethod(BackgroundImage.prototype.darken);
	UTIL.componentMethod(BackgroundImage.prototype.removeImage);
	UTIL.componentMethod(BackgroundImage.prototype.reset);
	document.registerElement('eec-' + sComponentName, {prototype: BackgroundImage.prototype});
	return BackgroundImage;
});
