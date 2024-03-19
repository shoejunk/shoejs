'use strict';

define(['jquery',
	'essentialEngine/common/utilities',
	'essentialEngine/events/events',
	'essentialEngine/common/dependencyTreeNode',
	'essentialEngine/common/checklist'],
	function($, UTIL, EVENTS, DependencyTreeNode, Checklist)
{
	var GameObjectPrototype = Object.create(HTMLElement.prototype);
	GameObjectPrototype.createdCallback = function createdCallback()
	{
		// Private variables:
		var m_jComponents = {};
		var m_bInitDone = false;
		var m_aOnInits = [];

		// Private functions:
		// Public functions:
		this.preCreate = function(callback)
		{
			function onLoaded()
			{
				setTimeout(function()
				{
					callback();
				});
			}

			let oChecklist = new Checklist(onLoaded);
			oChecklist.addRequirement();

			setTimeout(() =>
			{
				for(let i = 0; i < this.children.length; ++i)
				{
					if(this.children[i].onLoad)
					{
						oChecklist.addRequirement();
					}
				}
		
				for(let i = 0; i < this.children.length; ++i)
				{
					if(this.children[i].onLoad)
					{
						this.children[i].onLoad(oChecklist.meetRequirement);
					}
				}

				for(let i = 0; i < this.children.length; ++i)
				{
					if(this.children[i].start)
					{
						this.children[i].start();
					}
				}

				oChecklist.meetRequirement();
			});
		};

		this.postCreate = function(callback)
		{
			callback();
			m_oInitDependency.unpause();
		};

		this.preInit = function(callback)
		{
			callback();
		};

		this.postInit = function(callback)
		{
			m_bInitDone = true;
			for(var i = 0; i < m_aOnInits.length; ++i)
			{
				m_aOnInits[i]();
			}
			callback();
		};

		this.getCreateDependency = function()
		{
			return m_oCreateDependency;
		};

		this.getInitDependency = function()
		{
			return m_oInitDependency;
		};

		var oParentCreateDependency = null;
		if(this.parentNode && this.parentNode.getCreateDependency)
		{
			oParentCreateDependency = this.parentNode.getCreateDependency();
		}

		var bHead = this.getAttribute('data-head') !== null;
		var m_oCreateDependency = new DependencyTreeNode(this, oParentCreateDependency, this.preCreate.bind(this), this.postCreate.bind(this), "getCreateDependency", bHead);
		var webComponentsSupported = "registerElement" in document;

		var oParentInitDependency = null;
		if(this.parentNode && this.parentNode.getInitDependency)
		{
			oParentInitDependency = this.parentNode.getInitDependency();
		}

		var m_oInitDependency = new DependencyTreeNode(this, oParentInitDependency, this.preInit.bind(this), this.postInit.bind(this), "getInitDependency", bHead, true);

		this.init = function init()
		{
			this.loaded = true;
			for(var i = 0; i < this.m_aOnLoads.length; ++i)
			{
				this.m_aOnLoads[i]();
			}
			this.m_aOnLoads = [];
			if(this.id)
			{
				EVENTS.fire([this.id + '_loaded']);
			}
		};

		this.addComponent = function addComponent(oComponent)
		{
			let testForComponentMethod = (sProperty) =>
			{
				var mProperty = oComponent[sProperty];
				if(typeof mProperty === 'function' && 'COMPONENT_METHOD' in mProperty)
				{
					if(!(sProperty in this))
					{
						this[sProperty] = function funcWrapper()
						{
							var aArgs = [funcWrapper['funcName']];
							var aFuncArgs = UTIL.concat(aArgs, arguments);
							return funcWrapper._func.apply(this, aFuncArgs);
						};

						this[sProperty]._func = function func(sFunc)
						{
							var mResult = null;
							if('components' in func)
							{
								var aComponents = func['components'];
								var aArgs = Array.prototype.slice.call(arguments, 1);
								var iResultPos = aArgs.length;
								aArgs.push(mResult);
								for(var i = 0; i < aComponents.length; ++i)
								{
									var oComponent = aComponents[i];
									mResult = oComponent[sFunc].apply(oComponent, aArgs);
									aArgs[iResultPos] = mResult;
								}
							}
							return mResult;
						};

						this[sProperty]['funcName'] = sProperty;
					}

					if(this[sProperty]._func)
					{
						var func = this[sProperty]._func;
						if('components' in func)
						{
							func['components'].push(oComponent);
						}
						else
						{
							func['components'] = [oComponent];
						}
					}
					return true;
				}
				return false;
			};

			m_jComponents[oComponent.getName()] = oComponent;
			let jSeen = {};
			for(var sProperty in oComponent)
			{
				if(testForComponentMethod(sProperty))
				{
					jSeen[sProperty] = true;
				}
			}

			var propNames = Object.getOwnPropertyNames(Object.getPrototypeOf(oComponent));
			for(var i = 0; i < propNames.length; ++i)
			{
				var sProperty = propNames[i];
				if(!(sProperty in jSeen))
				{
					testForComponentMethod(sProperty);
				}
			}
		};

		this.getComponent = function getComponent(sComponentName)
		{
			if(sComponentName in m_jComponents)
			{
				return m_jComponents[sComponentName];
			}
		};

		this.getComponents = function getComponents()
		{
			return m_jComponents;
		};

		this.onLoad = function onLoad(callback)
		{
			if(this.loaded)
			{
				callback();
			}
			else
			{
				this.m_aOnLoads.push(callback);
			}
		};

		this.onInit = function onInit(callback)
		{
			if(m_bInitDone)
			{
				callback();
			}
			else
			{
				m_aOnInits.push(callback);
			}
		};

		if(!('m_aOnLoads' in this))
		{
			this.m_aOnLoads = [];
		}
		this.init();
	};

	var GameObject = document.registerElement('ee-GameObject',
	{
		prototype	: GameObjectPrototype
	});

	return GameObject;
});
