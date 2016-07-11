'use strict';

function ExportAsyncProxySymbolsClosure() {
    function ExportAsyncProxySymbols(SubWorkerEmulationForChrome, AsyncProxySlaveSingleton, AsyncProxyMaster, ScriptsToImportPool, UniqueWorkers) {
        self['AsyncProxy'] = self['AsyncProxy'] || {};

        SubWorkerEmulationForChrome.prototype['postMessage'] = SubWorkerEmulationForChrome.prototype.postMessage;
        SubWorkerEmulationForChrome.prototype['terminate'] = SubWorkerEmulationForChrome.prototype.terminate;

        AsyncProxySlaveSingleton['setSlaveSideCreator'] = AsyncProxySlaveSingleton.setSlaveSideCreator;
        AsyncProxySlaveSingleton['setBeforeOperationListener'] = AsyncProxySlaveSingleton.setBeforeOperationListener;
        AsyncProxySlaveSingleton['sendUserDataToMaster'] = AsyncProxySlaveSingleton.sendUserDataToMaster;
        AsyncProxySlaveSingleton['wrapPromiseFromSlaveSide'] = AsyncProxySlaveSingleton.wrapPromiseFromSlaveSide;
        AsyncProxySlaveSingleton['wrapCallbackFromSlaveSide'] = AsyncProxySlaveSingleton.wrapCallbackFromSlaveSide;

        AsyncProxyMaster.prototype['setUserDataHandler'] = AsyncProxyMaster.prototype.setUserDataHandler;
        AsyncProxyMaster.prototype['terminate'] = AsyncProxyMaster.prototype.terminate;
        AsyncProxyMaster.prototype['callFunction'] = AsyncProxyMaster.prototype.callFunction;
        AsyncProxyMaster.prototype['wrapCallback'] = AsyncProxyMaster.prototype.wrapCallback;
        AsyncProxyMaster.prototype['freeCallback'] = AsyncProxyMaster.prototype.freeCallback;
        AsyncProxyMaster['getEntryUrl'] = AsyncProxyMaster.getEntryUrl;

        ScriptsToImportPool.prototype['addScriptFromErrorWithStackTrace'] = ScriptsToImportPool.prototype.addScriptFromErrorWithStackTrace;
        ScriptsToImportPool.prototype['getScriptsForWorkerImport'] = ScriptsToImportPool.prototype.getScriptsForWorkerImport;
        
        UniqueWorkers.prototype['startTask'] = UniqueWorkers.prototype.startTask;
    }
    
    asyncProxyScriptBlob.addMember(ExportAsyncProxySymbolsClosure, 'ExportAsyncProxySymbols');
    asyncProxyScriptBlob.addStatement('ExportAsyncProxySymbols(SubWorkerEmulationForChrome, AsyncProxySlaveSingleton, AsyncProxyMaster, ScriptsToImportPool, UniqueWorkers);');
    asyncProxyScriptBlob.addStatement("self['AsyncProxy']['AsyncProxySlaveSingleton'] = AsyncProxySlaveSingleton;");
    asyncProxyScriptBlob.addStatement("self['AsyncProxy']['AsyncProxyMaster'] = AsyncProxyMaster;");
    asyncProxyScriptBlob.addStatement("self['AsyncProxy']['ScriptsToImportPool'] = ScriptsToImportPool;");
    asyncProxyScriptBlob.addStatement("self['AsyncProxy']['UniqueWorkers'] = UniqueWorkers;");
    
    return ExportAsyncProxySymbols;
}

(ExportAsyncProxySymbolsClosure())(SubWorkerEmulationForChrome, AsyncProxySlaveSingleton, AsyncProxyMaster, ScriptsToImportPool, UniqueWorkers);
self['AsyncProxy']['AsyncProxySlaveSingleton'] = AsyncProxySlaveSingleton;
self['AsyncProxy']['AsyncProxyMaster'] = AsyncProxyMaster;
self['AsyncProxy']['ScriptsToImportPool'] = ScriptsToImportPool;
self['AsyncProxy']['UniqueWorkers'] = UniqueWorkers;