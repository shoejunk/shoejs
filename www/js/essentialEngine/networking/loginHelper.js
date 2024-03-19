define(
[
	'essentialEngine/common/utilities',
	'essentialEngine/component/component'
]
, function(
	UTIL, 
	Component)
{
	const sComponentName = 'LoginHelper';

	// Private variables:
	const m_gUsernameInput = Symbol('m_gUsernameInput');
	const m_gPasswordInput = Symbol('m_gPasswordInput');
	const m_gLoginButton = Symbol('m_gLoginButton');
	const m_gUserAccounts = Symbol('m_gUserAccounts');
	const m_gPopup = Symbol('m_gPopup');
	const m_bLoggedIn = Symbol('m_bLoggedIn');
	const m_gPlayer = Symbol('m_gPlayer');

	// Private functions:
	const onKeypress = Symbol('onKeypress');
	const login = Symbol('login');
	const resumeSession = Symbol('resumeSession');

	class LoginHelper extends Component
	{
		constructor()
		{
			this[m_bLoggedIn] = false;
		}

		preInit(callback)
		{
			$(this[m_gUsernameInput]).keypress(this[onKeypress].bind(this));
			$(this[m_gPasswordInput]).keypress(this[onKeypress].bind(this));
			$(this[m_gLoginButton]).click(this[login].bind(this));
			callback();
			this[resumeSession]();
		}

		setUsernameInput(gUserNameInput)
		{
			this[m_gUsernameInput] = gUserNameInput;
		}

		setPasswordInput(gPasswordInput)
		{
			this[m_gPasswordInput] = gPasswordInput;
		}

		setLoginButton(gLoginButton)
		{
			this[m_gLoginButton] = gLoginButton;
		}

		setUserAccounts(gUserAccounts)
		{
			this[m_gUserAccounts] = gUserAccounts;
		}

		setPopup(gPopup)
		{
			this[m_gPopup] = gPopup;
		}

		setPlayer(gPlayer)
		{
			this[m_gPlayer] = gPlayer;
		}

		onPopupDismissed()
		{
			$(this[m_gPopup]).addClass("hidden");
		}

		[onKeypress](oEvent)
		{
			if(oEvent.which == 13)
			{
				this[login]();
			}
		}

		async [login]()
		{
			UTIL.assert(this[m_gPopup]);
			let sUsernameAttempt = this[m_gUsernameInput].value;
			let [iResult, sResultText] = await this[m_gUserAccounts].login(sUsernameAttempt, this[m_gPasswordInput].value);
			if(iResult < 300)
			{
				this[m_bLoggedIn] = true;
				this[m_gPlayer].setPlayerName(sResultText);
				$('#mainMenuPlayerName').html(sResultText);
				$('#mainMenuLoggedInSection').removeClass('hidden');
				$('#mainMenuLoggedOutSection').addClass('hidden');
				$(this[m_gUsernameInput]).val('');
				$(this[m_gPasswordInput]).val('');
				this.parentNode.trigger();
				this.parentNode.resumeGame();
			}
			else
			{
				$(this[m_gPopup]).find('.popupText').text('Incorrect Username or Password');
				$(this[m_gPopup]).removeClass('hidden');
			}
		}

		async [resumeSession]()
		{
			UTIL.assert(this[m_gPopup]);
			let [iResult, sResultText] = await this[m_gUserAccounts].resumeSession();
			if(iResult == 200)
			{
				this[m_bLoggedIn] = true;
				this[m_gPlayer].setPlayerName(sResultText);
				$('#mainMenuPlayerName').html(sResultText);
				$('#mainMenuLoggedInSection').removeClass('hidden');
				$('#mainMenuLoggedOutSection').addClass('hidden');
				this.parentNode.resumeGame();
			}
		}

		getName() {return sComponentName;}
	}

	UTIL.componentMethod(LoginHelper.prototype.onPopupDismissed);
	document.registerElement('eec-' + sComponentName, {prototype: LoginHelper.prototype});
	return LoginHelper;
});
