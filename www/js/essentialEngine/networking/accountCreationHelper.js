define(
[
	'essentialEngine/common/utilities',
	'essentialEngine/component/component'
]
, function(
	UTIL, 
	Component)
{
	const sComponentName = 'AccountCreationHelper';

    // Private variables:
	const m_gUsernameInput = Symbol('m_gUsernameInput');
	const m_gPasswordInput = Symbol('m_gPasswordInput');
	const m_gConfirmPasswordInput = Symbol('m_gConfirmPasswordInput');
	const m_gCreateAccountButton = Symbol('m_gCreateAccountButton');
	const m_gUserAccounts = Symbol('m_gUserAccounts');
	const m_gPopup = Symbol('m_gPopup');
	const m_bAccountCreated = Symbol('m_bAccountCreated');
	const m_gPlayer = Symbol('m_gPlayer');

	// Private functions:
	const onKeypress = Symbol('onKeypress');
	const createAccount = Symbol('createAccount');

	class AccountCreationHelper extends Component
	{
		constructor()
		{
			this[m_bAccountCreated] = false;
		}

		preInit(callback)
		{
			$(this[m_gUsernameInput]).keypress(this[onKeypress].bind(this));
			$(this[m_gPasswordInput]).keypress(this[onKeypress].bind(this));
			$(this[m_gConfirmPasswordInput]).keypress(this[onKeypress].bind(this));
			$(this[m_gCreateAccountButton]).click(this[createAccount].bind(this));
			callback();
		}

		setUsernameInput(gUserNameInput)
		{
			this[m_gUsernameInput] = gUserNameInput;
		}

		setPasswordInput(gPasswordInput)
		{
			this[m_gPasswordInput] = gPasswordInput;
		}

		setConfirmPasswordInput(gConfirmPasswordInput)
		{
			this[m_gConfirmPasswordInput] = gConfirmPasswordInput;
		}

		setCreateAccountButton(gCreateAccountButton)
		{
			this[m_gCreateAccountButton] = gCreateAccountButton;
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
			$(this[m_gPopup]).addClass('hidden');
			if(this[m_bAccountCreated])
			{
				$("#mainMenuLoggedInSection").removeClass('hidden');
				$("#mainMenuLoggedOutSection").addClass('hidden');
				this.parentNode.trigger();
			}
		}

		[onKeypress](oEvent)
		{
			if(oEvent.which == 13)
			{
				this[createAccount]();
			}
		}

		async [createAccount]()
		{
			UTIL.assert(this[m_gPopup]);
			let sUsernameAttempt = this[m_gUsernameInput].value;
			if(this[m_gPasswordInput].value != this[m_gConfirmPasswordInput].value)
			{
				$(this[m_gPopup]).find('.popupText').text('Passwords do not match');
				$(this[m_gPopup]).removeClass('hidden');
				return;
			}
			let [iResult, sResultText] = await this[m_gUserAccounts].createAccount(sUsernameAttempt, this[m_gPasswordInput].value);
			this[m_bAccountCreated] = false;
			if(iResult < 300)
			{
				this[m_bAccountCreated] = true;
				this[m_gPlayer].setPlayerName(sUsernameAttempt);
				$('#mainMenuPlayerName').html(sUsernameAttempt);
				$(this[m_gPopup]).find('.popupText').text('Account Created');
			}
			else if(sResultText == 'Username already exists')
			{
				$(this[m_gPopup]).find('.popupText').text('Username already taken. Try a different one.');
			}
			else if(sResultText == 'Missing username or password')
			{
				$(this[m_gPopup]).find('.popupText').text('Invalid username or password');
			}
			else if(sResultText == 'Unknown server error')
			{
				$(this[m_gPopup]).find('.popupText').text('Account Creation Failed');
			}
			else
			{
				$(this[m_gPopup]).find('.popupText').text(sResultText);
			}
			$(this[m_gPopup]).removeClass('hidden');
		}

		getName() {return sComponentName;}
	}

	UTIL.componentMethod(AccountCreationHelper.prototype.onPopupDismissed);
	document.registerElement('eec-' + sComponentName, {prototype: AccountCreationHelper.prototype});
	return AccountCreationHelper;
});
