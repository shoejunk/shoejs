define(['essentialEngine/common/utilities'],
	function(UTIL)
{
	function NumberPool()
	{
		var m_aFreeNumbers = [0];

		this.get = function get()
		{
			var iNumber = m_aFreeNumbers.pop();
			if(m_aFreeNumbers.length === 0)
			{
				m_aFreeNumbers.push(iNumber + 1);
			}
			return iNumber;
		};

		this.release = function release(iNumber)
		{
			UTIL.assert(iNumber < m_aFreeNumbers[0]);
			// Keep the free numbers listed sorted in reverse order so that the smallest number
			// is always used first:
			UTIL.insertSorted(m_aFreeNumbers, iNumber, UTIL.reverseNumericalComparitor);

			// Remove unnecessary elements
			var iFirstValid = 0;
			for(;iFirstValid < m_aFreeNumbers.length - 1 && m_aFreeNumbers[iFirstValid] == m_aFreeNumbers[iFirstValid + 1] + 1; ++iFirstValid){}
			if(iFirstValid > 0)
			{
				m_aFreeNumbers.splice(0, iFirstValid);
			}
		}
	}

	return NumberPool;
});
