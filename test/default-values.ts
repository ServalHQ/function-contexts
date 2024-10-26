import { describe, expect, test } from '@jest/globals';
import { createFunctionContext, getFunctionContext } from '../src/lib';
// Check for null and undefined values

describe("default value contexts", () => {
    test("numeric value", async () => {
        const context = createFunctionContext(111);
        await context.run(() => {
            expect(getFunctionContext(context)).toBe(111);
        });
    });

    test("null value", async () => {
        const context = createFunctionContext<null | string>(null);
        await context.run(() => {
            expect(getFunctionContext(context)).toBe(null);
        });
        
        await context.run(() => {
            expect(getFunctionContext(context)).toBe("hello");
        }, "hello");
    });

    test("undefined value", async () => {
        const context = createFunctionContext<undefined | string>(undefined);
        await context.run(() => {
            expect(getFunctionContext(context)).toBe(undefined);
        });
        
        await context.run(() => {
            expect(getFunctionContext(context)).toBe("world");
        }, "world");
    });
});