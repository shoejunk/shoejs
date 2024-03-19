'use strict'

define(['essentialEngine/common/numberPool']
, function(NumberPool)
{
	const aTimeline = [];
	const jLookup = {};
	const TIMELINE = {};
	const oNumberPool = new NumberPool();
	let oTimeout;

	function callback()
	{
		UTIL.assert(aTimeline.length > 0);
		const jNextEvent = aTimeline[0];
		UTIL.assert(aTimeline[0].iId in jLookup);
		delete jLookup[aTimeline[0].iId];
		aTimeline.splice(0, 1);
		oTimeout = null;
		updateTimer();
		jNextEvent.callback();
	}

	function updateTimer()
	{
		const iNow = Date.now();
		if(oTimeout)
		{
			clearTimeout(oTimeout);
		}
		if(aTimeline.length > 0)
		{
			oTimeout = setTimeout(callback, aTimeline[0].iTime - iNow);
		}
	}

	TIMELINE.register = function register(callback, iMs)
	{
		const iNow = Date.now();
		const iNewEventMs = iNow + iMs;
		let iEventIdx = 0;
		for(; iEventIdx < aTimeline.length; ++iEventIdx)
		{
			if(aTimeline[iEventIdx].iTime > iNewEventMs)
			{
				break;
			}
		}
		const iId = oNumberPool.get();
		aTimeline.splice(iEventIdx, 0, {callback: callback, iTime: iNewEventMs, iId: iId});
		jLookup[iId] = iEventIdx;
		if(iEventIdx == 0)
		{
			updateTimer();
		}
		return iId;
	}

	TIMELINE.cancel = function cancel(iId)
	{
		if(iId in jLookup)
		{
			const iEventIdx = jLookup[iId];
			aTimeline.splice(iEventIdx, 1);
			delete jLookup[iId];
			if(iEventIdx === 0)
			{
				updateTimer();
			}
		}
	}

	return TIMELINE;
});
