import { CallStackContextIdProvider, ContextIdProvider } from "./context-id";

interface FunctionContext<T> {
    run<R, Args>(target: (...args: Args[]) => R, context: T, ...args: Args[]) : Promise<R>;
}

interface DefaultedFunctionContext<T> {
    readonly defaultValue: T,

    run<R, Args>(target: (...args: Args[]) => R, context?: T, ...args: Args[]) : Promise<R>;
}

const contextProvider: ContextIdProvider = new CallStackContextIdProvider();
const kContextValues: Map<number, any> = new Map();
class FunctionContextImplementation<T> implements FunctionContext<T>, DefaultedFunctionContext<T> {
    readonly defaultValue: T;
    readonly hasDefaultValue: boolean;

    constructor(hasDefaultValue: boolean, defaultValue: T) {
        this.hasDefaultValue = hasDefaultValue;
        this.defaultValue = defaultValue;
    }

    private getDefaultValue() : T {
        if(!this.hasDefaultValue) {
            throw new Error("Missing context value");
        }

        return this.defaultValue;
    }

    getCurrentValue() : T {
        const contextId = contextProvider.getCurrentContextId();
        if(contextId === null) {
            if(!this.hasDefaultValue) {
                throw new Error("Current call stack yields no value for context");
            }

            return this.defaultValue;
        }

        if(!kContextValues.has(contextId)) {
            throw new Error(`Could not resolved context value for context id ${contextId}`);
        }

        return kContextValues.get(contextId);
    }

    run<R, Args>(target: (...args: Args[]) => R, context: T, ...args: Args[]): Promise<R> {
        const contextValue = arguments.length >= 2 ? context : this.getDefaultValue();
        const [ contextId, wrapper ] = contextProvider.createContextExecutor();

        const cleanup = () => kContextValues.delete(contextId);
        kContextValues.set(contextId, contextValue);

        try {
            return wrapper(target, ...args).finally(cleanup);
        } catch(error) {
            cleanup();
            throw error;
        }
    }
}

export function createFunctionContext<T>() : FunctionContext<T>;
export function createFunctionContext<T>(defaultValue: T) : DefaultedFunctionContext<T>;

export function createFunctionContext<T>(defaultValue?: T) : FunctionContext<T> | DefaultedFunctionContext<T> {
    if(arguments.length > 0) {
        /* we have a default argument. */
        return new FunctionContextImplementation<T>(true, defaultValue!);
    } else {
        return new FunctionContextImplementation<T>(false, undefined as T);
    }
}

export function getFunctionContext<T>(context: FunctionContext<T> | DefaultedFunctionContext<T>) : T {
    if(!(context instanceof FunctionContextImplementation)) {
        throw new Error("Context provided is invalid");
    }

    return context.getCurrentValue();
}