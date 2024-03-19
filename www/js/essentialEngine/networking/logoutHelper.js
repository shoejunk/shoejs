define(
	[
		'essentialEngine/common/utilities',
		'essentialEngine/component/component'
	]
	, function(
		UTIL, 
		Component)
	{
		const sComponentName = 'LogoutHelper';
	
		// Private variables:
		const m_gLogoutButton = Symbol('m_gLogoutButton');
		const m_gUserAccounts = Symbol('m_gUserAccounts');
		const m_gPlayer = Symbol('m_gPlayer');
	
		// Private functions:
		const logout = Symbol('logout');
	
		class LogoutHelper extends Component
		{
			preInit(callback)
			{
				$(this[m_gLogoutButton]).click(this[logout].bind(this));
				callback();
			}
	
			setLogoutButton(gLogoutButton)
			{
				this[m_gLogoutButton] = gLogoutButton;
			}
	
			setUserAccounts(gUserAccounts)
			{
				this[m_gUserAccounts] = gUserAccounts;
			}
	
			setPlayer(gPlayer)
			{
				this[m_gPlayer] = gPlayer;
			}
	
			async [logout]()
			{
				let [iResult, sResultText] = await this[m_gUserAccounts].logout();
				if(iResult < 300)
				{
					this[m_gPlayer].setPlayerName(null);
					$('#mainMenuPlayerName').html('');
					$('#mainMenuLoggedInSection').addClass('hidden');
					$('#mainMenuLoggedOutSection').removeClass('hidden');
				}
				else
				{
					UTIL.log(`error logging out: ${sResultText}`, [sComponentName, 'Error'])
				}
			}
	
			getName() {return sComponentName;}
		}
	
		document.registerElement('eec-' + sComponentName, {prototype: LogoutHelper.prototype});
		return LogoutHelper;
	});
	