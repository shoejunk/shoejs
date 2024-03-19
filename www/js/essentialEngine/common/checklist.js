define(['essentialEngine/events/events', 'essentialEngine/common/utilities'],
	function(EVENTS, UTIL)
{
	function Checklist(callback, thisInCallback)
	{
		var m_bTriggered = false;
		var m_iRequirementsLeft = 0;

		this.addEventRequirement = function addEventRequirement(sEventName)
		{
			var that = this;
			this.addRequirement();
			new EVENTS.EventHandler([sEventName], function requirementMet()
			{
				that.meetRequirement();
			});
		};
		
		this.addRequirement = function addRequirement(iNumRequirements)
		{
			if(typeof iNumRequirements !== 'undefined')
			{
				m_iRequirementsLeft += iNumRequirements;
			}
			else
			{
				++m_iRequirementsLeft;
			}
			UTIL.log(`adding requirement: ${m_iRequirementsLeft} requirements remain`, 'Checklist');
		};

		this.meetRequirement = function meetRequirement(iNumRequirements)
		{
			if(typeof iNumRequirements !== 'undefined')
			{
				m_iRequirementsLeft -= iNumRequirements;
			}
			else
			{
				--m_iRequirementsLeft;
			}
			UTIL.log(`requirement met: ${m_iRequirementsLeft} requirements remain`, 'Checklist');
			if(!m_bTriggered && m_iRequirementsLeft <= 0)
			{
				UTIL.log('triggering checklist callback', 'Checklist');
				m_bTriggered = true;
				if(thisInCallback)
				{
					callback.call(thisInCallback);
				}
				else
				{
					callback();
				}
			}
		};

		this.getRemainingRequirements = function getRemainingRequirements()
		{
			return m_iRequirementsLeft;
		};
	}

	return Checklist;
});
