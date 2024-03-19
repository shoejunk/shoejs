'use strict';

define([], function()
{
	// Protected variables:
	const bResolved = Symbol('bResolved');
	const aCallbacks = Symbol('aCallbacks');

	class Deferred
	{
		constructor()
		{
			this[aCallbacks] = [];
		}

		defer()
		{
			return new Promise((resolve) =>
			{
				if(this[bResolved])
				{
					resolve();
				}
				else
				{
					this[aCallbacks].push(resolve);
				}
			});
		}

		resolve()
		{
			this[bResolved] = true;
			for(let i = 0; i < this[aCallbacks].length; ++i)
			{
				this[aCallbacks][i]();
			}
			this[aCallbacks] = [];
		}
	}

	return Deferred;
});
