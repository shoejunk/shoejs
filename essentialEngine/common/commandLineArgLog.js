define([
	'essentialEngine/component/component',
	'essentialEngine/common/utilities',
	'yargs',
	'pluralize']
, function(
	Component,
	UTIL,
	YARGS,
	pluralize)
{
	var sComponentName = 'CommandLineArgLog';

	// Private variables:
	const m_oDb = Symbol('m_oDb');
	const m_sDatabaseName = Symbol('m_sDatabaseName');
	const m_sUsername = Symbol('m_sUsername');
	const m_sPassword = Symbol('m_sPassword');

	class CommandLineArgLog extends Component
	{
		createdCallback()
		{
			this.preconstruct();
			const jArgv = YARGS
				.option('log',
				{
					alias: 'l',
					description: 'Pass space-separated string of tags to turn on logging',
					type: 'string'
				})
				.option('disableLogs',
				{
					description: 'Disable all logging'
				})
				.help()
				.alias('help', 'h')
				.argv;
			if('disableLogs' in jArgv)
			{
				UTIL.clearLogTags();
			}
			if('log' in jArgv)
			{
				const sLogTags = jArgv.log;
				const aLogs = sLogTags.split(' ') || [];
				UTIL.addLogTags(aLogs);
				UTIL.log(`added ${pluralize('log tags', aLogs.length, true)}`, sComponentName);
			}
		}
	}

	document.registerElement('eec-' + sComponentName, {prototype: CommandLineArgLog.prototype});
	return CommandLineArgLog;
});
