define([
	'essentialEngine/component/component',
	'essentialEngine/common/utilities']
, function(Component, UTIL)
{
	var sComponentName = 'UserDirectory';

	// Private variables:
	const m_gUserDirectoryDb = Symbol('m_gUserDirectoryDb');
	const m_oUserDbs = Symbol('m_oUserDbs');
	const m_aUserDbs = Symbol('m_aUserDbs');
	const m_sUsersCollection = Symbol('m_sUsersCollection');
	const m_sUserDbsCollection = Symbol('m_sUserDbsCollection');

	// Private functions:
	const onAddUserRequest = Symbol('onAddUserRequest');
	const onGetUserDbUrlRequest = Symbol('onGetUserDbUrlRequest');
	const onAddUserDbRequest = Symbol('onAddUserDbRequest');
	const addUser = Symbol('addUser');

	class UserDirectory extends Component
	{
		setUserDirectoryDb(gUserDirectoryDb)
		{
			this[m_gUserDirectoryDb] = gUserDirectoryDb;
		}

		setUsersCollection(sUsersCollection)
		{
			this[m_sUsersCollection] = sUsersCollection;
		}

		setUserDbsCollection(sUserDbsCollection)
		{
			this[m_sUserDbsCollection] = sUserDbsCollection;
		}

		preInit(callback)
		{
			function finishPreInit(oCollection)
			{
				this[m_oUserDbs] = oCollection;
				this.parentNode.addPostRoute("/addUser", this[onAddUserRequest].bind(this));
				this.parentNode.addPostRoute("/getUserDbUrl", this[onGetUserDbUrlRequest].bind(this));
				this.parentNode.addPostRoute("/addUserDb", this[onAddUserDbRequest].bind(this));

				// Keep a list of all user DBs in memory sorted by user count
				oCollection.all().then(oCursor =>
				{
					oCursor.all().then(aResults =>
					{
						aResults.sort((a, b) => { return a.userCount - b.userCount; });
						this[m_aUserDbs] = aResults;
						callback();
					});
				});
			}

			function onUsersCollection()
			{
				this[m_gUserDirectoryDb].getCollection(this[m_sUserDbsCollection]).then(oCollection =>
				{
					if(!oCollection)
					{
						this[m_gUserDirectoryDb].addCollection(this[m_sUserDbsCollection]).then(finishPreInit.bind(this, oCollection));
					}
					else
					{
						finishPreInit.call(this, oCollection);
					}
				});
			}

			this[m_gUserDirectoryDb].getCollection(this[m_sUsersCollection]).then(oCollection =>
			{
				if(!oCollection)
				{
					this[m_gUserDirectoryDb].addCollection(this[m_sUsersCollection]).then(onUsersCollection.bind(this));
				}
				else
				{
					onUsersCollection.call(this);
				}
			});
		}

		async [addUser](sUsername)
		{
			const jUserAccountDb = this[m_aUserDbs][0];
			const sKey = sUsername.toLowerCase();
			let jUser = {_key: sKey, username: unescape(sUsername), dbIndex: jUserAccountDb.dbIndex};
			const sRes = await this[m_gUserDirectoryDb].addDocument(this[m_sUsersCollection], sKey, jUser);
			if(sRes == 'success')
			{
				// Successfully added a user. Increment the user count for the DB that the user was added to.
				jUserAccountDb.userCount = await this[m_gUserDirectoryDb].incrementValue(this[m_sUserDbsCollection], jUserAccountDb.dbIndex.toString(), 'userCount')
				this[m_aUserDbs].sort((a, b) => { return a.userCount - b.userCount; });
				return {iStatus: 200, sRes: ''};
			}
			else if(sRes == 'document already exists')
			{
				return {iStatus: 400, sRes: 'User already in directory'};
			}
			else
			{
				return {iStatus: 500, sRes: 'Unknown server error'};
			}
		}

		async [onAddUserRequest](req, res)
		{
			if(!req.headers.username)
			{
				res.status(400);
				res.send('Missing username');
				return;
			}
			const {iStatus, sRes} = await this[addUser](req.headers.username);
			res.status(iStatus);
			res.send(sRes);
		}

		// Retrieves the DB url for the given user.
		async [onGetUserDbUrlRequest](req, res)
		{
			// Use the username to retrieve the user. It should already be escaped.
			if(!req.headers.username)
			{
				res.status(400);
				res.send('Missing username');
				return;
			}

			// The key of a user document is the escaped lowercased username.
			const sKey = req.headers.username.toLowerCase();
			let jUser = await this[m_gUserDirectoryDb].getDocument(this[m_sUsersCollection], sKey);
			if (!jUser)
			{
				await this[addUser](req.headers.username);
				jUser = await this[m_gUserDirectoryDb].getDocument(this[m_sUsersCollection], sKey);
			}

			// We need the dbIndex to look up the DB url in the DB collection.
			if (!('dbIndex' in jUser))
			{
				res.status(400);
				res.send('User missing dbIndex attribute');
			}
			const jUserDb = await this[m_gUserDirectoryDb].getDocument(this[m_sUserDbsCollection], jUser.dbIndex.toString());

			// Finally we get the url from the user's document in the DB collection.
			if (!('dbUrl' in jUserDb))
			{
				res.status(400);
				res.send('User DB entry missing dbUrl attribute');
			}
			res.send(jUserDb.dbUrl);
		}

		async [onAddUserDbRequest](req, res)
		{
			if(!req.headers.dburl)
			{
				res.status(400);
				res.send('Missing dburl');
				return;
			}
			const oCollection = await this[m_gUserDirectoryDb].getCollection(this[m_sUserDbsCollection]);
			const oCountResults = oCollection ? await oCollection.count() : {count: 0};
			const dbIndex = oCountResults.count;
			const jData =
			{
				_key      : UTIL.toString(dbIndex),
				dbIndex   : dbIndex,
				dbUrl     : req.headers.dburl,
				userCount : 0
			};
			this[m_gUserDirectoryDb].addDocument(this[m_sUserDbsCollection], jData._key, jData);
			res.send('');
		}
	}

	document.registerElement('eec-' + sComponentName, {prototype: UserDirectory.prototype});
	return UserDirectory;
});
