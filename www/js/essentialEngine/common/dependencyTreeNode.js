define(['jquery', 'essentialEngine/common/utilities', 'essentialEngine/common/checklist'], function($, UTIL, Checklist)
{
	var EState = {WAITING_FOR_PARENT: 0, PREPROCESSING: 1, WAITING_FOR_CHILDREN: 2, POSTPROCESSING: 3, DONE: 4};

	function DependencyTreeNode(oOwner, oParent, preprocess, postprocess, sGetFuncName, bHead, bPause)
	{
		var m_oThis = this;
		var m_eState = EState.WAITING_FOR_PARENT;
		var m_oChecklist;

		this.onParentDone = function()
		{
			UTIL.assert(m_eState == EState.WAITING_FOR_PARENT);
			m_eState = EState.PREPROCESSING;
			if(preprocess)
			{
				preprocess(m_oThis.preprocessDone.bind(m_oThis));
			}
			else
			{
				m_oThis.preprocessDone();
			}
		};

		this.preprocessDone = function()
		{
			$(document).ready(function()
			{
				UTIL.assert(m_eState == EState.PREPROCESSING);
				m_eState = EState.WAITING_FOR_CHILDREN;
				if(oOwner.children)
				{
					var iChildrenLoaded = 0;
					for(var i = 0; i < oOwner.children.length; ++i)
					{
						var child = oOwner.children[i];
						var getFuncName = child[sGetFuncName];
						if(getFuncName)
						{
							var oChildTreeDep = getFuncName();
							if(oChildTreeDep && !oChildTreeDep.isHead())
							{
								m_oChecklist.addRequirement();
								oChildTreeDep.onParentDone();
							}
						}
					}
				}
				m_oChecklist.meetRequirement(0);
			});
		};

		this.onChildDone = function()
		{
			m_oChecklist.meetRequirement();
		};

		this.onChildrenDone = function()
		{
			UTIL.assert(m_eState == EState.WAITING_FOR_CHILDREN);
			m_eState = EState.POSTPROCESSING;
			if(postprocess)
			{
				postprocess(m_oThis.postprocessDone.bind(m_oThis));
			}
			else
			{
				m_oThis.postprocessDone();
			}
		};

		this.postprocessDone = function()
		{
			UTIL.assert(m_eState == EState.POSTPROCESSING);
			m_eState = EState.DONE;
			if(oOwner.parentNode && oOwner.parentNode[sGetFuncName])
			{
				oOwner.parentNode[sGetFuncName]().onChildDone();
			}
		};

		this.unpause = function()
		{
			if(m_eState == EState.WAITING_FOR_PARENT && bHead)
			{
				this.onParentDone();
			}
		};

		this.isHead = function()
		{
			return bHead;
		};

		m_oChecklist = new Checklist(this.onChildrenDone, this);
		if(!bPause && bHead)
		{
			this.onParentDone();
		}
	}

	return DependencyTreeNode;
});
