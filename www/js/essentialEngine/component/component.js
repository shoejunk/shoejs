'use strict';

define(['jquery', 'essentialEngine/common/utilities', 'essentialEngine/common/dependencyTreeNode'], function($, UTIL, DependencyTreeNode)
{
	var sComponentName = 'Component';

	var ComponentPrototype = Object.create(HTMLElement.prototype);

	ComponentPrototype.createdCallback = function createdCallback()
	{
		this.preconstruct();
	};

	function preCreate(callback)
	{
		this.parentNode.addComponent(this);
		setTimeout(function()
		{
			callback();
		});
	}

	function postCreate(callback)
	{
		callback();
	}

	function preInit(callback)
	{
		callback();
	};

	function postInit(callback)
	{
		callback();
	}

	function preconstruct()
	{
		var m_oThis = this;

		function setFromAttribute(sAttribute)
		{
			if(sAttribute.length >= 8 && sAttribute.substring(0, 5) == 'prop_')
			{
				let sPropType = sAttribute[5];
				let sRawVar = sAttribute.substring(7);
				let aVarParts = sRawVar.split('_');
				let sSetter = 'set';
				for (let sVarPart of aVarParts)
				{
					sSetter += sVarPart[0].toUpperCase() + sVarPart.substring(1);
				}

				// Call the setter on this component with the type-dependent value:
				let sAttr = m_oThis.getAttribute(sAttribute);
				switch(sPropType)
				{
					// Entity
					case 'e':
						let eEntity = $('#' + sAttr)[0];
						if(!eEntity)
						{
							if(m_oThis.parentNode)
							{
								eEntity = $(m_oThis.parentNode).find('.' + sAttr)[0];
								if(!eEntity && m_oThis.parentNode.parentNode)
								{
									eEntity = $(m_oThis.parentNode.parentNode).find('.' + sAttr)[0];
									if(!eEntity && m_oThis.parentNode.parentNode.parentNode)
									{
										eEntity = $(m_oThis.parentNode.parentNode.parentNode).find('.' + sAttr)[0];
									}
								}
							}
							if(!eEntity)
							{
								eEntity = $('.' + sAttr)[0];
							}
						}
						m_oThis[sSetter](eEntity);
						break;
					// int
					case 'i':
						m_oThis[sSetter](UTIL.toInt(sAttr));
						break;
					case 'j':
						m_oThis[sSetter](JSON.parse(sAttr));
						break;
					case 'a':
						m_oThis[sSetter](sAttr.split(","));
						break;
					// bool
					case 'b':
						m_oThis[sSetter](UTIL.isTrueString(sAttr))
						break;
					// string
					default:
						m_oThis[sSetter](sAttr);
				}
			}
			else if(sAttribute.length > 5)
			{
				let sVarName = sAttribute[5].toUpperCase() + sAttribute.substring(6);
				let iOpenIndex = sVarName.indexOf('[');
				let iCloseIndex = sVarName.indexOf(']');
				if(iOpenIndex !== -1 && iCloseIndex > iOpenIndex)
				{
					// array
					let iVarIndex = UTIL.toInt(sVarName.substring(iOpenIndex + 1, iCloseIndex));
					UTIL.assertInt(iVarIndex);
					sVarName = sVarName.substr(0, iOpenIndex);
					if(('a' + sVarName) in m_oThis)
					{
						if(m_oThis['a' + sVarName])
						{
							m_oThis['a' + sVarName][iVarIndex] = m_oThis.getAttribute(sAttribute);
						}
					}
				}
				else
				{
					var sFunctionName = 'set' + sVarName;
					if(sFunctionName in m_oThis)
					{
						m_oThis[sFunctionName](m_oThis.getAttribute(sAttribute));
					}
					else if(('i' + sVarName) in m_oThis)
					{
						m_oThis['i' + sVarName] = UTIL.toInt(m_oThis.getAttribute(sAttribute));
					}
					else if(('s' + sVarName) in m_oThis)
					{
						m_oThis['s' + sVarName] = m_oThis.getAttribute(sAttribute);
					}
					else if(('m' + sVarName) in m_oThis)
					{
						m_oThis['m' + sVarName] = m_oThis.getAttribute(sAttribute);
					}
				}
			}
		}

		this.getCreateDependency = function()
		{
			return m_oCreateDependency;
		};

		this.getInitDependency = function()
		{
			return m_oInitDependency;
		};

		var oParentInitDependency = null;
		if(this.parentNode && this.parentNode.getInitDependency)
		{
			oParentInitDependency = this.parentNode.getInitDependency();
		}

		var oParentCreateDependency = null;
		if(this.parentNode && this.parentNode.getCreateDependency)
		{
			oParentCreateDependency = this.parentNode.getCreateDependency();
		}

		var bHead = this.getAttribute('data-head') !== null;
		var m_oCreateDependency = new DependencyTreeNode(this, oParentCreateDependency, this.preCreate.bind(this), this.postCreate.bind(this), "getCreateDependency", bHead);
		var m_oInitDependency = new DependencyTreeNode(this, oParentInitDependency, this.preInit.bind(this), this.postInit.bind(this), "getInitDependency", bHead);

		// Find the element that you want to "watch"
		// create an observer instance
		if (window.MutationObserver)
		{
			var oObserver = new window.MutationObserver(function(aMutation)
			{
				/** this is the callback where you
					do what you need to do.
					The argument is an array of MutationRecords where the affected attribute is
					named "attributeName". There is a few other properties in a record
					but I'll let you work it out yourself.
				 **/
				for(var i = 0; i < aMutation.length; ++i)
				{
					let oMutation = aMutation[i];
					setFromAttribute(aMutation[i].attributeName);
				}
			}),
		
			// configuration of the observer:
			config = {
				attributes: true // this is to watch for attribute changes.
			};
			// pass in the element you wanna watch as well as the options
			oObserver.observe(this, config);
		}

		// Setup intial values of variables from data attributes:
		for(let i = 0; i < this.attributes.length; ++i)
		{
			setFromAttribute(this.attributes[i].name);
		}
	}

	function construct()
	{
	}

	function getStringProp(sProp)
	{
		return this.getAttribute('data-' + sProp);
	}

	function getStringArrayProp(sProp)
	{
		let index = 0;
		let aProps = [];
		for(let i = 0; this.getAttribute('data-' + sProp + '[' + i + ']'); ++i)
		{
			aProps.push(this.getAttribute('data-' + sProp + '[' + i + ']'));
		}
		return aProps;
	}

	function getIntProp(sProp)
	{
		return UTIL.toInt(this.getStringProp(sProp));
	}

	ComponentPrototype.preconstruct = preconstruct;
	ComponentPrototype.construct = construct;
	ComponentPrototype.preCreate = preCreate;
	ComponentPrototype.postCreate = postCreate;
	ComponentPrototype.preInit = preInit;
	ComponentPrototype.postInit = postInit;
	ComponentPrototype.getStringProp = getStringProp;
	ComponentPrototype.getStringArrayProp = getStringArrayProp;
	ComponentPrototype.getIntProp = getIntProp;
	ComponentPrototype.getName = function getName()
	{
		return sComponentName;
	}

	var Component = document.registerElement('eec-' + sComponentName,
	{
		prototype	: ComponentPrototype
	});

	return Component;
});
