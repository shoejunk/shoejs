define([
	'essentialEngine/component/component',
	'essentialEngine/common/utilities',
	'arangojs']
, function(
	Component,
	UTIL,
	ARANGOJS)
{
	var sComponentName = 'Database';

	// Private variables:
	const m_oDb = Symbol('m_oDb');
	const m_sDatabaseName = Symbol('m_sDatabaseName');
	const m_sUsername = Symbol('m_sUsername');
	const m_sPassword = Symbol('m_sPassword');

	class Database extends Component
	{
		createdCallback()
		{
			this[m_oDb] = ARANGOJS();
			this.preconstruct();
		}

		setDatabaseName(sDatabaseName)
		{
			this[m_sDatabaseName] = sDatabaseName;
		}

		setUsername(sUsername)
		{
			this[m_sUsername] = sUsername;
		}

		setPassword(sPassword)
		{
			this[m_sPassword] = sPassword;
		}

		preCreate(callback)
		{
			let sUsername = this[m_sUsername];
			let sPassword = this[m_sPassword];
			this[m_oDb].useBasicAuth(sUsername, sPassword);
			this[m_oDb].listDatabases().then(
				aNames =>
				{
					let bExists = false;
					for(let i = 0; i < aNames.length; ++i)
					{
						if(aNames[i] == this[m_sDatabaseName])
						{
							bExists = true;
							break;
						}
					}
					if(bExists)
					{
						UTIL.log('using existing database ' + this[m_sDatabaseName], sComponentName);
						this[m_oDb].useDatabase(this[m_sDatabaseName]);
						Component.prototype.preCreate.call(this, callback)
					}
					else
					{
						this[m_oDb].useBasicAuth(sUsername, sPassword);
						this[m_oDb].createDatabase(this[m_sDatabaseName]).then((res) =>
						{
							if(res.statusCode && res.statusCode >= 300)
							{
								UTIL.log('create database error ' + res.statusCode + ': ' + res.statusMessage, [sComponentName, 'Error']);
							}
							else if(res.code && res.code >= 300)
							{
								UTIL.log('create database error ' + res.code + ': ' + res.message, [sComponentName, 'Error']);
							}
							else
							{
								// database created
								UTIL.log('database ' + this[m_sDatabaseName] + ' created', [sComponentName, 'Error']);
								this[m_oDb].useDatabase(this[m_sDatabaseName]);
							}
							Component.prototype.preCreate.call(this, callback)
						});
					}
				},
				err => console.error(err.stack));
		}

		async addCollection(sCollectionName)
		{
			let oCollection = this[m_oDb].collection(sCollectionName);
			const bExists = await oCollection.exists();
			if(!bExists)
			{
				UTIL.log(`Creating the ${sCollectionName} collection.`, sComponentName);
				await oCollection.create();
			}
			return oCollection;
		}

		async addDocument(mCollection, sDocumentKey, jData)
		{
			if(typeof mCollection === 'string')
			{
				mCollection = this[m_oDb].collection(mCollection);
				const bRes = await mCollection.exists();
				if(!bRes)
				{
					return 'no collection';
				}
			}
			const bExists = await mCollection.documentExists(sDocumentKey);
			if(!bExists)
			{
				const info = await mCollection.save(jData);
				if(info._id == mCollection.name + '/' + jData._key)
				{
					return 'success';
				}
				return 'unknown error';
			}
			return 'document already exists';
		}

		async getDocument(mCollection, sDocumentKey)
		{
			if(typeof mCollection === 'string')
			{
				mCollection = this[m_oDb].collection(mCollection);
				if(!await mCollection.exists())
				{
					return null;
				}
			}
			return await mCollection.document(sDocumentKey, {graceful: true});
		}

		async doesDocumentExist(sCollectionName, sDocumentKey)
		{
			const oCollection = this[m_oDb].collection(sCollectionName);
			const bRes = await oCollection.exists();
			if(!bRes)
			{
				return false;
			}
			const bExists = await oCollection.documentExists(sDocumentKey);
			return bExists;
		}

		async getCollection(sCollectionName)
		{
			const oCollection = this[m_oDb].collection(sCollectionName);
			if(await oCollection.exists())
			{
				return oCollection;
			}
			return null;
		}

		async incrementValue(sCollectionName, sDocumentKey, sAttributeName)
		{
			const oCollection = this[m_oDb].collection(sCollectionName);
			const oTransaction = await this[m_oDb].beginTransaction(
			{
				write: [oCollection]
			});
			const oDocument = await oTransaction.run(() => oCollection.document(sDocumentKey))
			await oTransaction.run(() => oCollection.update(oDocument, { [sAttributeName]: oDocument[sAttributeName] + 1 }))
			await oTransaction.commit();
			return oDocument[sAttributeName] + 1;
		}

		async updateDocument(sCollectionName, sDocumentKey, jUpdate)
		{
			const oCollection = this[m_oDb].collection(sCollectionName);
			const oDocument = await oCollection.document(sDocumentKey);
			await oCollection.update(oDocument, jUpdate);
		}
	}

	UTIL.componentMethod(Database.prototype.addCollection);
	UTIL.componentMethod(Database.prototype.addDocument);
	UTIL.componentMethod(Database.prototype.getDocument);
	UTIL.componentMethod(Database.prototype.doesDocumentExist);
	UTIL.componentMethod(Database.prototype.getCollection);
	UTIL.componentMethod(Database.prototype.incrementValue);
	UTIL.componentMethod(Database.prototype.updateDocument);

	document.registerElement('eec-' + sComponentName, {prototype: Database.prototype});
	return Database;
});
