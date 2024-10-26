"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFunctionContext = exports.createFunctionContext = void 0;
var context_id_1 = require("./context-id");
var contextProvider = new context_id_1.CallStackContextIdProvider();
var kContextValues = new Map();
var FunctionContextImplementation = /** @class */ (function () {
    function FunctionContextImplementation(hasDefaultValue, defaultValue) {
        this.hasDefaultValue = hasDefaultValue;
        this.defaultValue = defaultValue;
    }
    FunctionContextImplementation.prototype.getDefaultValue = function () {
        if (!this.hasDefaultValue) {
            throw new Error("Missing context value");
        }
        return this.defaultValue;
    };
    FunctionContextImplementation.prototype.getCurrentValue = function () {
        var contextId = contextProvider.getCurrentContextId();
        if (contextId === null) {
            if (!this.hasDefaultValue) {
                throw new Error("Current call stack yields no value for context");
            }
            return this.defaultValue;
        }
        if (!kContextValues.has(contextId)) {
            throw new Error("Could not resolved context value for context id ".concat(contextId));
        }
        return kContextValues.get(contextId);
    };
    FunctionContextImplementation.prototype.run = function (target, context) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var contextValue = arguments.length >= 2 ? context : this.getDefaultValue();
        var _a = contextProvider.createContextExecutor(), contextId = _a[0], wrapper = _a[1];
        var cleanup = function () { return kContextValues.delete(contextId); };
        kContextValues.set(contextId, contextValue);
        try {
            return wrapper.apply(void 0, __spreadArray([target], args, false)).finally(cleanup);
        }
        catch (error) {
            cleanup();
            throw error;
        }
    };
    return FunctionContextImplementation;
}());
function createFunctionContext(defaultValue) {
    if (arguments.length > 0) {
        /* we have a default argument. */
        return new FunctionContextImplementation(true, defaultValue);
    }
    else {
        return new FunctionContextImplementation(false, undefined);
    }
}
exports.createFunctionContext = createFunctionContext;
function getFunctionContext(context) {
    if (!(context instanceof FunctionContextImplementation)) {
        throw new Error("Context provided is invalid");
    }
    return context.getCurrentValue();
}
exports.getFunctionContext = getFunctionContext;
