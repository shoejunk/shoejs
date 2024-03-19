'use strict';

define(
[
	'jquery',
	'essentialEngine/common/utilities',
	'essentialEngine/component/component'
]
, function(
	$,
	UTIL,
	Component)
{
	const sComponentName = 'ClientStopwatch';

	// Private variables:
	const m_iTimeLeft = Symbol('m_iTimeLeft');
	const m_iTimestamp = Symbol('m_iTimestamp');
	const m_bRunning = Symbol('m_bRunning');
	const m_gSocket = Symbol('m_gSocket');
	const m_iId = Symbol('m_iId');
	const m_oSecondChangeTimeout = Symbol('m_oSecondChangeTimeout');
	const m_aTimes = Symbol('m_aTimes');
	const m_iTimeIndex = Symbol('m_iTimeIndex');

	class ClientStopwatch extends Component
	{
		createdCallback()
		{
			this[m_aTimes] = [];
			this[m_iTimeIndex] = 0;
			this.preconstruct();
		}

		preInit(callback)
		{
			this[m_gSocket].listen('stopwatch', this.receiveData.bind(this));
			callback();
		}

		getName() {return sComponentName;};

		display(iMilliseconds)
		{
			let iSeconds = Math.ceil(iMilliseconds / 1000);
			$(this).html(UTIL.formatSeconds(iSeconds));
			if(iSeconds <= 10)
			{
				$(this).removeClass('highTime');
				$(this).addClass('lowTime');
			}
			else
			{
				$(this).removeClass('lowTime');
				$(this).addClass('highTime');
			}
		}

		setTimes(aTimes)
		{
			for(let sTime of aTimes)
			{
				let iTime = UTIL.toInt(sTime);
				UTIL.assertInt(iTime, `One of the stopwatch times is a non-integer: ${sTime}`);
				this[m_aTimes].push(iTime);
			}
			this[m_iTimeLeft] = this[m_aTimes][this[m_iTimeIndex]];
			this[m_bRunning] = false;
			this.display(this[m_iTimeLeft]);
		}

		setSocket(gSocket)
		{
			this[m_gSocket] = gSocket;
		}

		setId(iId)
		{
			this[m_iId] = iId;
		}

		getTimeLeft()
		{
			if(this[m_bRunning])
			{
				let iDeltaTime = Date.now() - this[m_iTimestamp];
				let iTimeLeft = Math.max(this[m_iTimeLeft] - iDeltaTime, 0);
				if(iTimeLeft === 0 && this[m_iTimeIndex] < this[m_aTimes].length)
				{
					++this[m_iTimeIndex];
				}
				return iTimeLeft;
			}
			else
			{
				return this[m_iTimeLeft];
			}
		}

		receiveData(jData)
		{
			if(jData.id != this[m_iId])
			{
				return;
			}
			this[m_iTimestamp] = Date.now();
			this[m_iTimeLeft] = jData.timeLeft;
			this[m_bRunning] = jData.running;
			this[m_iTimeIndex] = jData.timeIndex;
			this.display(jData.timeLeft);
		}

		startTimer()
		{
			this[m_bRunning] = true;
			this[m_iTimestamp] = Date.now();
			if(this[m_iTimeLeft] > 0)
			{
				let iSecondChange = this[m_iTimeLeft] % 1000;
				if(iSecondChange === 0)
				{
					iSecondChange = 1000;
				}
				if(this[m_oSecondChangeTimeout])
				{
					clearTimeout(this[m_oSecondChangeTimeout]);
				}
				this[m_oSecondChangeTimeout] = setTimeout(this.tick.bind(this), iSecondChange); // add a little "safe buffer" to the time?
			}
			else if(this[m_oSecondChangeTimeout])
			{
				clearTimeout(this[m_oSecondChangeTimeout]);
			}
			this.updateDisplay();
		}

		updateDisplay()
		{
			this.display(this.getTimeLeft());
		}

		tick()
		{
			this.updateDisplay();
			if(this[m_bRunning])
			{
				let iSecondChange = this[m_iTimeLeft] % 1000;
				if(iSecondChange === 0)
				{
					iSecondChange = 1000;
				}
				this[m_oSecondChangeTimeout] = setTimeout(this.tick.bind(this), iSecondChange); // add a little "safe buffer" to the time?
			}
		}

		stopTimer()
		{
			this[m_iTimeLeft] = this.getTimeLeft();
			this[m_bRunning] = false;
			if(this[m_oSecondChangeTimeout])
			{
				clearInterval(this[m_oSecondChangeTimeout]);
				this[m_oSecondChangeTimeout] = null;
			}
			this.updateDisplay();
		}

		reset()
		{
			if(this[m_iTimeIndex] < this[m_aTimes].length)
			{
				this[m_iTimeLeft] = this[m_aTimes][this[m_iTimeIndex]];
			}
			else
			{
				this[m_iTimeLeft] = 0;
			}
			this.display(this[m_iTimeLeft]);
		}
	}

	UTIL.componentMethod(ClientStopwatch.prototype.setTimes);
	UTIL.componentMethod(ClientStopwatch.prototype.getTimeLeft);
	UTIL.componentMethod(ClientStopwatch.prototype.startTimer);
	UTIL.componentMethod(ClientStopwatch.prototype.stopTimer);
	UTIL.componentMethod(ClientStopwatch.prototype.reset);

	document.registerElement('eec-' + sComponentName, {prototype: ClientStopwatch.prototype});
	return ClientStopwatch;
});
