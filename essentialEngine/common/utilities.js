define(['jquery'], function($)
{
	window.MutationObserver = window.MutationObserver
		|| window.WebKitMutationObserver
		|| window.MozMutationObserver;

	function errorMessage(sMessage)
	{
		if( typeof alert === 'undefined' )
		{
			throw new AssertException(sMessage);
		}
		else
		{
			alert(sMessage);
			throw new AssertException(sMessage);
		}
	}

	function AssertException(sMessage)
	{
		this.m_sMessage = sMessage;
	}

	AssertException.prototype.toString = function()
	{
		return 'AssertException: ' + this.m_sMessage;
	};

	function assert(mExp, sMessage)
	{
		if(!mExp)
		{
			errorMessage(sMessage);
			//console.trace();
			//throw new AssertException( sMessage );
		}
	}

	function assertExists(mExp, sErrorMessage)
	{
		sErrorMessage = (sErrorMessage === undefined) ? 'undefined variable' : sErrorMessage;
		assert(mExp !== undefined, sErrorMessage);
	}

	function assertArray(mExp)
	{
		assertExists(mExp);
		assert(mExp instanceof Array, 'variable not array');
	}

	function assertString(mExp)
	{
		assertExists(mExp);
		assert(typeof mExp === 'string', 'variable not string');
	}

	function assertObject(mExp)
	{
		assertExists(mExp);
		assert(typeof mExp === 'object', 'variable not object');
	}

	function assertFloat(mExp)
	{
		assertExists(mExp);
		assert(typeof mExp === 'number', 'variable not a float');
	}

	function assertInt(mExp, sErrorMessage)
	{
		assertExists(mExp, sErrorMessage);
	    sErrorMessage = (sErrorMessage === undefined) ? 'variable is not an integer' : sErrorMessage;
		assert(isInt(mExp), sErrorMessage);
	}

	function assertFunction(mExp)
	{
		assertExists(mExp);
		assert(typeof mExp === 'function');
	}

	function assertBool(mExp)
	{
		assertExists(mExp);
		assert(typeof mExp === 'boolean');
	}

	function assertGameObject(mExp)
	{
		assertObject(mExp);
		assert(mExp.nodeName === 'EE-GAMEOBJECT', 'variable not GameObject');
	}

	// Pick a random int from iMinInt to iMaxInt, inclusive [iMinInt, iMaxInt]
	function randomInt(iMinInt, iMaxInt)
	{
		var iRange = iMaxInt - iMinInt + 1;
		var iRand = Math.random() * iRange;
		return Math.floor(iRand) + iMinInt;
	}

	function getEventX(e, thisEvent)
	{
		if(exists(e.screenX))
		{
			return e.screenX;
		}

		thisEvent = thisEvent || event;
		if(thisEvent.touches && thisEvent.touches[0] && exists(thisEvent.touches[ 0 ].screenX))
		{
			return thisEvent.touches[0].screenX;
		}

		return null;
	}

	function getEventY(e, thisEvent)
	{
		if(exists(e.screenY))
		{
			return e.screenY;
		}

		thisEvent = thisEvent || event;
		if(thisEvent.touches && thisEvent.touches[0] && exists(thisEvent.touches[0].screenY))
		{
			return thisEvent.touches[0].screenY;
		}

		return null;
	}

	function bindTap(element, callback, selectClass)
	{
		$(element).bind(getTouchStartEvent(), function(e)
		{
			if(selectClass)
			{
				$(element).addClass(selectClass);
			}

			element.tapX = getEventX(e);
			element.tapY = getEventY(e);
			element.event = event;
			element.clickTimer = setTimeout(function()
			{
				element.clickTimer = null;
				if(selectClass)
				{
					$(element).removeClass(selectClass);
				}
			}, 5000);
		} );

		$(element).bind(getTouchEndEvent(), function(e)
		{
			if(selectClass)
			{
				$(element).removeClass(selectClass);
			}

			if(element.clickTimer)
			{
				if(isInRange(getEventX(e, element.event), element.tapX, 40) &&
					isInRange(getEventY(e, element.event), element.tapY, 40))
				{
					callback(e);
				}

				clearTimeout(element.clickTimer);
				element.clickTimer = null;
			}
		} );

		$(element).bind('mouseout', function()
		{
			element.clickTimer = null;
			if(selectClass)
			{
				$(element).removeClass(selectClass);
			}
		} );
	}

	function unbindTap(element)
	{
		$(element).unbind(getTouchStartEvent());
		$(element).unbind(getTouchEndEvent());
		$(element).unbind('mouseout');
	}

	function isInRange(number1, number2, range)
	{
		var dif = Math.abs(number1 - number2);
		if(dif <= range)
		{
			return true;
		}

		return false;
	}

	function isTouchDevice()
	{
		return(typeof window !== 'undefined') ? !!('ontouchstart' in window) : false;
	}

	function getTouchStartEvent()
	{
		return isTouchDevice() ? 'touchstart' : 'mousedown';
	}

	function getTouchEndEvent()
	{
		return isTouchDevice() ? 'touchend' : 'mouseup';
	}

	function exists(obj)
	{
		return !(typeof obj === 'undefined');
	}

	function getUrlParams()
	{
		if(typeof this.urlParams === 'undefined')
		{
			this.urlParams = {};
			var that = this;
			var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value)
			{
				that.urlParams[key] = value;
			});
		}

		return this.urlParams;
	}

	function getHostName()
	{
		return window.location.hostname;
	}

	function getSubDomain()
	{
		return window.location.hostname.split( '.' )[ 0 ];
	}

	function isTrueString(string)
	{
		var checkString = string.toLowerCase();
		if(checkString === 'true' || checkString === 't' || checkString === '1')
		{
			return true;
		}

		return false;
	}

	function isInt(mExp)
	{
		assertExists(mExp);
		if((typeof mExp === 'number' ) && (mExp % 1 === 0))
		{
			return true;
		}
		return false;
	}

	function isArray(mExp)
	{
		if(!exists(mExp))
		{
			return false;
		}
		return mExp instanceof Array;
	}

	function setDefaults(jVars, jDefaults)
	{
		assertObject(jVars);
		assertObject(jDefaults);
		for(sKey in jDefaults)
		{
			if(!(sKey in jVars))
			{
				jVars[sKey] = jDefaults[sKey];
			}
		}
	}

	function cloneJson(jData)
	{
		return $.extend(true, {}, jData);
	}

	function makeClass(NewClass, ParentClass)
	{
		NewClass.construct = function construct()
		{
			var aArgs = [this].concat(Array.prototype.slice.call(arguments));
			var ConstructorFunc = this.bind.apply(this, aArgs);
			var oObject = new ConstructorFunc();
			if('construct' in oObject)
			{
				oObject.construct();
			}
			return oObject;
		};
		if(typeof ParentClass !== 'undefined')
		{
			NewClass.prototype = new ParentClass();
		}
	}

	function preloadImage(sUrl, oChecklist)
	{
		var oImage = document.createElement('IMG');
		oImage.src = sUrl;
		oChecklist.addRequirement();
		oImage.onload = function preloadDone()
		{
			oChecklist.meetRequirement();
		};
	}

	// Use callbackChain to call an asynchronous function when that asynchronous function takes 0 or more
	// parameters stored in aAsyncFuncParams. After those parameters, the asynchronous function should also
	// take a callback as its final paramter. This final parameter should not be passed into callbackChain.
	// Instead callbackChain will provide this function, and its function will be to call all functions inside
	// aUserCallbacks, using oThisInUserCallbacks as the 'this' context.
	function callbackChain(asyncFunc, aAsyncFuncParams, aUserCallbacks, oThisInUserCallbacks)
	{
		function asyncCallback()
		{
			// Call all user callbacks, passing along any arguments given by the async call and using
			// oThisInUserCallbacks as the 'this' context:
			for(var i = 0; i < aAsyncFuncParams.length; ++i)
			{
				aAsyncFuncParams[i].apply(oThisInUserCallbacks, arguments);
			}
		}
		if(!aAsyncFuncParams)
		{
			aAsyncFuncParams = [asyncCallback];
		}
		else
		{
			aAsyncFuncParams.push(asyncCallback);
		}
		asyncFunc.apply(null, aAsyncFuncParams);
	}

	function updateJson(jDestination, jSource)
	{
		for(sKey in jSource)
		{
			jDestination[sKey] = jSource[sKey];
		}
	}

	function eventFire(oElement, sType)
	{
		if (oElement.fireEvent)
		{
			oElement.fireEvent('on' + sType);
		}
		else
		{
			var oEvent = document.createEvent('Events');
			oEvent.initEvent(sType, true, false);
			oElement.dispatchEvent(oEvent);
		}
	}

	function getTweenPoint(fStartX, fEndX, fTween)
	{
		var fXAmount = (fEndX - fStartX) * fTween;
		return fStartX + fXAmount;
	}

	function getTweenPoint2(fStartX, fStartY, fEndX, fEndY, fTween)
	{
		var fXAmount = (fEndX - fStartX) * fTween;
		var fYAmount = (fEndY - fStartY) * fTween;
		return [fStartX + fXAmount, fStartY + fYAmount];
	}

	function ensureArray(mObject)
	{
		if(mObject instanceof Array)
		{
			return mObject;
		}
		return [mObject];
	}

	// Given a trapezoid defined by a top width, bottom width and height, returns the distance from the camera that the bottom of an equilateral quad(square) would
	// need to be in order for it to appear to fit perfectly inside the trapezoid when the sides of the square are equal to the bottom of the trapezoid:
	function trapezoidToQuad3dDepth(t, b)
	{
		//return (fTrapezoidTopWidth * fTrapezoidBottomWidth * Math.sqrt(1 - (Math.pow(fTrapezoidHeight, 2) / Math.pow(fTrapezoidTopWidth, 2))) / (fTrapezoidBottomWidth - fTrapezoidTopWidth));
		var fTerm1 = Math.pow(t, 4);
		var fTerm2 = Math.pow(t, 2) * Math.pow(b, 2);
		var fTerm3 = -2 * Math.pow(t, 3) * b;
		var fTerm4 = -Math.pow(b, 2);
		var fTerm5 = 2 * t * b;
		var fTerm6 = -Math.pow(t, 2);
		var fNum = fTerm1 + fTerm2 + fTerm3;
		var fDen = fTerm4 + fTerm5 + fTerm6;
		var fQuot = fNum / fDen;
		var p = Math.sqrt(fQuot);
		//var p2 = -p;
		return p;
	}

	// Given a trapezoid with the given top width and height, returns the angle(in radians) to tilt an equilateral quad(square) such that the quad will fit perfectly
	// inside the trapezoid:
	function trapezoidToQuad3dAngle(fTrapezoidHeight, fTrapezoidBottomWidth, fTrapezoidTopWidth, fTrapezoidDepth)
	{
		//var fAngle1 = Math.acos(fTrapezoidHeight / fTrapezoidTopWidth);
		//return fAngle1;
		var tsq = Math.pow(fTrapezoidTopWidth, 2);
		var bsq = Math.pow(fTrapezoidBottomWidth, 2);
		var psq = Math.pow(fTrapezoidDepth, 2);
		var fTerm1 = -tsq * fTrapezoidDepth * fTrapezoidBottomWidth;
		var fTerm2 = fTrapezoidDepth * fTrapezoidBottomWidth * Math.sqrt((tsq * bsq) - (psq * tsq) + (psq * bsq));
		var fTerm3 = (tsq * bsq) + (psq * bsq);
		var theta = Math.asin((fTerm1 + fTerm2) / fTerm3);
		//var theta2 = Math.asin((fTerm1 - fTerm2) / fTerm3);
		return theta;
	}

	function convertNumberRange(fNumber, fMin, fMax, fToMin, fToMax)
	{
		return ((fNumber - fMin) * (fToMax - fToMin) / (fMax - fMin)) + fToMin;
	}

	function factor(iNumber)
	{
		var iFactor = 2;
		var aFactors = [];
		while(iFactor <= iNumber)
		{
			if(iNumber % iFactor == 0)
			{
				aFactors.push(iFactor);
				iNumber = iNumber / iFactor;
			}
			else
			{
				++iFactor;
			}
		}

		return aFactors;
	}

	function componentMethod(func)
	{
		func.COMPONENT_METHOD = true;
		return func;
	}

	function concat(aArr1, aArr2)
	{
		aResult = [];
		for(var i = 0; i < aArr1.length; ++i)
		{
			aResult.push(aArr1[i]);
		}

		for(var i = 0; i < aArr2.length; ++i)
		{
			aResult.push(aArr2[i]);
		}

		return aResult;
	}

	function clamp(fNum, fMin, fMax)
	{
		return Math.max(Math.min(fNum, fMax), fMin);
	}

	function insertSorted(aArr, mItem, comparator)
	{
		if (comparator == null)
		{
			// Emulate the default Array.sort() comparator which is alphabetical:
			comparator = function(a, b) {
				if (typeof a !== 'string') a = String(a);
				if (typeof b !== 'string') b = String(b);
				return (a > b ? 1 : (a < b ? -1 : 0));
			};
		}

		// Get the index we need to insert the item at:
		var iMin = 0;
		var iMax = aArr.length;
		var iIndex = Math.floor((iMin + iMax) / 2);
		while (iMax > iMin)
		{
			if (comparator(mItem, aArr[iIndex]) < 0)
			{
				iMax = iIndex;
			}
			else
			{
				iMin = iIndex + 1;
			}
			iIndex = Math.floor((iMin + iMax) / 2);
		}

		// Insert the item:
		aArr.splice(iIndex, 0, mItem);
	}

	function numericalComparitor(a, b)
	{
		return a - b;
	}

	function reverseNumericalComparitor(a, b)
	{
		return b - a;
	}

	function recursiveEquals(mItem1, mItem2, bStrict)
	{
		if(typeof mItem1 !== typeof mItem2)
		{
			return false;
		}
		if(mItem1 instanceof Array)
		{
			if(mItem1.length !== mItem2.length)
			{
				return false;
			}
			for(var i = 0; i < mItem1.length; ++i)
			{
				if(!recursiveEquals(mItem1[i], mItem2[i], bStrict))
				{
					return false;
				}
			}
			return true;
		}
		else if(typeof mItem1 === 'object')
		{
			for(var sKey in mItem1)
			{
				if(!(sKey in mItem2) || !recursiveEquals(mItem1[sKey], mItem2[Skey], bStrict))
				{
					return false;
				}
			}
			return true;
		}
		else if(bStrict)
		{
			return (mItem1 === mItem2);
		}
		else
		{
			return (mItem1 == mItem2);
		}
	}

	function recursiveIn(mMember, aArr, bStrict)
	{
		for(var i = 0; i < aArr.length; ++i)
		{
			if(recursiveEquals(mMember, aArr[i], bStrict))
			{
				return true;
			}
		}
		return false;
	}

	function shuffle(aArr)
	{
		let iSwapPos, iOldValue;
		for(var i = 0; i < aArr.length; ++i)
		{
			iSwapPos = UTIL.randomInt(0, aArr.length - 1);
			iOldValue = aArr[i];
			aArr[i] = aArr[iSwapPos];
			aArr[iSwapPos] = iOldValue;
		}
	}

	function toInt(sStr)
	{
		return parseInt(sStr, 10);
	}

	function spelledNumToNum(sStr)
	{
		let jSmall =
		{
			'zero': 0,
			'one': 1,
			'two': 2,
			'three': 3,
			'four': 4,
			'five': 5,
			'six': 6,
			'seven': 7,
			'eight': 8,
			'nine': 9,
			'ten': 10,
			'eleven': 11,
			'twelve': 12,
			'thirteen': 13,
			'fourteen': 14,
			'fifteen': 15,
			'sixteen': 16,
			'seventeen': 17,
			'eighteen': 18,
			'nineteen': 19,
			'twenty': 20,
			'thirty': 30,
			'forty': 40,
			'fifty': 50,
			'sixty': 60,
			'seventy': 70,
			'eighty': 80,
			'ninety': 90
		};

		let jMagnitude =
		{
			'thousand':     1000,
			'million':      1000000,
			'billion':      1000000000,
			'trillion':     1000000000000,
			'quadrillion':  1000000000000000,
			'quintillion':  1000000000000000000,
			'sextillion':   1000000000000000000000,
			'septillion':   1000000000000000000000000,
			'octillion':    1000000000000000000000000000,
			'nonillion':    1000000000000000000000000000000,
			'decillion':    1000000000000000000000000000000000,
		};

		var a, n, g;

		function feach(w)
		{
			var x = jSmall[w];
			if (x != null)
			{
				g = g + x;
			}
			else if (w == "hundred")
			{
				g = g * 100;
			}
			else
			{
				x = jMagnitude[w];
				if (x != null)
				{
					n = n + g * x;
					g = 0;
				}
			}
		}

		a = sStr.toString().split(/[\s-]+/);
		n = 0;
		g = 0;
		a.forEach(feach);
		return n + g;
	}

	let jCommandLines = null;
	function getCommandLineArg(sArg)
	{
		if(jCommandLines)
		{
			return jCommandLines[sArg];
		}
		jCommandLines = {};
		for(let i = 2; i < process.argv.length; ++i)
		{
			const sVal = process.argv[i];
			const aArgPair = sVal.split('=');
			if(aArgPair.length === 2)
			{
				jCommandLines[aArgPair[0]] = aArgPair[1];
			}
		}
		return jCommandLines[sArg];
	}

	let fScale = 1;
	function getScale()
	{
		return fScale;
	}

	function getTextWidth(sText, oFont) {
		// re-use canvas object for better performance
		const oCanvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
		const oContext = oCanvas.getContext("2d");
		oContext.font = oFont;
		const jMetrics = oContext.measureText(sText);
		return jMetrics.width;
	}

	function shrinkTextToFit(sText, sFontWeight, sFontFamily, iFontSize, iDesiredWidth)
	{
		while(getTextWidth(sText, `${sFontWeight} ${iFontSize}px ${sFontFamily}`) > iDesiredWidth && iFontSize > 0)
		{
			--iFontSize;
		}
		return iFontSize;
	}

	function setScale(fNewScale)
	{
		fScale = fNewScale;
		document.body.style.transform = 'scale(' + fNewScale + ')';
	}

	function toString(mVar)
	{
		if(typeof mVar === 'object')
		{
			try
			{
				return JSON.stringify(mVar);
			}
			catch(e)
			{
				if(mVar.toString && typeof mVar.toString === 'function')
				{
					return mVar.toString();
				}
			}
		}
		else if(typeof mVar == 'number')
		{
			return mVar.toString();
		}
		return mVar;
	}
	
	function makeIterator(aArr)
	{
		UTIL.assertInt(aArr.length);
		if(!(Symbol.iterator in aArr))
		{
			aArr[Symbol.iterator] = function*()
			{
				for(let i = 0; i < aArr.length; ++i)
				{
					yield aArr[i];
				}
			}
		}
		return aArr;
	}

	function loadHtml(sHtmlPath, callback)
	{
		requirejs(['text!' + sHtmlPath], sHtml => callback(sHtml));
	}

	function loadHtmlPromise(sHtmlPath)
	{
		return new Promise(loadHtml.bind(this, sHtmlPath));
	}

	async function loadHtmlFromTemplate(sHtmlPath, oParent, jTemplateArgs)
	{
		let sHtml;
		try
		{
			sHtml = await loadHtmlPromise(sHtmlPath);
		}
		catch(err)
		{
			alert(err);
		}
		for (let sKey in jTemplateArgs)
		{
			const oRegex = new RegExp('@{' + sKey + '}', 'g');
			sHtml = sHtml.replace(oRegex, jTemplateArgs[sKey]);
		}
		const oDiv = document.createElement('div');
		oDiv.innerHTML = sHtml;
		oParent.appendChild(oDiv.firstChild);
		return oDiv.firstChild;
	}

	function onInitGameObjectPromise(gGameObject)
	{
		return new Promise((resolve, reject) =>
		{
			function onLoad()
			{
				UTIL.assertFunction(gGameObject.onInit);
				gGameObject.onInit(resolve);
			}

			// Wait for the game object to load:
			if(gGameObject.onLoad)
			{
				gGameObject.onLoad(onLoad);
			}
			else if(gGameObject.m_aOnLoads)
			{
				gGameObject.m_aOnLoads.push(onLoad);
			}
			else
			{
				gGameObject.m_aOnLoads = [onLoad];
			}
		});
	}

	async function loadGameObjectFromTemplate(sHtmlPath, oParent, sSelector, jTemplateArgs)
	{
		await loadHtmlFromTemplate(sHtmlPath, oParent, jTemplateArgs);
		let gGameObject = $(oParent).find(sSelector)[0];
		UTIL.assertGameObject(gGameObject);
		await onInitGameObjectPromise(gGameObject);
		assertGameObject(gGameObject);
		return gGameObject;
	}

	async function getGameObjectWithCache(sHtmlPath, oParent, sSelector, jTemplateArgs)
	{
		let aGameObject = $(oParent).find(sSelector);
		if(aGameObject && aGameObject.length > 0)
		{
			return aGameObject[0];
		}
		return loadGameObjectFromTemplate(sHtmlPath, oParent, sSelector, jTemplateArgs);
	}

	function getElementsFromAttributes(oDiv, ...aAttributes)
	{
		return aAttributes.map(aAttribute => $('#' + oDiv.getAttribute(aAttribute))[0]);
	}

	let uniqueId = 0;
	function generateUniqueId()
	{
		return uniqueId++;
	}

	function getArrayDepth(aArray)
	{
		let iArrayDepth = 0;
		let aCurArray = aArray;
		while(UTIL.isArray(aCurArray))
		{
			++iArrayDepth;
			if(aCurArray.length === 0)
			{
				return iArrayDepth;
			}
			aCurArray = aCurArray[0];
		}
		return iArrayDepth;
	}

	function isObject(mExp)
	{
		// Exists?
		if(!exists(mExp))
		{
			return false;
		}

		// Is object?
		if(typeof mExp === 'object')
		{
			return true;
		}

		// Exists, but is not an object:
		return false;
	}

	function isGameObject(mExp)
	{
		// Is an object?
		if(!isObject(mExp))
		{
			return false;
		}

		// Is a game object?
		if(mExp.nodeName === 'EE-GAMEOBJECT')
		{
			return true;
		}

		// Is an object, but not a game object:
		return false;
	}

	function zeroPad(iNumber, iDigits)
	{
		let sPaddedNumber = iNumber.toString();
		while(sPaddedNumber.length < iDigits)
		{
			sPaddedNumber = '0' + sPaddedNumber;
		}
		return sPaddedNumber;
	}

	function formatSeconds(iSeconds)
	{
		let iFormattedSeconds = iSeconds % 60;
		let iMinutes = (iSeconds - iFormattedSeconds) / 60;
		return `${iMinutes}:${zeroPad(iFormattedSeconds, 2)}`;
	}

	function nearbySpaceAndTime(iOldX, iOldY, iOldTime, iX, iY, iTime)
	{
		if (Math.abs(iX - iOldX) < 3 && Math.abs(iY - iOldY) < 3 && iTime - iOldTime < 500)
		{
			return true;
		}
		return false;
	}

	function digitalPosToAnalog(aDigitalPos)
	{
		if(aDigitalPos)
		{
			return [aDigitalPos[0] + 0.5, aDigitalPos[1] + 0.1];
		}
		return null;
	}

	function isFunction(mExp)
	{
		return typeof mExp === 'function';
	}

	let aLogTagsToShow = {General: true, Error: true};
	function log(sText, aTags)
	{
		if(!aTags)
		{
			aTags = ['General'];
		}
		if(!isArray(aTags))
		{
			aTags = [aTags];
		}
		for(const sTag of aTags)
		{
			if(sTag in aLogTagsToShow && aLogTagsToShow[sTag])
			{
				console.log(`[${aTags.join(' ')}] ${sText}`);
				return;
			}
		}
	}

	function addLogTag(sLogTag)
	{
		aLogTagsToShow[sLogTag] = true;
	}

	function removeLogTag(sLogTag)
	{
		aLogTagsToShow[sLogTag] = false;
	}

	function addLogTags(aLogTags)
	{
		aLogTags.forEach(sLogTag => aLogTagsToShow[sLogTag] = true)
	}

	function removeLogTags(aLogTags)
	{
		aLogTags.forEach(sLogTag => aLogTagsToShow[sLogTag] = false)
	}

	function clearLogTags()
	{
		aLogTagsToShow = [];
	}

	UTIL = 
	{
		addLogTag                 : addLogTag,
		addLogTags                : addLogTags,
		assert                    : assert,
		assertArray               : assertArray,
		assertBool                : assertBool,
		assertExists              : assertExists,
		assertFloat               : assertFloat,
		assertFunction            : assertFunction,
		assertGameObject          : assertGameObject,
		assertInt                 : assertInt,
		assertObject              : assertObject,
		assertString              : assertString,
		bindTap                   : bindTap,
		callbackChain             : callbackChain,
		clearLogTags              : clearLogTags,
		eventFire                 : eventFire,
		exists                    : exists,
		isInRange                 : isInRange,
		isTouchDevice             : isTouchDevice,
		randomInt                 : randomInt,
		unbindTap                 : unbindTap,
		getTouchStartEvent        : getTouchStartEvent,
		getTouchEndEvent          : getTouchEndEvent,
		getUrlParams              : getUrlParams,
		getHostName               : getHostName,
		getSubDomain              : getSubDomain,
		isTrueString              : isTrueString,
		isInt                     : isInt,
		isArray                   : isArray,
		setDefaults               : setDefaults,
		cloneJson                 : cloneJson,
		makeClass                 : makeClass,
		preloadImage              : preloadImage,
		updateJson                : updateJson,
		getTweenPoint             : getTweenPoint,
		getTweenPoint2            : getTweenPoint2,
		ensureArray               : ensureArray,
		trapezoidToQuad3dDepth    : trapezoidToQuad3dDepth,
		trapezoidToQuad3dAngle    : trapezoidToQuad3dAngle,
		convertNumberRange        : convertNumberRange,
		factor                    : factor,
		componentMethod           : componentMethod,
		concat                    : concat,
		clamp                     : clamp,
		insertSorted              : insertSorted,
		numericalComparitor       : numericalComparitor,
		reverseNumericalComparitor: reverseNumericalComparitor,
		recursiveEquals           : recursiveEquals,
		recursiveIn               : recursiveIn,
		removeLogTag              : removeLogTag,
		removeLogTags             : removeLogTags,
		shuffle                   : shuffle,
		toInt                     : toInt,
		spelledNumToNum           : spelledNumToNum,
		getCommandLineArg         : getCommandLineArg,
		setScale                  : setScale,
		getScale                  : getScale,
		getTextWidth              : getTextWidth,
		shrinkTextToFit           : shrinkTextToFit,
		toString                  : toString,
		makeIterator              : makeIterator,
		loadHtml                  : loadHtml,
		loadHtmlPromise           : loadHtmlPromise,
		loadHtmlFromTemplate      : loadHtmlFromTemplate,
		getElementsFromAttributes : getElementsFromAttributes,
		onInitGameObjectPromise   : onInitGameObjectPromise,
		loadGameObjectFromTemplate: loadGameObjectFromTemplate,
		getGameObjectWithCache    : getGameObjectWithCache,
		generateUniqueId          : generateUniqueId,
		getArrayDepth             : getArrayDepth,
		isObject                  : isObject,
		isGameObject              : isGameObject,
		zeroPad                   : zeroPad,
		formatSeconds             : formatSeconds,
		nearbySpaceAndTime        : nearbySpaceAndTime,
		digitalPosToAnalog        : digitalPosToAnalog,
		isFunction                : isFunction,
		log                       : log
	};

	//if(typeof CryptoJS !== 'undefined')
	//{
	//	UTIL.generateKey = function generateKey()
	//	{
	//		return CryptoJS.SHA256(Math.random().toString()).toString(CryptoJS.enc.Hex);
	//	}
	//	UTIL.hash = function hash(sPlainString)
	//	{
	//		var sHash = CryptoJS.SHA256(sPlainString).toString(CryptoJS.enc.Hex);
	//		return sHash;
	//	}
	//}
	//else
	//{
	//	requirejs(['crypto'], function(CRYPTO)
	//	{
	//		UTIL.generateKey = function generateKey()
	//		{
	//			var oSha = CRYPTO.createHash('sha256');
	//			oSha.update(Math.random().toString());
	//			return oSha.digest('hex');
	//		};
	//		UTIL.hash = function hash(sPlainString)
	//		{
	//			var oSha = CRYPTO.createHash('sha256');
	//			oSha.update(sPlainString);
	//			return oSha.digest('hex');
	//		}
	//	});
	//}

	return UTIL;
} );
