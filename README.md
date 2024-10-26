# Function Contexts
React like contexts for sync and async functions.

Note: This is a fork of https://www.npmjs.com/package/function-contexts with
a fix for a type issue.

## Example
```ts
import { createFunctionContext, getFunctionContext } from "function-contexts";

const kMyContext = createFunctionContext<number>();

function printContextValue() {
    console.log(`MyContext value: ${getFunctionContext(kMyContext)}`)
}

async function withContext() {
    printContextValue();
    await new Promise(resolve => setTimeout(resolve, 1000));
    printContextValue();
}

async function main() {
    await kMyContext.run(withContext, 1234);
}

main().catch(error => {
    console.error("main() encountered a critical error: %o", error);
});
```