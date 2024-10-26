export interface ContextIdProvider {
    createContextExecutor() : [ number, (target: Function, ...args: any[]) => Promise<any> ];
    getCurrentContextId() : number | null;
}

export class CallStackContextIdProvider implements ContextIdProvider {
    private readonly contextIdFunctionPrefix = "__function_context_id__";
    private readonly contextIdRegex = new RegExp(`${this.contextIdFunctionPrefix}([0-9]+)`);
    private readonly proxyFunctionTemplate = `
        wrapper = async function ${this.contextIdFunctionPrefix}%%context-id%%(target, ...args) {
            return await target.call(undefined, ...args);
        }
    `;

    private contextIdOffset = 0;

    


    createContextExecutor() : [ number, (target: Function, ...args: any[]) => Promise<any> ] {
        const contextId = ++this.contextIdOffset;
        let wrapper: Function;
        eval(
            this.proxyFunctionTemplate.replace("%%context-id%%", contextId.toString())
        );

        return [
            contextId,
            wrapper! as any
        ];
    }

    getCurrentContextId() : number | null {
        const stack = new Error().stack;
        if(!stack) {
            console.error("Call stack undefined. Can't return a context id.");
            throw new Error("call stack unknown");
        }

        for(const frame of stack.split("\n")) {
            const match = frame.match(this.contextIdRegex);
            if(!match) {
                continue;
            }

            const id = parseInt(match[1]!);
            if(isNaN(id)) {
                console.warn(`Context id regex matched, but failed to parse context id from ${match[1]}`);
                continue;
            }

            return id;
        }

        return null;
    }
}