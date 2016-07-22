var BlobScriptGenerator=BlobScriptGeneratorClosure();self["asyncProxyScriptBlob"]=new BlobScriptGenerator;
function BlobScriptGeneratorClosure(){function BlobScriptGenerator(){var that=this;that._blobChunks=["'use strict';"];that._blob=null;that._blobUrl=null;that._namespaces={};that.addMember(BlobScriptGeneratorClosure,"BlobScriptGenerator");that.addStatement("var asyncProxyScriptBlob = new BlobScriptGenerator();")}BlobScriptGenerator.prototype.addMember=function addMember(closureFunction,memberName,namespace,closureFunctionArgs){if(this._blob)throw new Error("Cannot add member to AsyncProxyScriptBlob after blob was used");
if(memberName){if(namespace){this._namespaces[namespace]=true;this._blobChunks.push(namespace);this._blobChunks.push(".")}else this._blobChunks.push("var ");this._blobChunks.push(memberName);this._blobChunks.push(" = ")}this._blobChunks.push("(");this._blobChunks.push(closureFunction.toString());this._blobChunks.push(")(");this._blobChunks.push(closureFunctionArgs||"");this._blobChunks.push(");")};BlobScriptGenerator.prototype.addStatement=function addStatement(statement){if(this._blob)throw new Error("Cannot add statement to AsyncProxyScriptBlob after blob was used");
this._blobChunks.push(statement)};BlobScriptGenerator.prototype.getBlob=function getBlob(){if(!this._blob)this._blob=new Blob(this._blobChunks,{type:"application/javascript"});return this._blob};BlobScriptGenerator.prototype.getBlobUrl=function getBlobUrl(){if(!this._blobUrl)this._blobUrl=URL.createObjectURL(this.getBlob());return this._blobUrl};return BlobScriptGenerator};function SubWorkerEmulationForChromeClosure(){var subWorkerId=0;var subWorkerIdToSubWorker=null;function SubWorkerEmulationForChrome(scriptUrl){if(subWorkerIdToSubWorker===null)throw"AsyncProxy internal error: SubWorkerEmulationForChrome "+"not initialized";var that=this;that._subWorkerId=++subWorkerId;subWorkerIdToSubWorker[that._subWorkerId]=that;self.postMessage({type:"subWorkerCtor",subWorkerId:that._subWorkerId,scriptUrl:scriptUrl})}SubWorkerEmulationForChrome.initialize=function initialize(subWorkerIdToSubWorker_){subWorkerIdToSubWorker=
subWorkerIdToSubWorker_};SubWorkerEmulationForChrome.prototype.postMessage=function postMessage(data,transferables){self.postMessage({type:"subWorkerPostMessage",subWorkerId:this._subWorkerId,data:data},transferables)};SubWorkerEmulationForChrome.prototype.terminate=function terminate(data,transferables){self.postMessage({type:"subWorkerTerminate",subWorkerId:this._subWorkerId},transferables)};self["asyncProxyScriptBlob"].addMember(SubWorkerEmulationForChromeClosure,"SubWorkerEmulationForChrome");
return SubWorkerEmulationForChrome}var SubWorkerEmulationForChrome=SubWorkerEmulationForChromeClosure();function AsyncProxyMasterClosure(){var asyncProxyScriptBlob=self["asyncProxyScriptBlob"];var callId=0;var isGetMasterEntryUrlCalled=false;var masterEntryUrl=getBaseUrlFromEntryScript();function AsyncProxyMaster(scriptsToImport,ctorName,ctorArgs,options){var that=this;options=options||{};var slaveScriptContentString=mainSlaveScriptContent.toString();slaveScriptContentString=slaveScriptContentString.replace("SCRIPT_PLACEHOLDER",asyncProxyScriptBlob.getBlobUrl());var slaveScriptContentBlob=new Blob(["(",
slaveScriptContentString,")()"],{type:"application/javascript"});var slaveScriptUrl=URL.createObjectURL(slaveScriptContentBlob);that._callbacks=[];that._pendingPromiseCalls=[];that._subWorkerById=[];that._subWorkers=[];that._worker=new Worker(slaveScriptUrl);that._worker.onmessage=onWorkerMessageInternal;that._userDataHandler=null;that._notReturnedFunctions=0;that._functionsBufferSize=options["functionsBufferSize"]||5;that._pendingMessages=[];that._worker.postMessage({functionToCall:"ctor",scriptsToImport:scriptsToImport,
ctorName:ctorName,args:ctorArgs,callId:++callId,isPromise:false,masterEntryUrl:AsyncProxyMaster.getEntryUrl()});function onWorkerMessageInternal(workerEvent){onWorkerMessage(that,workerEvent)}}AsyncProxyMaster.prototype.setUserDataHandler=function setUserDataHandler(userDataHandler){this._userDataHandler=userDataHandler};AsyncProxyMaster.prototype.terminate=function terminate(){this._worker.terminate();for(var i=0;i<this._subWorkers.length;++i)this._subWorkers[i].terminate()};AsyncProxyMaster.prototype.callFunction=
function callFunction(functionToCall,args,options){options=options||{};var isReturnPromise=!!options["isReturnPromise"];var transferables=options["transferables"];var pathsToTransferables=options["pathsToTransferablesInPromiseResult"];var localCallId=++callId;var promiseOnMasterSide=null;var that=this;if(isReturnPromise)promiseOnMasterSide=new Promise(function promiseFunc(resolve,reject){that._pendingPromiseCalls[localCallId]={resolve:resolve,reject:reject}});var sendMessageFunction=options["isSendImmediately"]?
sendMessageToSlave:enqueueMessageToSlave;sendMessageFunction(this,transferables,true,{functionToCall:functionToCall,args:args||[],callId:localCallId,isPromise:isReturnPromise,pathsToTransferablesInPromiseResult:pathsToTransferables});if(isReturnPromise)return promiseOnMasterSide};AsyncProxyMaster.prototype.wrapCallback=function wrapCallback(callback,callbackName,options){options=options||{};var localCallId=++callId;var callbackHandle={isWorkerHelperCallback:true,isMultipleTimeCallback:!!options["isMultipleTimeCallback"],
callId:localCallId,callbackName:callbackName,pathsToTransferables:options["pathsToTransferables"]};var internalCallbackHandle={isMultipleTimeCallback:!!options["isMultipleTimeCallback"],callId:localCallId,callback:callback,pathsToTransferables:options["pathsToTransferables"]};this._callbacks[localCallId]=internalCallbackHandle;return callbackHandle};AsyncProxyMaster.prototype.freeCallback=function freeCallback(callbackHandle){delete this._callbacks[callbackHandle.callId]};AsyncProxyMaster.getEntryUrl=
function getEntryUrl(){isGetMasterEntryUrlCalled=true;return masterEntryUrl};AsyncProxyMaster._setEntryUrl=function setEntryUrl(newUrl){if(masterEntryUrl!==newUrl&&isGetMasterEntryUrlCalled)throw"Previous values returned from getMasterEntryUrl "+"is wrong. Avoid calling it within the slave c`tor";masterEntryUrl=newUrl};function mainSlaveScriptContent(){importScripts("SCRIPT_PLACEHOLDER");AsyncProxy["AsyncProxySlave"]=self["AsyncProxy"]["AsyncProxySlaveSingleton"];AsyncProxy["AsyncProxySlave"]._initializeSlave()}
function onWorkerMessage(that,workerEvent){var callId=workerEvent.data.callId;switch(workerEvent.data.type){case "functionCalled":--that._notReturnedFunctions;trySendPendingMessages(that);break;case "promiseResult":var promiseData=that._pendingPromiseCalls[callId];delete that._pendingPromiseCalls[callId];var result=workerEvent.data.result;promiseData.resolve(result);break;case "promiseFailure":var promiseData=that._pendingPromiseCalls[callId];delete that._pendingPromiseCalls[callId];var reason=workerEvent.data.reason;
promiseData.reject(reason);break;case "userData":if(that._userDataHandler!==null)that._userDataHandler(workerEvent.data.userData);break;case "callback":var callbackHandle=that._callbacks[workerEvent.data.callId];if(callbackHandle===undefined)throw"Unexpected message from SlaveWorker of callback ID: "+workerEvent.data.callId+". Maybe should indicate "+"isMultipleTimesCallback = true on creation?";if(!callbackHandle.isMultipleTimeCallback)that.freeCallback(that._callbacks[workerEvent.data.callId]);
if(callbackHandle.callback!==null)callbackHandle.callback.apply(null,workerEvent.data.args);break;case "subWorkerCtor":var subWorker=new Worker(workerEvent.data.scriptUrl);var id=workerEvent.data.subWorkerId;that._subWorkerById[id]=subWorker;that._subWorkers.push(subWorker);subWorker.onmessage=function onSubWorkerMessage(subWorkerEvent){enqueueMessageToSlave(that,subWorkerEvent.ports,false,{functionToCall:"subWorkerOnMessage",subWorkerId:id,data:subWorkerEvent.data})};break;case "subWorkerPostMessage":var subWorker=
that._subWorkerById[workerEvent.data.subWorkerId];subWorker.postMessage(workerEvent.data.data);break;case "subWorkerTerminate":var subWorker=that._subWorkerById[workerEvent.data.subWorkerId];subWorker.terminate();break;default:throw"Unknown message from AsyncProxySlave of type: "+workerEvent.data.type;}}function enqueueMessageToSlave(that,transferables,isFunctionCall,message){if(that._notReturnedFunctions>=that._functionsBufferSize){that._pendingMessages.push({transferables:transferables,isFunctionCall:isFunctionCall,
message:message});return}sendMessageToSlave(that,transferables,isFunctionCall,message)}function sendMessageToSlave(that,transferables,isFunctionCall,message){if(isFunctionCall)++that._notReturnedFunctions;that._worker.postMessage(message,transferables)}function trySendPendingMessages(that){while(that._notReturnedFunctions<that._functionsBufferSize&&that._pendingMessages.length>0){var message=that._pendingMessages.shift();sendMessageToSlave(that,message.transferables,message.isFunctionCall,message.message)}}
function getBaseUrlFromEntryScript(){var baseUrl=location.href;var endOfPath=baseUrl.lastIndexOf("/");if(endOfPath>=0)baseUrl=baseUrl.substring(0,endOfPath);return baseUrl}asyncProxyScriptBlob.addMember(AsyncProxyMasterClosure,"AsyncProxyMaster");return AsyncProxyMaster}var AsyncProxyMaster=AsyncProxyMasterClosure();function AsyncProxySlaveClosure(){var slaveHelperSingleton={};var beforeOperationListener=null;var slaveSideMainInstance;var slaveSideInstanceCreator=defaultInstanceCreator;var subWorkerIdToSubWorker={};var ctorName;slaveHelperSingleton._initializeSlave=function initializeSlave(){self.onmessage=onMessage};slaveHelperSingleton.setSlaveSideCreator=function setSlaveSideCreator(creator){slaveSideInstanceCreator=creator};slaveHelperSingleton.setBeforeOperationListener=function setBeforeOperationListener(listener){beforeOperationListener=
listener};slaveHelperSingleton.sendUserDataToMaster=function sendUserDataToMaster(userData){self.postMessage({type:"userData",userData:userData})};slaveHelperSingleton.wrapPromiseFromSlaveSide=function wrapPromiseFromSlaveSide(callId,promise,pathsToTransferables){var promiseThen=promise.then(function sendPromiseToMaster(result){var transferables=extractTransferables(pathsToTransferables,result);self.postMessage({type:"promiseResult",callId:callId,result:result},transferables)});promiseThen["catch"](function sendFailureToMaster(reason){self.postMessage({type:"promiseFailure",
callId:callId,reason:reason})})};slaveHelperSingleton.wrapCallbackFromSlaveSide=function wrapCallbackFromSlaveSide(callbackHandle){var isAlreadyCalled=false;function callbackWrapperFromSlaveSide(){if(isAlreadyCalled)throw"Callback is called twice but isMultipleTimeCallback "+"= false";var argumentsAsArray=getArgumentsAsArray(arguments);if(beforeOperationListener!==null)try{beforeOperationListener.call(slaveSideMainInstance,"callback",callbackHandle.callbackName,argumentsAsArray)}catch(e){console.log("AsyncProxySlave.beforeOperationListener has thrown an exception: "+
e)}var transferables=extractTransferables(callbackHandle.pathsToTransferables,argumentsAsArray);self.postMessage({type:"callback",callId:callbackHandle.callId,args:argumentsAsArray},transferables);if(!callbackHandle.isMultipleTimeCallback)isAlreadyCalled=true}return callbackWrapperFromSlaveSide};slaveHelperSingleton._getScriptName=function _getScriptName(){var error=new Error;var scriptName=ScriptsToImportPool._getScriptName(error);return scriptName};function extractTransferables(pathsToTransferables,
pathsBase){if(pathsToTransferables===undefined)return undefined;var transferables=new Array(pathsToTransferables.length);for(var i=0;i<pathsToTransferables.length;++i){var path=pathsToTransferables[i];var transferable=pathsBase;for(var j=0;j<path.length;++j){var member=path[j];transferable=transferable[member]}transferables[i]=transferable}return transferables}function onMessage(event){var functionNameToCall=event.data.functionToCall;var args=event.data.args;var callId=event.data.callId;var isPromise=
event.data.isPromise;var pathsToTransferablesInPromiseResult=event.data.pathsToTransferablesInPromiseResult;var result=null;switch(functionNameToCall){case "ctor":self["AsyncProxy"]["AsyncProxyMaster"]._setEntryUrl(event.data.masterEntryUrl);var scriptsToImport=event.data.scriptsToImport;ctorName=event.data.ctorName;for(var i=0;i<scriptsToImport.length;++i)importScripts(scriptsToImport[i]);slaveSideMainInstance=slaveSideInstanceCreator.apply(null,args);return;case "subWorkerOnMessage":var subWorker=
subWorkerIdToSubWorker[event.data.subWorkerId];var workerEvent={data:event.data.data};subWorker.onmessage(workerEvent);return}args=new Array(event.data.args.length);for(var i=0;i<event.data.args.length;++i){var arg=event.data.args[i];if(arg!==undefined&&arg!==null&&arg.isWorkerHelperCallback)arg=slaveHelperSingleton.wrapCallbackFromSlaveSide(arg);args[i]=arg}var functionContainer=slaveSideMainInstance;var functionToCall;while(functionContainer){functionToCall=slaveSideMainInstance[functionNameToCall];
if(functionToCall)break;functionContainer=functionContainer.__proto__}if(!functionToCall)throw"AsyncProxy error: could not find function "+functionToCall;var promise=functionToCall.apply(slaveSideMainInstance,args);if(isPromise)slaveHelperSingleton.wrapPromiseFromSlaveSide(callId,promise,pathsToTransferablesInPromiseResult);self.postMessage({type:"functionCalled",callId:event.data.callId,result:result})}function defaultInstanceCreator(){var instance;try{var namespacesAndCtorName=ctorName.split(".");
var member=self;for(var i=0;i<namespacesAndCtorName.length;++i)member=member[namespacesAndCtorName[i]];var TypeCtor=member;var bindArgs=[null].concat(getArgumentsAsArray(arguments));instance=new (Function.prototype.bind.apply(TypeCtor,bindArgs))}catch(e){throw new Error("Failed locating class name "+ctorName+": "+e);}return instance}function getArgumentsAsArray(args){var argumentsAsArray=new Array(args.length);for(var i=0;i<args.length;++i)argumentsAsArray[i]=args[i];return argumentsAsArray}if(self["Worker"]===
undefined){var SubWorkerEmulationForChrome=self["SubWorkerEmulationForChrome"];SubWorkerEmulationForChrome.initialize(subWorkerIdToSubWorker);self["Worker"]=SubWorkerEmulationForChrome}self["asyncProxyScriptBlob"].addMember(AsyncProxySlaveClosure,"AsyncProxySlaveSingleton");return slaveHelperSingleton}var AsyncProxySlaveSingleton=AsyncProxySlaveClosure();function ScriptsToImportPoolClosure(){function ScriptsToImportPool(){var that=this;that._scriptsByName={};that._scriptsArray=null}ScriptsToImportPool.prototype.addScriptFromErrorWithStackTrace=function addScriptForWorkerImport(errorWithStackTrace){var fileName=ScriptsToImportPool._getScriptName(errorWithStackTrace);if(!this._scriptsByName[fileName]){this._scriptsByName[fileName]=true;this._scriptsArray=null}};ScriptsToImportPool.prototype.getScriptsForWorkerImport=function getScriptsForWorkerImport(){if(this._scriptsArray===
null){this._scriptsArray=[];for(var fileName in this._scriptsByName)this._scriptsArray.push(fileName)}return this._scriptsArray};ScriptsToImportPool._getScriptName=function getScriptName(errorWithStackTrace){var stack=errorWithStackTrace.stack.trim();var currentStackFrameRegex=/at (|[^ ]+ \()([^ ]+):\d+:\d+/;var source=currentStackFrameRegex.exec(stack);if(source&&source[2]!=="")return source[2];var lastStackFrameRegex=new RegExp(/.+\/(.*?):\d+(:\d+)*$/);source=lastStackFrameRegex.exec(stack);if(source&&
source[1]!=="")return source[1];if(errorWithStackTrace.fileName!=undefined)return errorWithStackTrace.fileName;throw"ImageDecoderFramework.js: Could not get current script URL";};self["asyncProxyScriptBlob"].addMember(ScriptsToImportPoolClosure,"ScriptsToImportPool");return ScriptsToImportPool}var ScriptsToImportPool=ScriptsToImportPoolClosure();var LinkedList=function LinkedListClosure(){function LinkedList(){this.clear()}LinkedList.prototype.clear=function clear(){this._first={_prev:null,_parent:this};this._last={_next:null,_parent:this};this._count=0;this._last._prev=this._first;this._first._next=this._last};LinkedList.prototype.add=function add(value,addBefore){if(addBefore===null||addBefore===undefined)addBefore=this._last;this._validateIteratorOfThis(addBefore);++this._count;var newNode={_value:value,_next:addBefore,_prev:addBefore._prev,
_parent:this};newNode._prev._next=newNode;addBefore._prev=newNode;return newNode};LinkedList.prototype.remove=function remove(iterator){this._validateIteratorOfThis(iterator);--this._count;iterator._prev._next=iterator._next;iterator._next._prev=iterator._prev;iterator._parent=null};LinkedList.prototype.getFromIterator=function getFromIterator(iterator){this._validateIteratorOfThis(iterator);return iterator._value};LinkedList.prototype.getFirstIterator=function getFirstIterator(){var iterator=this.getNextIterator(this._first);
return iterator};LinkedList.prototype.getLastIterator=function getFirstIterator(){var iterator=this.getPrevIterator(this._last);return iterator};LinkedList.prototype.getNextIterator=function getNextIterator(iterator){this._validateIteratorOfThis(iterator);if(iterator._next===this._last)return null;return iterator._next};LinkedList.prototype.getPrevIterator=function getPrevIterator(iterator){this._validateIteratorOfThis(iterator);if(iterator._prev===this._first)return null;return iterator._prev};LinkedList.prototype.getCount=
function getCount(){return this._count};LinkedList.prototype._validateIteratorOfThis=function validateIteratorOfThis(iterator){if(iterator._parent!==this)throw"iterator must be of the current LinkedList";};return LinkedList}();var HashMap=function HashMapClosure(){function HashMap(hasher){var that=this;that._listByKey=[];that._listOfLists=new LinkedList;that._hasher=hasher;that._count=0}HashMap.prototype.getFromKey=function getFromKey(key){var hashCode=this._hasher["getHashCode"](key);var hashElements=this._listByKey[hashCode];if(!hashElements)return null;var list=hashElements.list;var iterator=list.getFirstIterator();while(iterator!==null){var item=list.getFromIterator(iterator);if(this._hasher["isEqual"](item.key,key))return item.value;
iterator=list.getNextIterator(iterator)}return null};HashMap.prototype.getFromIterator=function getFromIterator(iterator){return iterator._hashElements.list.getFromIterator(iterator._internalIterator).value};HashMap.prototype.tryAdd=function tryAdd(key,createValue){var hashCode=this._hasher["getHashCode"](key);var hashElements=this._listByKey[hashCode];if(!hashElements){hashElements={hashCode:hashCode,list:new LinkedList,listOfListsIterator:null};hashElements.listOfListsIterator=this._listOfLists.add(hashElements);
this._listByKey[hashCode]=hashElements}var iterator={_hashElements:hashElements,_internalIterator:null};iterator._internalIterator=hashElements.list.getFirstIterator();while(iterator._internalIterator!==null){var item=hashElements.list.getFromIterator(iterator._internalIterator);if(this._hasher["isEqual"](item.key,key))return{iterator:iterator,isNew:false,value:item.value};iterator._internalIterator=hashElements.list.getNextIterator(iterator._internalIterator)}var value=createValue();iterator._internalIterator=
hashElements.list.add({key:key,value:value});++this._count;return{iterator:iterator,isNew:true,value:value}};HashMap.prototype.remove=function remove(iterator){var oldListCount=iterator._hashElements.list.getCount();iterator._hashElements.list.remove(iterator._internalIterator);var newListCount=iterator._hashElements.list.getCount();this._count+=newListCount-oldListCount;if(newListCount===0){this._listOfLists.remove(iterator._hashElements.listOfListsIterator);delete this._listByKey[iterator._hashElements.hashCode]}};
HashMap.prototype.getCount=function getCount(){return this._count};HashMap.prototype.getFirstIterator=function getFirstIterator(){var firstListIterator=this._listOfLists.getFirstIterator();var firstHashElements=null;var firstInternalIterator=null;if(firstListIterator!==null){firstHashElements=this._listOfLists.getFromIterator(firstListIterator);firstInternalIterator=firstHashElements.list.getFirstIterator()}if(firstInternalIterator===null)return null;return{_hashElements:firstHashElements,_internalIterator:firstInternalIterator}};
HashMap.prototype.getNextIterator=function getNextIterator(iterator){var nextIterator={_hashElements:iterator._hashElements,_internalIterator:iterator._hashElements.list.getNextIterator(iterator._internalIterator)};while(nextIterator._internalIterator===null){var nextListOfListsIterator=this._listOfLists.getNextIterator(iterator._hashElements.listOfListsIterator);if(nextListOfListsIterator===null)return null;nextIterator._hashElements=this._listOfLists.getFromIterator(nextListOfListsIterator);nextIterator._internalIterator=
nextIterator._hashElements.list.getFirstIterator()}return nextIterator};return HashMap}();function DependencyWorkersClosure(){var asyncProxyScriptBlob=self["asyncProxyScriptBlob"];function DependencyWorkers(scriptsToImport,ctorName,ctorArgs,workerInputRetreiver){var that=this;that._workerInputRetreiver=workerInputRetreiver;that._ctorName=ctorName;that._ctorArgs=ctorArgs;that._scriptsToImport=scriptsToImport;that._internalContexts=new HashMap(workerInputRetreiver);that._workerPool=[];if(!workerInputRetreiver["createTaskContext"])throw"AsyncProxy.DependencyWorkers: No "+"workerInputRetreiver.createTaskContext() method";
if(!workerInputRetreiver["getHashCode"])throw"AsyncProxy.DependencyWorkers: No "+"workerInputRetreiver.getHashCode() method";if(!workerInputRetreiver["isEqual"])throw"AsyncProxy.DependencyWorkers: No "+"workerInputRetreiver.isEqual() method";}DependencyWorkers.prototype.startTask=function startTask(taskKey,callbacks){var dependencyWorkers=this;var addResult=this._internalContexts.tryAdd(taskKey,function(){return new DependencyWorkersInternalContext});var internalContext=addResult.value;var taskHandle=
new DependencyWorkersTaskHandle(internalContext,callbacks);if(addResult.isNew){internalContext.initialize(taskKey,this,this._internalContexts,addResult.iterator,this._workerInputRetreiver);this._startNewTask(internalContext)}return taskHandle};DependencyWorkers.prototype.getTaskContext=function getTaskContext(taskKey){var context=this._internalContexts.getFromKey(taskKey);if(context===null)return null;return context.taskContext};DependencyWorkers.prototype._startNewTask=function startNewTask(internalContext){taskContext=
this._workerInputRetreiver["createTaskContext"](internalContext.taskKey,{"onDataReadyToProcess":onDataReadyToProcess,"onTerminated":internalContext.onTerminatedBound,"registerTaskDependency":internalContext.registerTaskDependencyBound});internalContext.taskContext=taskContext;if(!taskContext["statusUpdated"])throw"AsyncProxy.DependencyWorkers: missing "+"taskContext.statusUpdated()";if(!taskContext["onDependencyTaskResult"])throw"AsyncProxy.DependencyWorkers: missing "+"taskContext.onDependencyTaskResult()";
var that=this;function onDataReadyToProcess(newDataToProcess,isDisableWorker){if(internalContext.isTerminated)throw"AsyncProxy.DependencyWorkers: already terminated";else if(internalContext.isActiveWorker){internalContext.pendingDataForWorker=newDataToProcess;internalContext.isPendingDataForWorker=true;internalContext.pendingDataIsDisableWorker=isDisableWorker}else that._startWorker(internalContext,newDataToProcess,isDisableWorker)}};DependencyWorkers.prototype._startWorker=function startWorker(internalContext,
dataToProcess,isDisableWorker){var that=this;if(isDisableWorker){internalContext.newData(dataToProcess);return}var worker;if(that._workerPool.length>0)worker=that._workerPool.pop();else worker=new AsyncProxyMaster(that._scriptsToImport,that._ctorName,that._ctorArgs);internalContext.isActiveWorker=true;internalContext.statusUpdate();worker.callFunction("start",[dataToProcess,internalContext.taskKey],{"isReturnPromise":true}).then(function(processedData){internalContext.newData(processedData);return processedData})["catch"](function(e){console.log("Error in DependencyWorkers' worker: "+
e);return e}).then(function(result){that._workerPool.push(worker);internalContext.isActiveWorker=false;internalContext.statusUpdate();if(!internalContext.isPendingDataForWorker)return;var dataToProcess=internalContext.pendingDataForWorker;internalContext.isPendingDataForWorker=false;internalContext.pendingDataForWorker=null;that._startWorker(internalContext,dataToProcess,internalContext.pendingDataIsDisableWorker);return result})};asyncProxyScriptBlob.addMember(DependencyWorkersClosure,"DependencyWorkers");
return DependencyWorkers}var DependencyWorkers=DependencyWorkersClosure();var DependencyWorkersTaskHandle=function DependencyWorkersTaskHandleClosure(){function DependencyWorkersTaskHandle(internalContext,callbacks){this._internalContext=internalContext;this._localPriority=0;this._callbacks=callbacks;this._taskHandlesIterator=internalContext.taskHandles.add(this)}DependencyWorkersTaskHandle.prototype.hasData=function hasData(){return this._internalContext.hasProcessedData};DependencyWorkersTaskHandle.prototype.getLastData=function getLastData(){return this._internalContext.lastProcessedData};
DependencyWorkersTaskHandle.prototype.setPriority=function(priority){if(!this._taskHandlesIterator)throw"AsyncProxy.DependencyWorkers: Already unregistered";var newPriority;if(priority>this._internalContext.priority)newPriority=priority;else if(this._localPriority<this._internalContext.priority)newPriority=this._internalContext.priority;else newPriority=this._internalContext.recalculatePriority();this._internalContext.setPriorityAndNotify(newPriority)};DependencyWorkersTaskHandle.prototype.unregister=
function(){if(!this._taskHandlesIterator)throw"AsyncProxy.DependencyWorkers: Already unregistered";this._internalContext.taskHandles.remove(this._taskHandlesIterator);this._taskHandlesIterator=null;if(this._internalContext.taskHandles.getCount()==0){if(!this._internalContext.isTerminated){this._internalContext.ended();this._internalContext.statusUpdate()}}else if(this._localPriority===this._internalContext.priority){var newPriority=this._internalContext.recalculatePriority();this._internalContext.setPriorityAndNotify(newPriority)}};
asyncProxyScriptBlob.addMember(DependencyWorkersTaskHandleClosure,"DependencyWorkersTaskHandle");return DependencyWorkersTaskHandle}();var DependencyWorkersInternalContext=function DependencyWorkersInternalContextClosure(){function DependencyWorkersInternalContext(){this.isTerminated=false;this.priority=0;this.lastProcessedData=null;this.hasProcessedData=false;this.isActiveWorker=false;this.isPendingDataForWorker=false;this.pendingDataForWorker=null;this.pendingDataIsDisableWorker=false;this.taskContext=null;this.taskHandles=new LinkedList;this.onTerminatedBound=this._onTerminated.bind(this);this.registerTaskDependencyBound=this._registerTaskDependency.bind(this);
this.taskKey=null;this._dependsTasksTerminatedCount=0;this._parentDependencyWorkers=null;this._parentList=null;this._parentIterator=null;this._dependsTaskHandles=null}DependencyWorkersInternalContext.prototype.initialize=function(taskKey,dependencyWorkers,list,iterator,hasher){this.taskKey=taskKey;this._parentDependencyWorkers=dependencyWorkers;this._parentList=list;this._parentIterator=iterator;this._dependsTaskHandles=new HashMap(hasher)};DependencyWorkersInternalContext.prototype.ended=function(){var iterator=
this._dependsTaskHandles.getFirstIterator();while(iterator!=null){var handle=this._dependsTaskHandles.getFromIterator(iterator).taskHandle;iterator=this._dependsTaskHandles.getNextIterator(iterator);handle.unregister()}iterator=this.taskHandles.getFirstIterator();while(iterator!=null){var handle=this.taskHandles.getFromIterator(iterator);iterator=this.taskHandles.getNextIterator(iterator);if(handle._callbacks["onTerminated"])handle._callbacks["onTerminated"]()}this.taskHandles.clear();this._dependsTaskHandles=
[];this._parentList.remove(this._parentIterator);this._parentIterator=null};DependencyWorkersInternalContext.prototype.setPriorityAndNotify=function(newPriority){if(this.priority===newPriority)return;this.priority=newPriority;this.statusUpdate();var iterator=this._dependsTaskHandles.getFirstIterator();while(iterator!=null){var handle=this._dependsTaskHandles.getFromIterator(iterator).taskHandle;iterator=this._dependsTaskHandles.getNextIterator(iterator);handle.setPriority(newPriority)}};DependencyWorkersInternalContext.prototype.statusUpdate=
function(){var status={"priority":this.priority,"hasListeners":this.taskHandles.getCount()>0,"isIdle":!this.isActiveWorker,"terminatedDependsTasks":this._dependsTasksTerminatedCount,"dependsTasks":this._dependsTaskHandles.getCount()};this.taskContext["statusUpdated"](status)};DependencyWorkersInternalContext.prototype.recalculatePriority=function(){var handles=this.taskHandles;var iterator=handles.getFirstIterator();var isFirst=true;var newPriority=0;while(iterator!=null){var handle=handles.getFromIterator(iterator);
if(isFirst||handle._localPriority>newPriority)newPriority=handle._localPriority;iterator=handles.getNextIterator(iterator)}return newPriority};DependencyWorkersInternalContext.prototype.newData=function(data){this.hasProcessedData=true;this.lastProcessedData=data;var handles=this.taskHandles;var iterator=handles.getFirstIterator();while(iterator!=null){var handle=handles.getFromIterator(iterator);iterator=handles.getNextIterator(iterator);handle._callbacks["onData"](data,this.taskKey)}};DependencyWorkersInternalContext.prototype._onTerminated=
function(){if(this.isTerminated)throw"AsyncProxy.DependencyWorkers: already terminated";else if(this.isActiveWorker)throw"AsyncProxy.DependencyWorkers: Cannot terminate while "+"task is processing. Wait for statusUpdated() callback "+"with isIdle == true";this.isTerminated=true;this.ended()};DependencyWorkersInternalContext.prototype._dependsTaskTerminated=function(){++this._dependsTasksTerminatedCount;this.statusUpdate()};DependencyWorkersInternalContext.prototype._registerTaskDependency=function(taskKey){var addResult=
this._dependsTaskHandles.tryAdd(taskKey,function(){return{taskHandle:null}});if(!addResult.isNew)throw"AsyncProxy.DependencyWorkers: Cannot add task dependency twice";var that=this;var gotData=false;var isTerminated=false;addResult.value.taskHandle=this._parentDependencyWorkers.startTask(taskKey,{"onData":onDependencyTaskResult,"onTerminated":onDependencyTaskTerminated});setTimeout(function(){if(!gotData&&addResult.value.taskHandle.hasData())onDependencyTaskResult(addResult.taskHandle.getLastData())});
function onDependencyTaskResult(data){that.taskContext["onDependencyTaskResult"](data,taskKey);gotData=true}function onDependencyTaskTerminated(){if(isTerminated)throw"AsyncProxy.DependencyWorkers: Double termination";isTerminated=true;that._dependsTaskTerminated()}};return DependencyWorkersInternalContext}();function PromiseTaskClosure(){var asyncProxyScriptBlob=self["asyncProxyScriptBlob"];var WAITING_FOR_DEPENDS_TASKS=1;var WAITING_FOR_PROMISE=2;var WAITING_FOR_WORKER=3;var TERMINATED=4;function PromiseTask(taskKey,dependsOnTasks,workerInputRetreiver,callbacks){var that=this;that._taskKey=taskKey;that._dependsOnTasks=dependsOnTasks;that._workerInputRetreiver=workerInputRetreiver;that._callbacks=callbacks;that._resultIndexByTaskKey=null;that._results=[];that._hasResultByIndex=[];that._hasResultCount=
0;that._waitingFor=WAITING_FOR_DEPENDS_TASKS;that._checkIfDependsTaskDone();for(var i=0;i<dependsOnTasks.length;++i)callbacks["registerTaskDependency"](dependsOnTasks[i])}Object.defineProperty(PromiseTask.prototype,"dependsOnTasks",{get:function(){var that=this;return that._dependsOnTasks}});PromiseTask.prototype.onDependencyTaskResult=function(result,key){if(this._waitingFor!==WAITING_FOR_DEPENDS_TASKS)throw"AsyncProxy.PromiseTask: Internal Error: not waiting for "+"tasks depends on";if(this._resultIndexByTaskKey===
null){this._resultIndexByTaskKey=new HashMap(this._workerInputRetreiver);for(var i=0;i<this._dependsOnTasks.length;++i)this._resultIndexByTaskKey.tryAdd(this._dependsOnTasks[i],function(){return i})}var index=this._resultIndexByTaskKey.getFromKey(key);if(index===null)throw"AsyncProxy.PromiseTask: Task is not depends on key";this._results[index]=result;if(!this._hasResultByIndex[index]){this._hasResultByIndex[index]=true;++this._hasResultCount}};PromiseTask.prototype.statusUpdated=function(status){if(!status["hasListeners"]&&
status["isIdle"])this._terminate("No listeners");else if(this._waitingFor===WAITING_FOR_DEPENDS_TASKS)this._checkIfDependsTaskDone(status);else if(status["isIdle"]&&this._waitingFor===WAITING_FOR_WORKER)this._terminate()};PromiseTask.prototype._checkIfDependsTaskDone=function(status){var terminatedDependsTasks=0;if(status)terminatedDependsTasks=status["terminatedDependsTasks"];if(terminatedDependsTasks!==this._dependsOnTasks.length)return;var that=this;this._waitingFor=WAITING_FOR_PROMISE;this._workerInputRetreiver["preWorkerProcess"](this._results,
this._dependsOnTasks,this._taskKey).then(function(result){if(that._waitingFor!==TERMINATED){that._waitingFor=WAITING_FOR_WORKER;that._callbacks["onDataReadyToProcess"](result)}})["catch"](function(reason){that._terminate(reason)})};PromiseTask.prototype._terminate=function(reason){if(this._waitingFor!==TERMINATED){this._waitingFor=TERMINATED;this._callbacks["onTerminated"](reason)}};asyncProxyScriptBlob.addMember(PromiseTaskClosure,"PromiseTask");return PromiseTask}var PromiseTask=PromiseTaskClosure();function PromiseDependencyWorkersClosure(DependencyWorkers){var asyncProxyScriptBlob=self["asyncProxyScriptBlob"];function PromiseDependencyWorkers(scriptsToImport,ctorName,ctorArgs,promiseInputRetreiver){var inputRetreiver=createInputRetreiverWrapper(promiseInputRetreiver);DependencyWorkers.call(this,scriptsToImport,ctorName,ctorArgs,inputRetreiver);if(!promiseInputRetreiver["getDependsOnTasks"])throw"AsyncProxy.DependencyWorkers: No "+"promiseInputRetreiver.getDependsOnTasks() method";if(!promiseInputRetreiver["preWorkerProcess"])throw"AsyncProxy.DependencyWorkers: No "+
"promiseInputRetreiver.preWorkerProcess() method";if(!promiseInputRetreiver["getHashCode"])throw"AsyncProxy.DependencyWorkers: No "+"promiseInputRetreiver.getHashCode() method";if(!promiseInputRetreiver["isEqual"])throw"AsyncProxy.DependencyWorkers: No "+"promiseInputRetreiver.isEqual() method";}PromiseDependencyWorkers.prototype=Object.create(DependencyWorkers.prototype);PromiseDependencyWorkers.prototype.startTaskPromise=function startTaskPromise(taskKey){var that=this;return new Promise(function(resolve,
reject){var taskHandle=that.startTask(taskKey,{"onData":onData,"onTerminated":onTerminated});var hasData=taskHandle.hasData();var result;if(hasData)result=taskHandle.getLastData();function onData(data){hasData=true;result=data}function onTerminated(){if(hasData)resolve(result);else reject("AsyncProxy.PromiseDependencyWorkers: Internal "+"error - task terminated but no data returned")}})};function createInputRetreiverWrapper(promiseInputRetreiver){return{_promiseInputRetreiver:promiseInputRetreiver,
"createTaskContext":function(taskKey,callbacks){var that=this;var dependsOnTasks=that._promiseInputRetreiver["getDependsOnTasks"](taskKey);return new PromiseTask(taskKey,dependsOnTasks,that._promiseInputRetreiver,callbacks)},"getHashCode":function(key){var that=this;return that._promiseInputRetreiver["getHashCode"](key)},"isEqual":function(key1,key2){var that=this;return that._promiseInputRetreiver["isEqual"](key1,key2)}}}asyncProxyScriptBlob.addMember(PromiseDependencyWorkersClosure,"PromiseDependencyWorkers",
null,"DependencyWorkers");return PromiseDependencyWorkers}var PromiseDependencyWorkers=PromiseDependencyWorkersClosure(DependencyWorkers);function ExportAsyncProxySymbolsClosure(){function ExportAsyncProxySymbols(SubWorkerEmulationForChrome,AsyncProxySlaveSingleton,AsyncProxyMaster,ScriptsToImportPool,DependencyWorkers,DependencyWorkersTaskHandle,PromiseTask,PromiseDependencyWorkers){self["AsyncProxy"]=self["AsyncProxy"]||{};SubWorkerEmulationForChrome.prototype["postMessage"]=SubWorkerEmulationForChrome.prototype.postMessage;SubWorkerEmulationForChrome.prototype["terminate"]=SubWorkerEmulationForChrome.prototype.terminate;AsyncProxySlaveSingleton["setSlaveSideCreator"]=
AsyncProxySlaveSingleton.setSlaveSideCreator;AsyncProxySlaveSingleton["setBeforeOperationListener"]=AsyncProxySlaveSingleton.setBeforeOperationListener;AsyncProxySlaveSingleton["sendUserDataToMaster"]=AsyncProxySlaveSingleton.sendUserDataToMaster;AsyncProxySlaveSingleton["wrapPromiseFromSlaveSide"]=AsyncProxySlaveSingleton.wrapPromiseFromSlaveSide;AsyncProxySlaveSingleton["wrapCallbackFromSlaveSide"]=AsyncProxySlaveSingleton.wrapCallbackFromSlaveSide;AsyncProxyMaster.prototype["setUserDataHandler"]=
AsyncProxyMaster.prototype.setUserDataHandler;AsyncProxyMaster.prototype["terminate"]=AsyncProxyMaster.prototype.terminate;AsyncProxyMaster.prototype["callFunction"]=AsyncProxyMaster.prototype.callFunction;AsyncProxyMaster.prototype["wrapCallback"]=AsyncProxyMaster.prototype.wrapCallback;AsyncProxyMaster.prototype["freeCallback"]=AsyncProxyMaster.prototype.freeCallback;AsyncProxyMaster["getEntryUrl"]=AsyncProxyMaster.getEntryUrl;ScriptsToImportPool.prototype["addScriptFromErrorWithStackTrace"]=ScriptsToImportPool.prototype.addScriptFromErrorWithStackTrace;
ScriptsToImportPool.prototype["getScriptsForWorkerImport"]=ScriptsToImportPool.prototype.getScriptsForWorkerImport;DependencyWorkers.prototype["startTask"]=DependencyWorkers.prototype.startTask;DependencyWorkers.prototype["getTaskContext"]=DependencyWorkers.prototype.getTaskContext;DependencyWorkersTaskHandle.prototype["hasData"]=DependencyWorkersTaskHandle.prototype.hasData;DependencyWorkersTaskHandle.prototype["getLastData"]=DependencyWorkersTaskHandle.prototype.getLastData;DependencyWorkersTaskHandle.prototype["setPriority"]=
DependencyWorkersTaskHandle.prototype.setPriority;DependencyWorkersTaskHandle.prototype["unregister"]=DependencyWorkersTaskHandle.prototype.unregister;PromiseTask.prototype["onDependencyTaskResult"]=PromiseTask.prototype.onDependencyTaskResult;PromiseTask.prototype["statusUpdated"]=PromiseTask.prototype.statusUpdated;PromiseDependencyWorkers.prototype["startTaskPromise"]=PromiseDependencyWorkers.prototype.startTaskPromise}asyncProxyScriptBlob.addMember(ExportAsyncProxySymbolsClosure,"ExportAsyncProxySymbols");
asyncProxyScriptBlob.addStatement("ExportAsyncProxySymbols("+"SubWorkerEmulationForChrome, AsyncProxySlaveSingleton, AsyncProxyMaster, ScriptsToImportPool, "+"DependencyWorkers, DependencyWorkersTaskHandle, PromiseTask, PromiseDependencyWorkers);");asyncProxyScriptBlob.addStatement("self['AsyncProxy']['AsyncProxySlaveSingleton'] = AsyncProxySlaveSingleton;");asyncProxyScriptBlob.addStatement("self['AsyncProxy']['AsyncProxyMaster'] = AsyncProxyMaster;");asyncProxyScriptBlob.addStatement("self['AsyncProxy']['ScriptsToImportPool'] = ScriptsToImportPool;");
asyncProxyScriptBlob.addStatement("self['AsyncProxy']['DependencyWorkers'] = DependencyWorkers;");asyncProxyScriptBlob.addStatement("self['AsyncProxy']['PromiseTask'] = PromiseTask;");asyncProxyScriptBlob.addStatement("self['AsyncProxy']['PromiseDependencyWorkers'] = PromiseDependencyWorkers;");return ExportAsyncProxySymbols}
ExportAsyncProxySymbolsClosure()(SubWorkerEmulationForChrome,AsyncProxySlaveSingleton,AsyncProxyMaster,ScriptsToImportPool,DependencyWorkers,DependencyWorkersTaskHandle,PromiseTask,PromiseDependencyWorkers);self["AsyncProxy"]["AsyncProxySlaveSingleton"]=AsyncProxySlaveSingleton;self["AsyncProxy"]["AsyncProxyMaster"]=AsyncProxyMaster;self["AsyncProxy"]["ScriptsToImportPool"]=ScriptsToImportPool;self["AsyncProxy"]["DependencyWorkers"]=DependencyWorkers;self["AsyncProxy"]["PromiseTask"]=PromiseTask;
self["AsyncProxy"]["PromiseDependencyWorkers"]=PromiseDependencyWorkers;
